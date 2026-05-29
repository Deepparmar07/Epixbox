import { chromium } from 'playwright';

;(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  try {
    await page.goto('http://localhost:5173/p/demo/demo-gallery', { waitUntil: 'domcontentloaded', timeout: 15000 });
    await page.waitForSelector('img', { timeout: 8000 });
    await page.click('div.group div img');
    await page.waitForSelector('a[href^="/shop/"]', { timeout: 8000 });
    const buyHref = await page.getAttribute('a[href^="/shop/"]', 'href');
    console.log('Found buy link href=', buyHref);
    await page.click('a[href^="/shop/"]');
    await page.waitForURL('**/shop/**', { timeout: 8000 });
    const buyNow = await page.$('button:has-text("Buy Now")');
    const addToCart = await page.$('button:has-text("Add to Cart")');
    console.log('Buy Now present:', !!buyNow, 'Add to Cart present:', !!addToCart);
    if (!buyNow && !addToCart) {
      console.error('Shop page did not show expected purchase buttons');
      process.exitCode = 2;
    } else {
      console.log('E2E demo flow OK');
    }
  } catch (err) {
    console.error('E2E script error:', err);
    process.exitCode = 3;
  } finally {
    await browser.close();
  }
})();
