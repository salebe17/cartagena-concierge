import { test, expect } from '@playwright/test';

// Helper to inject a valid-looking Supabase Auth Cookie to bypass Next.js Edge Middleware
// Middleware strictly checks for `sb-[project-ref]-auth-token`
const injectAuthCookie = async (context: any, role: 'client' | 'technician' | 'admin') => {
    const mockJwt = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdWQiOiJhdXRoZW50aWNhdGVkIiwicm9sZSI6ImF1dGhlbnRpY2F0ZWQiLCJleHAiOjk5OTk5OTk5OTl9.signature';

    await context.addCookies([
        {
            name: 'x-playwright-mock-role',
            value: role,
            domain: 'localhost',
            path: '/',
        }
    ]);

    // Also inject localStorage for client-side supabase-js
    return await context.addInitScript(`
        window.localStorage.setItem('sb-localhost-auth-token', JSON.stringify({
            access_token: "${mockJwt}",
            refresh_token: "mock-refresh",
            user: {
                id: "mock-${role}-uuid",
                aud: "authenticated",
                role: "authenticated",
                email: "test-${role}@fairbid.com",
            }
        }));
    `);
};

test.describe('Edge Router Protections & Admin Role Enforcement', () => {

    test('Should block anonymous users from the Client, Tech, and Admin dashboards', async ({ page }) => {
        // No cookies injected
        const protectedRoutes = ['/client/dashboard', '/technician/dashboard', '/admin/dashboard'];

        for (const route of protectedRoutes) {
            await page.goto(route);
            // Next.js Edge Middleware should catch the missing cookie and redirect to /login
            await expect(page).toHaveURL(/.*\/login/);
        }
    });

    test('Should block Clients from accessing the Command Center', async ({ page, context }) => {
        await injectAuthCookie(context, 'client');

        // Mock the User Profile query that the middleware performs
        await page.route('**/rest/v1/profiles*', async (route) => {
            await route.fulfill({
                status: 200,
                body: JSON.stringify([{ role: 'client' }]),
            });
        });

        await page.goto('/admin/dashboard');
        // Middleware checks `profile.role` and kicks them to /client/dashboard
        await expect(page).toHaveURL(/\/client\/dashboard/);
    });

    test('Should permit genuine Admins into the Command Center', async ({ page, context }) => {
        await injectAuthCookie(context, 'admin');

        await page.route('**/rest/v1/profiles*', async (route) => {
            await route.fulfill({
                status: 200,
                body: JSON.stringify([{ role: 'admin' }]),
            });
        });

        await page.goto('/admin/finance');

        // Access is granted, page should load the treasury dashboard
        await expect(page.locator('h1', { hasText: 'Treasury & Escrow' })).toBeVisible({ timeout: 10000 });
    });
});
