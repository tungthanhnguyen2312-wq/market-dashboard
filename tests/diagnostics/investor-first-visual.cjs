// Run against a local HTTP preview with Playwright available via NODE_PATH.
const { chromium } = require('playwright');
const fs = require('node:fs');
const assert = require('node:assert/strict');
(async () => {
  const browser = await chromium.launch({channel:'chrome',headless:true});
  const results=[];
  for (const width of [375,768,1024,1440]) {
    const page = await browser.newPage({viewport:{width,height:900}});
    const errors=[]; page.on('pageerror',e=>errors.push(e.message));
    for (const [name,route] of [
      ['home','dashboard.html'],['opportunities','investment-workspace.html'],
      ['explore','investment-workspace.html?view=explore'],['technical','investment-workspace.html?view=technical&ticker=HPG'],
      ['portfolio','portfolio.html'],['macro','macro.html'],['methods','about.html'],
      ['drawer','investment-workspace.html?ticker=HPG']
    ]) {
      await page.goto('http://localhost:8017/'+route);
      await page.waitForTimeout(700);
      if(name==='home') await page.waitForFunction(()=>document.querySelector('#home-opportunities a'));
      if(['opportunities','explore','technical','drawer'].includes(name)) await page.waitForSelector('#workspace:not([hidden])');
      if(name==='technical') { await page.keyboard.press('Escape'); await page.waitForTimeout(350); }
      if(name==='drawer') await page.waitForSelector('#decision-drawer.is-open');
      const measurement=await page.evaluate(()=>({width:innerWidth,scroll:document.documentElement.scrollWidth,
        text:document.body.innerText.replace(/\b(?:A32\nAAA)[\s\S]*?\nMở chi tiết mã/, 'Mở chi tiết mã')}));
      assert.ok(measurement.scroll<=width+1,`${name} overflow at ${width}: ${measurement.scroll}`);
      if(name==='explore'&&width<=768) {
        const table=await page.locator('#analysis-table').evaluate(el=>({width:el.offsetWidth,container:el.parentElement.clientWidth,overflow:getComputedStyle(el.parentElement).overflowX}));
        assert.ok(table.width>=720&&table.width>table.container&&table.overflow==='auto','deep research table must scroll within its container');
      }
      const leaked=measurement.text.match(/\b(?:localStorage|READY_FOR_AI|RAW_AS_TRADED|proxy|snapshot|Workspace|build|pipeline|artifact)\b|Bàn quyết định|Stored only in this browser|Add position|Clear\/reset/gi);
      await page.screenshot({path:`logs/ux-${name}-${width}.png`,fullPage:name!=='drawer'});
      results.push({name,width,scroll:measurement.scroll,leaked});
      assert.equal(leaked,null,`terminology leakage on ${name} at ${width}`);
      if(name==='home'&&width<1024) {
        await page.locator('#sidebar-toggle').click();
        assert.equal(await page.locator('#sidebar .vs-sidebar-link:visible').count(),5);
        await page.keyboard.press('Escape');
        assert.equal(await page.evaluate(()=>document.activeElement.id),'sidebar-toggle');
      }
      if(name==='opportunities') {
        await page.locator('#ws-open-selected-drawer').click();
        await page.waitForSelector('#decision-drawer.is-open');
        await page.keyboard.press('Escape');
        await page.waitForTimeout(350);
        assert.equal(await page.evaluate(()=>document.activeElement.id),'ws-open-selected-drawer');
        await page.locator('#ws-tab-opportunities').focus();
        await page.keyboard.press('ArrowRight');
        assert.equal(await page.locator('#ws-tab-explore').getAttribute('aria-selected'),'true');
      }
      if(name==='drawer') {
        await page.keyboard.press('Escape');
        await page.waitForTimeout(350);
        assert.equal(await page.locator('#decision-drawer').getAttribute('hidden'),'');
      }
    }
    assert.deepEqual(errors,[],`page errors at ${width}`);
    await page.close();
  }
  fs.writeFileSync('logs/ux-visual-results.json',JSON.stringify(results,null,2));
  console.log(JSON.stringify(results,null,2));
  await browser.close();
})().catch(e=>{console.error(e);process.exit(1)});
