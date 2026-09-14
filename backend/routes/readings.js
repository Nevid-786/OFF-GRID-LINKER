import express from 'express';
import { nodes, readings, alerts, nextId } from '../db.js';

export function createReadingsRouter(io) {
  const router = express.Router();

  router.post('/', async (req, res) => {
    const { pole_name, latitude, longitude, water_level, alert_level, cause, timestamp, battery_percent, signal_strength, sensor_type, confidence_score } = req.body;
    if (!pole_name) return res.status(400).json({ error: 'pole_name is required' });
    try {
      let node = await nodes.findOne({ pole_name });
      if (!node) {
        node = { id: await nextId(nodes), pole_name, latitude: latitude ?? 28.6139, longitude: longitude ?? 77.209, sensor_type: sensor_type || 'water', deployed_date: new Date().toISOString().split('T')[0], battery_percent: battery_percent ?? 90, signal_strength: signal_strength ?? 85, status: 'online' };
        await nodes.insertOne(node);
      } else {
        await nodes.updateOne({ id: node.id }, { $set: { battery_percent: battery_percent ?? node.battery_percent, signal_strength: signal_strength ?? node.signal_strength, status: 'online' } });
        node = { ...node, battery_percent: battery_percent ?? node.battery_percent, signal_strength: signal_strength ?? node.signal_strength, status: 'online' };
      }
      const validatedAlertLevel = ['Safe', 'Watch', 'Warning', 'Critical'].includes(alert_level) ? alert_level : 'Safe';
      const reading = { id: await nextId(readings), node_id: node.id, water_level: water_level !== undefined ? parseFloat(water_level) : 0, alert_level: validatedAlertLevel, cause: cause || 'Nominal push', confidence_score: confidence_score || 0.95, timestamp: timestamp || new Date().toISOString() };
      await readings.insertOne(reading);
      let raisedAlert = null;
      if (['Warning', 'Critical'].includes(validatedAlertLevel) && !await alerts.findOne({ node_id: node.id, status: 'active' })) {
        raisedAlert = { id: await nextId(alerts), node_id: node.id, alert_level: validatedAlertLevel, cause: cause || 'Automated sensor threshold trigger', raised_at: reading.timestamp, resolved_at: null, acknowledged_by: null, status: 'active' };
        await alerts.insertOne(raisedAlert);
      }
      const payload = { reading_id: reading.id, node_id: node.id, pole_name: node.pole_name, latitude: node.latitude, longitude: node.longitude, sensor_type: node.sensor_type, water_level: reading.water_level, alert_level: validatedAlertLevel, cause: reading.cause, confidence_score: reading.confidence_score, timestamp: reading.timestamp, raisedAlert };
      io.emit('telemetry_update', payload);
      if (raisedAlert) io.emit('emergency_sos_alert', { alert: raisedAlert, pole_name: node.pole_name, latitude: node.latitude, longitude: node.longitude });
      res.status(201).json({ status: 'success', message: 'Telemetry ingested successfully', data: payload });
    } catch (err) {
      console.error('Error ingesting reading:', err);
      res.status(500).json({ error: 'Failed to ingest sensor reading' });
    }
  });

  return router;
}
