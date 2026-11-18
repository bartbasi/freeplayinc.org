// Takes the screenshot of this site used in its own "Web sites" section, and the social card.
// Start the local server first: node tools/serve.js
const { chromium } = require('playwright-core');
const path = require('path');
const url = process.argv[2] || 'http://127.0.0.1:4180/';
(async () => {
  let browser;
  try { browser = await chromium.launch({ channel: 'msedge' }); }
  catch (e) { browser = await chromium.launch({ channel: 'chrome' }); }

  // Tall capture for the window in the web section.
  let ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1.5 });
  let page = await ctx.newPage();
  await page.goto(url, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1800);
  await page.evaluate(async () => {
    for (let y = 0; y <= 1900; y += 300) { window.scrollTo(0, y); await new Promise(r => setTimeout(r, 350)); }
    window.scrollTo(0, 0);
  });
  await page.waitForTimeout(1500);
  await page.screenshot({ path: path.join(__dirname, '..', 'src', 'originals', 'web', 'freeplayinc.png'), fullPage: true, clip: { x: 0, y: 0, width: 1440, height: 2700 } });
  await ctx.close();

  // Social card, 1200 x 630.
  ctx = await browser.newContext({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
  page = await ctx.newPage();
  await page.goto(url, { waitUntil: 'networkidle' });
  await page.addStyleTag({ content: '.head .nav, .head__tools, .hero__row { display: none !important; } .hero { min-height: 630px !important; height: 630px; } .mega { margin-top: auto !important; margin-bottom: auto !important; }' });
  await page.evaluate(() => window.dispatchEvent(new Event('resize')));
  await page.waitForTimeout(2200);
  await page.screenshot({ path: path.join(__dirname, '..', 'public', 'og.png') });
  await browser.close();
  console.log('done');
})();
