import { chromium } from 'playwright';

(async () => {
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();

    page.on('console', msg => {
        console.log(`BROWSER-CONSOLE: ${msg.type()}: ${msg.text()}`);
    });

    page.on('pageerror', error => {
        console.log(`BROWSER-ERROR: ${error.message}`);
    });

    await page.goto('http://localhost:5173/organization');
    await new Promise(r => setTimeout(r, 2000));
    await browser.close();
})().catch(err => {
    console.log('SCRIPT-ERROR:', err);
    process.exit(1);
});
