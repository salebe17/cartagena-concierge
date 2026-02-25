import { test, expect } from '@playwright/test';

test.describe('Technician Radar & Bidding Mechanics', () => {

    test.beforeEach(async ({ page }) => {
        // Escalate privileges to 'technician'
        await page.route('**/auth/v1/user', async (route) => {
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({
                    id: 'mock-tech-uuid',
                    aud: 'authenticated',
                    role: 'authenticated',
                    email: 'test-tech@fairbid.com',
                }),
            });
        });

        // Mock Profile to return Technician role and connected Stripe Account
        await page.route('**/rest/v1/profiles*', async (route) => {
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify([{ role: 'technician', stripe_account_id: 'acct_123', stripe_account_status: 'active' }]),
            });
        });

        await page.goto('/technician/dashboard');
    });

    test('Should render the Live Radar feed of pending requests', async ({ page }) => {
        // Mock the pending requests API
        await page.route('**/rest/v1/service_requests*', async (route) => {
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify([
                    {
                        id: 'req-01',
                        service_type: 'cleaning',
                        description: 'Deep clean for 3 bedroom apartment',
                        offered_price: 150000,
                        status: 'pending',
                        created_at: new Date().toISOString()
                    }
                ]),
            });
        });

        await expect(page.locator('h1', { hasText: 'Live Radar' })).toBeVisible();
        await expect(page.locator('h3', { hasText: 'Deep clean for 3 bedroom apartment' })).toBeVisible();
        await expect(page.locator('text=$150,000 COP')).toBeVisible();
    });

    test('Should allow Technician to view details and submit a counter-bid', async ({ page }) => {
        // Navigate straight to a mock request detail page
        await page.goto('/technician/request/req-01');

        await expect(page.locator('h1', { hasText: 'Service Details' })).toBeVisible();

        // Fill in a counter bid
        await page.fill('input[type="number"]', '170000');

        // Mock the bid insertion
        await page.route('**/rest/v1/bids*', async (route) => {
            if (route.request().method() === 'POST') {
                const payload = JSON.parse(route.request().postData() || '{}');
                expect(payload.amount).toBe(170000);
                await route.fulfill({
                    status: 201,
                    body: JSON.stringify([{ id: 'bid-01', amount: 170000 }])
                });
            } else {
                await route.continue();
            }
        });

        await page.click('button:has-text("Submit Counter-Offer")');
        await expect(page.locator('text=Bid Submitted Successfully')).toBeVisible();
    });
});
