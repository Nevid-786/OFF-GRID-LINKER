import express from 'express';
import { db } from '../db.js';

export function createAlertsRouter(io) {
  const router = express.Router();

  // GET /api/alerts — filterable alerts list
  router.get('/', (req, res) => {
    const { level, status, limit } = req.query;

    try {
      let query = `
        SELECT 
          a.*,
          n.pole_name,
          n.latitude,
          n.longitude,
          n.sensor_type
        FROM alerts a
        JOIN nodes n ON a.node_id = n.id
        WHERE 1=1
      `;

      const params = [];

      if (level) {
        query += ' AND a.alert_level = ?';
        params.push(level);
      }

      if (status) {
        query += ' AND a.status = ?';
        params.push(status);
      }

      query += ' ORDER BY a.raised_at DESC';

      if (limit) {
        query += ' LIMIT ?';
        params.push(parseInt(limit));
      }

      const alerts = db.prepare(query).all(...params);
      res.json(alerts);
    } catch (err) {
      console.error('Error fetching alerts:', err);
      res.status(500).json({ error: 'Failed to fetch alerts' });
    }
  });

  // POST /api/alerts/:id/acknowledge
  router.post('/:id/acknowledge', (req, res) => {
    const { id } = req.params;
    const { acknowledged_by } = req.body;

    try {
      const alert = db.prepare('SELECT * FROM alerts WHERE id = ?').get(id);
      if (!alert) {
        return res.status(404).json({ error: 'Alert not found' });
      }

      const officer = acknowledged_by || 'Field Commander';

      db.prepare(`
        UPDATE alerts 
        SET status = 'acknowledged', acknowledged_by = ? 
        WHERE id = ?
      `).run(officer, id);

      const updated = db.prepare('SELECT * FROM alerts WHERE id = ?').get(id);

      if (io) {
        io.emit('alert_acknowledged', updated);
      }

      res.json({ message: 'Alert acknowledged', alert: updated });
    } catch (err) {
      console.error('Error acknowledging alert:', err);
      res.status(500).json({ error: 'Failed to acknowledge alert' });
    }
  });

  // POST /api/alerts/:id/resolve
  router.post('/:id/resolve', (req, res) => {
    const { id } = req.params;

    try {
      const alert = db.prepare('SELECT * FROM alerts WHERE id = ?').get(id);
      if (!alert) {
        return res.status(404).json({ error: 'Alert not found' });
      }

      const resolvedAt = new Date().toISOString();

      db.prepare(`
        UPDATE alerts 
        SET status = 'resolved', resolved_at = ? 
        WHERE id = ?
      `).run(resolvedAt, id);

      const updated = db.prepare('SELECT * FROM alerts WHERE id = ?').get(id);

      if (io) {
        io.emit('alert_resolved', updated);
      }

      res.json({ message: 'Alert resolved', alert: updated });
    } catch (err) {
      console.error('Error resolving alert:', err);
      res.status(500).json({ error: 'Failed to resolve alert' });
    }
  });

  return router;
}
