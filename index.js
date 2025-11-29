const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const { CosmosClient } = require('@azure/cosmos');
const app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

let container = null;
if (process.env.COSMOS_CONNECTION) {
  const client = new CosmosClient(process.env.COSMOS_CONNECTION);
  const database = client.database(process.env.COSMOS_DB || 'baasdb');
  container = database.container(process.env.COSMOS_CONTAINER || 'notes');
  console.log('Cosmos DB configured');
} else {
  console.log('Cosmos DB not configured - using in-memory storage');
}

let inMemory = [];

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.post('/submit', async (req, res) => {
  const { name, message } = req.body;
  const item = {
    id: Date.now().toString(),
    name: name || 'Anonymous',
    message: message || '',
    createdAt: new Date().toISOString()
  };

  try {
    if (container) {
      await container.items.create(item);
    } else {
      inMemory.push(item);
    }
    res.redirect('/thanks.html');
  } catch (err) {
    console.error('Error saving:', err);
    res.status(500).send('Error saving data');
  }
});

app.get('/list', async (req, res) => {
  try {
    let items = [];
    if (container) {
      const { resources } = await container.items.query('SELECT * FROM c ORDER BY c.createdAt DESC').fetchAll();
      items = resources;
    } else {
      items = inMemory.slice().reverse();
    }
    res.json(items);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error reading data');
  }
});

app.listen(port, () => {
  console.log(`App listening on port ${port}`);
});
