import express from 'express';
import { db } from '../db.js';

const router = express.Router();

// GET /api/nodes — list all nodes with their latest reading
router.get('/', (req, res) => {
  try {
    const nodes = db.prepare(`
      SELECT 
        n.*,
        r.water_level,
        r.alert_level,
        r.cause,
        r.confidence_score,
        r.timestamp as last_reading_time
      FROM nodes n
      LEFT JOIN (
        SELECT r1.*
        FROM readings r1
        INNER JOIN (
          SELECT node_id, MAX(id) as max_id
          FROM readings
          GROUP BY node_id
        ) r2 ON r1.id = r2.max_id
      ) r ON n.id = r.node_id
      ORDER BY n.id ASC
    `).all();

    const formatted = nodes.map(n => ({
      ...n,
      alert_level: n.alert_level || 'Safe',
      water_level: n.water_level !== null ? n.water_level : 0.0,
      cause: n.cause || 'Nominal monitoring',
      confidence_score: n.confidence_score || 0.95,
      last_reading_time: n.last_reading_time || n.deployed_date
    }));

    res.json(formatted);
  } catch (err) {
    console.error('Error fetching nodes:', err);
    res.status(500).json({ error: 'Failed to fetch nodes' });
  }
});

// GET /api/nodes/:id — single node detail + historical readings
router.get('/:id', (req, res) => {
  const { id } = req.params;
  try {
    const node = db.prepare('SELECT * FROM nodes WHERE id = ?').get(id);
    if (!node) {
      return res.status(404).json({ error: 'Node not found' });
    }

    const readings = db.prepare(`
      SELECT * FROM readings 
      WHERE node_id = ? 
      ORDER BY timestamp DESC 
      LIMIT 50
    `).all(id);

    const alerts = db.prepare(`
      SELECT * FROM alerts 
      WHERE node_id = ? 
      ORDER BY raised_at DESC 
      LIMIT 20
    `).all(id);

    const nearby = db.prepare(`
      SELECT id, pole_name, latitude, longitude, sensor_type, status 
      FROM nodes 
      WHERE id != ? AND ABS(latitude - ?) < 1.5 AND ABS(longitude - ?) < 1.5
      LIMIT 5
    `).all(id, node.latitude, node.longitude);

    res.json({
      ...node,
      latest_reading: readings[0] || null,
      readings,
      alerts,
      nearby
    });
  } catch (err) {
    console.error('Error fetching node detail:', err);
    res.status(500).json({ error: 'Failed to fetch node details' });
  }
});

// POST /api/nodes — create new pole node (admin)
router.post('/', (req, res) => {
  const { pole_name, latitude, longitude, sensor_type, battery_percent, signal_strength, status } = req.body;

  if (!pole_name || latitude === undefined || longitude === undefined) {
    return res.status(400).json({ error: 'pole_name, latitude, and longitude are required' });
  }

  try {
    const deployed_date = new Date().toISOString().split('T')[0];
    const result = db.prepare(`
      INSERT INTO nodes (pole_name, latitude, longitude, sensor_type, deployed_date, battery_percent, signal_strength, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      pole_name,
      parseFloat(latitude),
      parseFloat(longitude),
      sensor_type || 'water',
      deployed_date,
      battery_percent !== undefined ? parseInt(battery_percent) : 100,
      signal_strength !== undefined ? parseInt(signal_strength) : 90,
      status || 'online'
    );

    const newNode = db.prepare('SELECT * FROM nodes WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json(newNode);
  } catch (err) {
    console.error('Error creating node:', err);
    res.status(500).json({ error: 'Failed to create node. Name might be duplicate.' });
  }
});

// PUT /api/nodes/:id — update pole node
router.put('/:id', (req, res) => {
  const { id } = req.params;
  const { pole_name, latitude, longitude, sensor_type, battery_percent, signal_strength, status } = req.body;

  try {
    db.prepare(`
      UPDATE nodes 
      SET pole_name = COALESCE(?, pole_name),
          latitude = COALESCE(?, latitude),
          longitude = COALESCE(?, longitude),
          sensor_type = COALESCE(?, sensor_type),
          battery_percent = COALESCE(?, battery_percent),
          signal_strength = COALESCE(?, signal_strength),
          status = COALESCE(?, status)
      WHERE id = ?
    `).run(pole_name, latitude, longitude, sensor_type, battery_percent, signal_strength, status, id);

    const updated = db.prepare('SELECT * FROM nodes WHERE id = ?').get(id);
    res.json(updated);
  } catch (err) {
    console.error('Error updating node:', err);
    res.status(500).json({ error: 'Failed to update node' });
  }
});

// DELETE /api/nodes/:id — delete pole node
router.delete('/:id', (req, res) => {
  const { id } = req.params;
  try {
    db.prepare('DELETE FROM nodes WHERE id = ?').run(id);
    res.json({ message: `Node ${id} deleted successfully` });
  } catch (err) {
    console.error('Error deleting node:', err);
    res.status(500).json({ error: 'Failed to delete node' });
  }
});

export default router;
