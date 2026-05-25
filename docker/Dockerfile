# Build context: MiningPA-wxo-generic-demo/
# Usage: docker build -t ironfield-hub -f docker/Dockerfile .
FROM node:20-alpine
WORKDIR /app

COPY docker/package.json ./
RUN npm install --omit=dev --no-fund --no-audit

COPY docker/server.js ./
COPY market-data/index.js ./market-api.js

COPY agent.html ./static/agent.html
COPY market-data/dashboard.html ./static/market.html
COPY planning-analytics/viewer.html ./static/planning.html

COPY reports/half-year-dec-2025.html          ./static/reports/half-year-dec-2025.html
COPY reports/quarterly-dec-2025.html          ./static/reports/quarterly-dec-2025.html
COPY reports/quarterly-sep-2025.html          ./static/reports/quarterly-sep-2025.html
COPY reports/investor-presentation-h1-fy26.html ./static/reports/investor-presentation-h1-fy26.html
COPY reports/creston-feasibility-study.html   ./static/reports/creston-feasibility-study.html
COPY reports/fy26-guidance.html               ./static/reports/fy26-guidance.html

EXPOSE 8080
ENV PORT=8080
CMD ["node", "server.js"]
