// Takes the web site screenshots used in the "Web sites" section.
// Usage: node tools/shots.js
const { chromium } = require('playwright-core');
const path = require('path');
const fs = require('fs');

const sites = [
  ['bartbasi', 'https://bartbasi.com/'],
  ['crackerscheese', 'https://crackerscheese.com/'],
  ['crackerscheese-new', 'https://new.crackerscheese.com/'],
  ['cupm', 'https://cupm.net/'],
  ['financeillinois', 'https://financeillinois.com/'],
];
const out = path.join(__dirname, '..', 'src', 'originals', 'web');
fs.mkdirSync(out, { recursive: true });

(async () => {
  let browser;
  try { browser = await chromium.launch({ channel: 'msedge' }); }
  catch (e) { browser = await chromium.launch({ channel: 'chrome' }); }
  for (const [name, url] of sites) {
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1.5 });
    const page = await ctx.newPage();
    try {
      const res = await page.goto(url, { waitUntil: 'networkidle', timeout: 45000 }).catch(async () => page.goto(url, { waitUntil: 'load', timeout: 45000 }));
      await page.waitForTimeout(2500);
      // Scroll through once so lazy images load, then return to the top.
      await page.evaluate(async () => {
        for (let y = 0; y < 2600; y += 400) { window.scrollTo(0, y); await new Promise(r => setTimeout(r, 200)); }
        window.scrollTo(0, 0);
      });
      await page.waitForTimeout(1200);
      const h = await page.evaluate(() => document.documentElement.scrollHeight);
      await page.screenshot({ path: path.join(out, name + '.png'), fullPage: true, clip: { x: 0, y: 0, width: 1440, height: Math.min(h, 2700) } });
      const info = await page.evaluate(() => ({
        title: document.title,
        gen: (document.querySelector('meta[name=generator]') || {}).content || '',
        desc: (document.querySelector('meta[name=description]') || {}).content || '',
        footer: (document.querySelector('footer') || { innerText: '' }).innerText.replace(/\s+/g, ' ').slice(0, 400),
      }));
      console.log(name, res && res.status(), page.url(), 'h=' + h, JSON.stringify(info));
    } catch (e) { console.log(name, 'FAILED', e.message.split('\n')[0]); }
    await ctx.close();
  }
  await browser.close();
})();
