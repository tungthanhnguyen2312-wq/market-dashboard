(() => {
  const key = "stocklookup.portfolio-research.v1";
  let model = JSON.parse(localStorage.getItem(key) || '{"portfolio_id":"local-portfolio","cash":0,"positions":[]}');
  const $ = id => document.getElementById(id);
  const render = () => { $("portfolio-id").value = model.portfolio_id || ""; $("cash").value = model.cash || 0; $("positions").innerHTML = model.positions.map((p,i) => `<tr><td>${p.ticker}</td><td>${p.quantity ?? p.explicit_weight}</td><td><button data-remove="${i}">Remove</button></td></tr>`).join(""); };
  $("portfolio-form").addEventListener("submit", e => { e.preventDefault(); const ticker=$("ticker").value.trim().toUpperCase(), value=Number($("amount").value); if (!ticker || !Number.isFinite(value) || value < 0) return; model.positions.push({ticker, [$("basis").value]:value}); $("ticker").value=$("amount").value=""; render(); });
  $("positions").addEventListener("click", e => { const i=e.target.dataset.remove; if(i!==undefined){model.positions.splice(Number(i),1);render();} });
  $("save").onclick=()=>{model.portfolio_id=$("portfolio-id").value;model.cash=Number($("cash").value)||0;localStorage.setItem(key,JSON.stringify(model));};
  $("export").onclick=()=>{const a=document.createElement("a");a.href=URL.createObjectURL(new Blob([JSON.stringify(model,null,2)],{type:"application/json"}));a.download="portfolio.json";a.click();};
  $("import").onchange=e=>{const reader=new FileReader();reader.onload=()=>{try{const x=JSON.parse(reader.result);if(!Array.isArray(x.positions))throw Error();model=x;render();}catch{alert("Invalid portfolio JSON");}};reader.readAsText(e.target.files[0]);};
  $("clear").onclick=()=>{model={portfolio_id:"local-portfolio",cash:0,positions:[]};localStorage.removeItem(key);render();}; render();
})();
