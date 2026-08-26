@echo off
echo [ERROR] REFUSED: market-dashboard is the publication TARGET, not a publisher.
echo Live release authority is:
echo   python C:\Projects\StockLookup\stock-core-private\tools\release_orchestrator.py
echo targeting:
echo   C:\Projects\StockLookup\market-dashboard
exit /b 1
