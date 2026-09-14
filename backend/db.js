import { MongoClient } from 'mongodb';

const mongoUrl = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017';
const databaseName = process.env.MONGODB_DB || 'ein';
const client = new MongoClient(mongoUrl);

export let db;
export let users;
export let nodes;
export let readings;
export let alerts;
export let communityReports;

export async function initDb() {
  await client.connect();
  db = client.db(databaseName);
  users = db.collection('users');
  nodes = db.collection('nodes');
  readings = db.collection('readings');
  alerts = db.collection('alerts');
  communityReports = db.collection('community_reports');

  await Promise.all([
    users.createIndex({ email: 1 }, { unique: true }),
    nodes.createIndex({ pole_name: 1 }, { unique: true }),
    readings.createIndex({ node_id: 1, timestamp: -1 }),
    alerts.createIndex({ node_id: 1, status: 1 })
  ]);

  console.log(`MongoDB connected: ${databaseName}`);
}

export async function nextId(collection) {
  const latest = await collection.findOne({}, { sort: { id: -1 }, projection: { id: 1 } });
  return (latest?.id || 0) + 1;
}
