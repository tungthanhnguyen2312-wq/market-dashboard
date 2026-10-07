"use strict";
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const home=require('../assets/js/dashboard-product-summary.js');
const ws=require('../assets/js/investment-workspace.js');
const shell=require('../assets/js/shell.js');
const index=JSON.parse(read('data/workspace_index.json'));
const summary=JSON.parse(read('data/dashboard_home_summary.json'));
const destinations=['dashboard.html','investment-workspace.html','portfolio.html','macro.html','archive.html'];
test('canonical analysis fields and export values match the authorized baseline for every published ticker',()=>{
  const {execFileSync}=require('node:child_process');
  const {createRequire}=require('node:module');
  const beforeSource=execFileSync('git',['show','67f9fd1c8e1503dfe08509177ad17a7e515ec19b:assets/js/investment-workspace.js'],{cwd:root,encoding:'utf8'});
  const sandbox={module:{exports:{}},require:createRequire(path.join(root,'assets/js/investment-workspace.js'))};
  vm.runInNewContext(beforeSource,sandbox);
  const before=sandbox.module.exports;
  for(const [ticker,card] of Object.entries(index.cards)){
    assert.equal(JSON.stringify(ws.analysisRecord(card)),JSON.stringify(before.analysisRecord(card)),ticker);
    const currentExport=ws.buildT0Export(ticker,card,index.source_artifact_identity);
    const beforeExport=before.buildT0Export(ticker,card,index.source_artifact_identity);
    // Wall-clock export time varies per call; it is not an investment/source value.
    delete currentExport.exported_at; delete beforeExport.exported_at;
    assert.equal(JSON.stringify(currentExport),JSON.stringify(beforeExport),ticker);
  }
});

// Remove scripts, styles and nested collapsed disclosures before scanning actual text.
function primaryText(html) {
  html=html.replace(/<script\b[\s\S]*?<\/script>|<style\b[\s\S]*?<\/style>|<!--[\s\S]*?-->/gi,'');
  let depth=0,out='';
  for(const token of html.match(/<[^>]+>|[^<]+/g)||[]) {
    if(/^<details\b/i.test(token)){depth++;continue;}
    if(/^<\/details/i.test(token)){depth--;continue;}
    if(!depth&&!token.startsWith('<'))out+=token+' ';
  }
  return out;
}
test('five exact destinations and Vietnamese naming agree across desktop/mobile markup',()=>{
  assert.deepEqual(shell.CANONICAL_PRIMARY_NAV.map(n=>n.href),destinations);
  assert.deepEqual(shell.CANONICAL_PRIMARY_NAV.map(n=>n.label),['Tổng quan','Cơ hội','Danh mục','Vĩ mô','Lịch sử']);
  for(const page of [...destinations,'about.html','signals.html','screener.html']){
    for(const nav of read(page).matchAll(/<nav class="vs-(?:topbar|sidebar)-nav"[^>]*>([\s\S]*?)<\/nav>/g)){
      assert.deepEqual([...nav[1].matchAll(/href="([^"]+)"/g)].map(m=>m[1]),destinations,page);
    }
  }
});
test('primary source and real rendered Home/drawer text reject backend and obsolete labels',()=>{
  const forbidden=/Bàn quyết định|Không gian quyết định|Mở Cơ hội|Đang đọc build|Bộ lọc tương thích|Stored only in this browser|Add position|Clear\/reset|Export JSON|Import JSON|Regime thị trường|\b(?:localStorage|READY_FOR_AI|RAW_AS_TRADED|snapshot|proxy|Workspace|build|pipeline|artifact)\b/;
  for(const p of [...destinations,'about.html'])assert.doesNotMatch(primaryText(read(p)),forbidden,p);
  assert.doesNotMatch(primaryText(home.heroBannerHtml(summary)),forbidden);
  assert.doesNotMatch(primaryText(home.homeOpportunitiesHtml(index,index.as_of_session,ws)),forbidden);
  for(const ticker of ['HPG','VCB','SSI','PNJ','NVL','QNS']) {
    const card=index.cards[ticker];
    assert.doesNotMatch(primaryText(ws.decisionCardHtml(card,{ticker})),forbidden,ticker);
  }
});
test('notable membership exactly preserves the pre-milestone focus lanes over every real card',()=>{
  const before=JSON.stringify(index);
  const expected=Object.keys(index.cards).filter(t=>{
    const c=index.cards[t];
    return ['INITIATE_ON_BREAKOUT','ACCUMULATE_ON_RETEST','EARLY_WATCH'].includes(c.research_action_posture)||
      (['BREAKOUT_READY','EARLY_REVERSAL_CANDIDATE','BASE_BUILDING'].includes(c.entry_state)&&c.research_action_posture!=='AVOID'&&c.research_action_posture!=='REDUCE');
  }).slice(0,4);
  assert.deepEqual(ws.notableTickers(index.cards),expected);
  const html=home.homeOpportunitiesHtml(index,index.as_of_session,ws);
  assert.deepEqual([...html.matchAll(/data-focus-ticker="([^"]+)"/g)].map(m=>m[1]),expected);
  assert.equal(JSON.stringify(index),before,'render/selection must not mutate any raw canonical value');
});
test('Home rejects stale/wrong-contract/empty opportunity records instead of promoting them',()=>{
  for(const bad of [null,{...index,as_of_session:'2000-01-01'},{...index,contract_version:'unknown'}]){
    const html=home.homeOpportunitiesHtml(bad,index.as_of_session,ws);
    assert.match(html,/Chưa có dữ liệu cổ phiếu cùng phiên/);
    assert.doesNotMatch(html,/data-focus-ticker/);
  }
  assert.match(home.homeOpportunitiesHtml({...index,cards:{}},index.as_of_session,ws),/Chưa có mã đáng chú ý/);
  assert.match(home.investorRiskHtml({...summary,session_breadth:{available:false}}),/Chưa có dữ liệu tăng\/giảm/);
  assert.match(home.investorRiskHtml(summary),/không chứng minh khả năng thực hiện lệnh/);
});
test('execute actual compatibility redirects with ticker, arbitrary query and hash intact',()=>{
  for(const [page,view] of [['screener.html','explore'],['signals.html','technical'],['analysis.html','analysis']]){
    let target;
    const script=read(page).match(/<script>\s*([\s\S]*?)<\/script>/)[1];
    vm.runInNewContext(script,{URLSearchParams,window:{location:{search:'?ticker=HPG&keep=yes',hash:'#lineage',replace:v=>target=v}}});
    const url=new URL(target,'https://example.com/');
    assert.equal(url.searchParams.get('ticker'),'HPG');
    assert.equal(url.searchParams.get('keep'),'yes');
    assert.equal(url.searchParams.get('view'),view);
    assert.equal(url.hash,'#lineage');
  }
});
