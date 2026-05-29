const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  try {
    await page.goto('http://localhost:5173/p/demo/demo-gallery', { waitUntil: 'domcontentloaded', timeout: 10000 });
    // wait for photos to render
    await page.waitForSelector('img', { timeout: 5000 });
    // open first photo by clicking
    await page.click('div.group div img');
    // wait for lightbox Buy Print link
    await page.waitForSelector('a[href^="/shop/"]', { timeout: 5000 });
    const buyHref = await page.getAttribute('a[href^="/shop/"]', 'href');
    console.log('Found buy link href=', buyHref);
    // click the buy link
    await page.click('a[href^="/shop/"]');
    // wait for navigation to shop page
    await page.waitForURL('**/shop/**', { timeout: 5000 });
    // check for Buy Now or Add to Cart buttons
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
