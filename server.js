const express = require('express');
const fs      = require('fs');
const path    = require('path');

const app  = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(__dirname));

// ── Default products (used to seed MongoDB on first deploy) ──────────────────
const DEFAULT_PRODUCTS = [
  {id:1,name:'Classic Latte',     cat:'coffee',   tag:'popular',price:2.75,desc:'Smooth espresso with steamed milk.',     img:'https://images.unsplash.com/photo-1570968915860-54d5c301fa9f?auto=format&fit=crop&w=700&q=85'},
  {id:2,name:'Iced Americano',    cat:'coffee',              price:2.25,desc:'Bold espresso over ice and cold water.',  img:'https://images.unsplash.com/photo-1517701604599-bb29b565090c?auto=format&fit=crop&w=700&q=85'},
  {id:3,name:'Caramel Macchiato', cat:'signature',tag:'new', price:3.50,desc:'Espresso, milk, vanilla and caramel.',   img:'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?auto=format&fit=crop&w=700&q=85'},
  {id:4,name:'Mocha Frappe',      cat:'signature',           price:3.95,desc:'Chocolate coffee blend with cream.',      img:'https://images.unsplash.com/photo-1572490122747-3968b75cc699?auto=format&fit=crop&w=700&q=85'},
  {id:5,name:'Butter Croissant',  cat:'bakery',  tag:'fresh',price:1.75,desc:'Flaky, warm, buttery pastry.',           img:'https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=700&q=85'},
  {id:6,name:'Cinnamon Roll',     cat:'bakery',              price:2.25,desc:'Soft roll with cinnamon glaze.',          img:'https://images.unsplash.com/photo-1509365465985-25d11c17e812?auto=format&fit=crop&w=700&q=85'},
  {id:7,name:'Matcha Latte',      cat:'signature',tag:'new', price:3.25,desc:'Creamy Japanese matcha with milk.',      img:'https://images.unsplash.com/photo-1536256263959-770b48d82b0a?auto=format&fit=crop&w=700&q=85'},
  {id:8,name:'Espresso Shot',     cat:'coffee',              price:1.80,desc:'Rich, strong, and aromatic.',            img:'https://images.unsplash.com/photo-1510707577719-ae7c14805e3a?auto=format&fit=crop&w=700&q=85'}
];

// ── Storage: MongoDB (Vercel) or db.json (local) ─────────────────────────────
const MONGODB_URI = process.env.MONGODB_URI;
const DB_PATH     = path.join(__dirname, 'db.json');

// File helpers (local dev only)
function readDB()      { try { return JSON.parse(fs.readFileSync(DB_PATH, 'utf8')); } catch { return { orders:[], products:[] }; } }
function writeDB(data) { fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2)); }

// MongoDB connection cache (reused across warm serverless invocations)
let _mongo = null;
async function getMongo() {
  if (_mongo) return _mongo;
  const { MongoClient } = require('mongodb');
  const client = new MongoClient(MONGODB_URI, { maxPoolSize: 1 });
  await client.connect();
  _mongo = client.db('krafe');
  // Seed default products on first deploy
  const count = await _mongo.collection('products').countDocuments();
  if (count === 0) await _mongo.collection('products').insertMany(DEFAULT_PRODUCTS.map(p => ({ ...p })));
  return _mongo;
}

// ── Orders ────────────────────────────────────────────────────────────────────
app.get('/api/orders', async (req, res) => {
  try {
    if (MONGODB_URI) {
      const db = await getMongo();
      return res.json(await db.collection('orders').find({}, { projection:{ _id:0 } }).sort({ time:-1 }).toArray());
    }
    res.json(readDB().orders);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/orders', async (req, res) => {
  try {
    if (MONGODB_URI) {
      const db = await getMongo();
      await db.collection('orders').insertOne({ ...req.body });
      return res.json(req.body);
    }
    const data = readDB();
    data.orders.unshift(req.body);
    writeDB(data);
    res.json(req.body);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.patch('/api/orders/:id', async (req, res) => {
  try {
    const id = req.params.id;
    if (MONGODB_URI) {
      const db = await getMongo();
      await db.collection('orders').updateOne({ id }, { $set: req.body });
      const order = await db.collection('orders').findOne({ id }, { projection:{ _id:0 } });
      return res.json(order || { error: 'Order not found' });
    }
    const data  = readDB();
    const order = data.orders.find(o => o.id === id);
    if (!order) return res.status(404).json({ error: 'Order not found' });
    Object.assign(order, req.body);
    writeDB(data);
    res.json(order);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.delete('/api/orders', async (req, res) => {
  try {
    if (MONGODB_URI) {
      const db = await getMongo();
      await db.collection('orders').deleteMany({});
      return res.json({ ok: true });
    }
    const data = readDB();
    data.orders = [];
    writeDB(data);
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ── Products ──────────────────────────────────────────────────────────────────
app.get('/api/products', async (req, res) => {
  try {
    if (MONGODB_URI) {
      const db = await getMongo();
      return res.json(await db.collection('products').find({}, { projection:{ _id:0 } }).toArray());
    }
    res.json(readDB().products);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/products', async (req, res) => {
  try {
    if (MONGODB_URI) {
      const db = await getMongo();
      await db.collection('products').insertOne({ ...req.body });
      return res.json(req.body);
    }
    const data = readDB();
    data.products.push(req.body);
    writeDB(data);
    res.json(req.body);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.put('/api/products/:id', async (req, res) => {
  try {
    const id = +req.params.id;
    if (MONGODB_URI) {
      const db = await getMongo();
      await db.collection('products').replaceOne({ id }, { ...req.body });
      return res.json(req.body);
    }
    const data = readDB();
    const i    = data.products.findIndex(p => p.id === id);
    if (i === -1) return res.status(404).json({ error: 'Product not found' });
    data.products[i] = req.body;
    writeDB(data);
    res.json(req.body);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.delete('/api/products/:id', async (req, res) => {
  try {
    const id = +req.params.id;
    if (MONGODB_URI) {
      const db = await getMongo();
      await db.collection('products').deleteOne({ id });
      return res.json({ ok: true });
    }
    const data = readDB();
    data.products = data.products.filter(p => p.id !== id);
    writeDB(data);
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ── Start (local dev) ─────────────────────────────────────────────────────────
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`\n  Krafe Coffee running at http://localhost:${PORT}`);
    console.log(`  Admin panel:          http://localhost:${PORT}/admin.html\n`);
  });
}

module.exports = app;
