Simple web app for Zadanie 5.
- install: npm install
- run locally: npm start
- optional: set COSMOS_CONNECTION env var to use Azure Cosmos DB; otherwise in-memory storage is used.
- endpoints:
  GET /        -> form page
  POST /submit -> submit form
  GET /list    -> JSON list of submissions
