import express from 'express';
import { alerts, nodes } from '../db.js';

export function createAlertsRouter(io) {
  const router = express.Router();

  router.get('/', async (req, res) => {
    try {
      const filter = {};
      if (req.query.level) filter.alert_level = req.query.level;
      if (req.query.status) filter.status = req.query.status;
      const alertList = await alerts.find(filter).sort({ raised_at: -1 }).limit(req.query.limit ? Number(req.query.limit) : 0).toArray();
      const nodeMap = new Map((await nodes.find({ id: { $in: alertList.map((alert) => alert.node_id) } }).toArray()).map((node) => [node.id, node]));
      res.json(alertList.map((alert) => ({ ...alert, ...(nodeMap.get(alert.node_id) ? { pole_name: nodeMap.get(alert.node_id).pole_name, latitude: nodeMap.get(alert.node_id).latitude, longitude: nodeMap.get(alert.node_id).longitude, sensor_type: nodeMap.get(alert.node_id).sensor_type } : {}) })));
    } catch (err) {
      console.error('Error fetching alerts:', err);
      res.status(500).json({ error: 'Failed to fetch alerts' });
    }
  });

  router.post('/:id/acknowledge', async (req, res) => {
    try {
      const id = Number(req.params.id);
      const alert = await alerts.findOne({ id });
      if (!alert) return res.status(404).json({ error: 'Alert not found' });
      await alerts.updateOne({ id }, { $set: { status: 'acknowledged', acknowledged_by: req.body.acknowledged_by || 'Field Commander' } });
      const updated = await alerts.findOne({ id });
      io.emit('alert_acknowledged', updated);
      res.json({ message: 'Alert acknowledged', alert: updated });
    } catch (err) {
      console.error('Error acknowledging alert:', err);
      res.status(500).json({ error: 'Failed to acknowledge alert' });
    }
  });

  router.post('/:id/resolve', async (req, res) => {
    try {
      const id = Number(req.params.id);
      const alert = await alerts.findOne({ id });
      if (!alert) return res.status(404).json({ error: 'Alert not found' });
      await alerts.updateOne({ id }, { $set: { status: 'resolved', resolved_at: new Date().toISOString() } });
      const updated = await alerts.findOne({ id });
      io.emit('alert_resolved', updated);
      res.json({ message: 'Alert resolved', alert: updated });
    } catch (err) {
      console.error('Error resolving alert:', err);
      res.status(500).json({ error: 'Failed to resolve alert' });
    }
  });

  return router;
}
