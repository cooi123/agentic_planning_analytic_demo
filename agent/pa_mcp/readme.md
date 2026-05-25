orchestrate toolkits add \
  --kind mcp \
  --name pa_mcp \
  --description "IBM Planning Analytics MCP server. Provides tools for querying FinancialPerformance, ProductionKPI, CapexPlanning, and CashFlow cubes covering Ironfield Resources FY26 planning data. Includes pre-built summary tools and a raw MDX executor for custom queries." \
  --package-root ./agent/pa_mcp \
  --command "python pa_mcp_server.py" \
  --tools "*"
