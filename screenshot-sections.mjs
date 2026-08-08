import puppeteer from 'puppeteer';
import { existsSync, mkdirSync } from 'fs';
import { join } from 'path';

const url = process.argv[2] || 'http://localhost:3000';
const viewport = process.argv[3] === 'mobile'
  ? { width: 390, height: 844 }
  : { width: 1440, height: 900 };
const label = process.argv[3] || 'desktop';
const dir = './temporary screenshots/sections';
if (!existsSync(dir)) mkdirSync(dir, { recursive: true });

const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
const page = await browser.newPage();
await page.setViewport(viewport);
await page.goto(url, { waitUntil: 'networkidle0', timeout: 30000 });

const totalHeight = await page.evaluate(() => document.body.scrollHeight);
const step = viewport.height;
let i = 0;
for (let y = 0; y < totalHeight; y += step) {
  await page.evaluate((y) => window.scrollTo(0, y), y);
  await new Promise(r => setTimeout(r, 150));
  const outPath = join(dir, `${label}-${String(i).padStart(2,'0')}.png`);
  await page.screenshot({ path: outPath });
  console.log(`Saved: ${outPath}`);
  i++;
}
await browser.close();
