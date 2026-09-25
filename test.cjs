const puppeteer = require('puppeteer'); 
(async () => { 
  const browser = await puppeteer.launch(); 
  const page = await browser.newPage(); 
  page.on('console', msg => console.log('BROWSER CONSOLE:', msg.text())); 
  page.on('pageerror', err => console.log('BROWSER ERROR:', err.toString())); 
  await page.goto('http://127.0.0.1:5010/showcase'); 
  await page.waitForSelector('app-button'); 
  const btns = await page.$$('app-button'); 
  for(let btn of btns) { 
    try {
      await btn.click(); 
      await new Promise(r => setTimeout(r, 100)); 
    } catch(e) {}
  } 
  
  await page.goto('http://127.0.0.1:5010/crud'); 
  await page.waitForSelector('app-button'); 
  const btns2 = await page.$$('app-button'); 
  for(let btn of btns2) { 
    try {
      await btn.click(); 
      await new Promise(r => setTimeout(r, 100)); 
    } catch(e) {}
  }

  await browser.close(); 
})();
