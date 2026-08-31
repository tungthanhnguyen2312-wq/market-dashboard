// Stable page entrypoint. Primary product data is data/investment_decision_workspace.json;
// the Workspace rendering contract lives in the shared static module.
(() => {
  const script = document.createElement("script");
  script.src = "assets/js/analysis-product.js";
  script.defer = true;
  document.head.append(script);
})();
