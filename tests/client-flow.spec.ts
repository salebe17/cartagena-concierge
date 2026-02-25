import { test, expect } from '@playwright/test';

test.describe('Client Service Request Flow', () => {
    // We use page.route to mock Supabase API responses for exhaustive UI state testing
    // without polluting the production database or requiring real OTP emails.

    test.beforeEach(async ({ page }) => {
        // Mock the Supabase Session check to simulate a logged-in 'client'
        await page.route('**/auth/v1/user', async (route) => {
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({
                    id: 'mock-client-uuid',
                    aud: 'authenticated',
                    role: 'authenticated',
                    email: 'test-client@fairbid.com',
                }),
            });
        });

        // Go to the new request page
        await page.goto('/client/request/new');
    });

    test('Should render the New Request form correctly', async ({ page }) => {
        await expect(page.locator('h1:has-text("Name Your Price")')).toBeVisible();
        await expect(page.locator('button', { hasText: 'maintenance' })).toBeVisible();
        await expect(page.locator('input[placeholder*="Palmetto"]')).toBeVisible();
    });

    test('Should prevent submission if required fields are missing', async ({ page }) => {
        // Clear default address
        await page.fill('input[placeholder*="Palmetto"]', '');

        // Attempt submission without description
        await page.click('button[type="submit"]');

        // HTML5 validation or Zod should catch the missing description
        const descriptionBox = page.locator('textarea');
        // Ensure the form hasn't navigated away
        await expect(page).toHaveURL(/\/client\/request\/new/);
    });

    test('Should simulate AI Smart Enhance loading state', async ({ page }) => {
        // Type a short description
        await page.fill('textarea', 'AC is broken');

        // Intercept the AI SDK call
        await page.route('**/api/ai/enhance', async (route) => {
            // Delay response to simulate AI processing
            await new Promise((resolve) => setTimeout(resolve, 500));
            await route.fulfill({
                status: 200,
                body: 'The air conditioning unit in the master bedroom is malfunctioning and leaking water.',
            });
        });

        await page.click('button:has-text("Smart Enhance")');

        // Check loading indicator appears
        await expect(page.locator('.animate-spin')).toBeVisible();

        // Verify ai text replaced the old text
        await expect(page.locator('textarea')).toHaveValue(/The air conditioning unit/);
    });

    test('Should successfully map and submit a valid service request', async ({ page }) => {
        // Mock successful insertion response
        await page.route('**/rest/v1/service_requests*', async (route) => {
            if (route.request().method() === 'POST') {
                await route.fulfill({
                    status: 201,
                    contentType: 'application/json',
                    body: JSON.stringify([{ id: 'mock-request-uuid' }]),
                });
            } else {
                await route.continue();
            }
        });

        // Mock the Ghost property retrieval
        await page.route('**/rest/v1/properties*', async (route) => {
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify([{ id: 'mock-property-uuid' }]),
            });
        });

        // Fill form
        await page.fill('input[placeholder*="Palmetto"]', 'Cartagena Bocagrande');
        await page.fill('textarea', 'Clean the entire apartment');
        await page.fill('input[type="number"]', '80000');

        await page.click('button[type="submit"]');

        // Expect redirect to the request tracking page
        await expect(page).toHaveURL(/\/client\/request\/mock-request-uuid/);
    });
});
