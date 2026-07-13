const puppeteer = require('puppeteer-core');

(async () => {
  const browser = await puppeteer.launch({
    executablePath: '/usr/bin/chromium',
    headless: true,
    args: ['--no-sandbox', '--disable-gpu', '--disable-dev-shm-usage'],
  });
  const page = await browser.newPage();
  const errors = [];
  const consoleMessages = [];
  page.on('console', (msg) => {
    consoleMessages.push(`[${msg.type()}] ${msg.text()}`);
  });
  page.on('pageerror', (err) => {
    errors.push(`[PAGE ERROR] ${err.message}\n${err.stack || ''}`);
  });
  await page.goto('http://localhost:8080/', { waitUntil: 'networkidle0', timeout: 30000 });
  await new Promise(r => setTimeout(r, 5000));
  const rootContent = await page.evaluate(() => document.getElementById('root')?.innerHTML?.slice(0, 1000) || 'EMPTY');
  console.log('=== CONSOLE MESSAGES ===');
  consoleMessages.forEach(m => console.log(m));
  console.log('\n=== PAGE ERRORS ===');
  errors.forEach(e => console.log(e));
  console.log('\n=== ROOT CONTENT ===');
  console.log(rootContent);
  await browser.close();
})();
