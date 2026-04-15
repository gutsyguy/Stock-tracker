const yahooFinance = require('yahoo-finance2').default;

(async () => {
  try {
    const result = await yahooFinance.quoteSummary('AAPL', { modules: ['assetProfile'] });
    console.log(JSON.stringify(result, null, 2));
  } catch (error) {
    console.error("Error:", error.message);
  }
})();
