import express from 'express';
import { nodes, readings, alerts, nextId } from '../db.js';

const router = express.Router();
const latestReading = async (nodeId) => readings.findOne({ node_id: nodeId }, { sort: { id: -1 } });

router.get('/', async (req, res) => {
  try {
    const result = [];
    for await (const node of nodes.find().sort({ id: 1 })) {
      const reading = await latestReading(node.id);
      result.push({ ...node, alert_level: reading?.alert_level || 'Safe', water_level: reading?.water_level ?? 0, cause: reading?.cause || 'Nominal monitoring', confidence_score: reading?.confidence_score || 0.95, last_reading_time: reading?.timestamp || node.deployed_date });
    }
    res.json(result);
  } catch (err) {
    console.error('Error fetching nodes:', err);
    res.status(500).json({ error: 'Failed to fetch nodes' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    const node = await nodes.findOne({ id });
    if (!node) return res.status(404).json({ error: 'Node not found' });
    const nodeReadings = await readings.find({ node_id: id }).sort({ timestamp: -1 }).limit(50).toArray();
    const nodeAlerts = await alerts.find({ node_id: id }).sort({ raised_at: -1 }).limit(20).toArray();
    const nearby = await nodes.find({ id: { $ne: id }, latitude: { $gte: node.latitude - 1.5, $lte: node.latitude + 1.5 }, longitude: { $gte: node.longitude - 1.5, $lte: node.longitude + 1.5 } }).project({ id: 1, pole_name: 1, latitude: 1, longitude: 1, sensor_type: 1, status: 1 }).limit(5).toArray();
    res.json({ ...node, latest_reading: nodeReadings[0] || null, readings: nodeReadings, alerts: nodeAlerts, nearby });
  } catch (err) {
    console.error('Error fetching node details:', err);
    res.status(500).json({ error: 'Failed to fetch node details' });
  }
});

router.post('/', async (req, res) => {
  const { pole_name, latitude, longitude, sensor_type, battery_percent, signal_strength, status } = req.body;
  if (!pole_name || latitude === undefined || longitude === undefined) return res.status(400).json({ error: 'pole_name, latitude, and longitude are required' });
  try {
    const node = { id: await nextId(nodes), pole_name, latitude: parseFloat(latitude), longitude: parseFloat(longitude), sensor_type: sensor_type || 'water', deployed_date: new Date().toISOString().split('T')[0], battery_percent: battery_percent ?? 100, signal_strength: signal_strength ?? 90, status: status || 'online' };
    await nodes.insertOne(node);
    res.status(201).json(node);
  } catch (err) {
    console.error('Error creating node:', err);
    res.status(500).json({ error: 'Failed to create node. Name might be duplicate.' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    const allowed = ['pole_name', 'latitude', 'longitude', 'sensor_type', 'battery_percent', 'signal_strength', 'status'];
    const changes = Object.fromEntries(Object.entries(req.body).filter(([key, value]) => allowed.includes(key) && value !== undefined));
    const result = await nodes.findOneAndUpdate({ id }, { $set: changes }, { returnDocument: 'after' });
    res.json(result);
  } catch (err) {
    console.error('Error updating node:', err);
    res.status(500).json({ error: 'Failed to update node' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    await nodes.deleteOne({ id });
    await readings.deleteMany({ node_id: id });
    await alerts.deleteMany({ node_id: id });
    res.json({ message: `Node ${id} deleted successfully` });
  } catch (err) {
    console.error('Error deleting node:', err);
    res.status(500).json({ error: 'Failed to delete node' });
  }
});

export default router;
