import express from 'express';
import { db } from '../db.js';

export function createReadingsRouter(io) {
  const router = express.Router();

  // POST /api/readings — edge pole telemetry ingestion
  router.post('/', (req, res) => {
    const {
      pole_name,
      latitude,
      longitude,
      water_level,
      alert_level,
      cause,
      timestamp,
      battery_percent,
      signal_strength,
      sensor_type,
      confidence_score
    } = req.body;

    if (!pole_name) {
      return res.status(400).json({ error: 'pole_name is required' });
    }

    try {
      let node = db.prepare('SELECT * FROM nodes WHERE pole_name = ?').get(pole_name);

      if (!node) {
        const result = db.prepare(`
          INSERT INTO nodes (pole_name, latitude, longitude, sensor_type, deployed_date, battery_percent, signal_strength, status)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `).run(
          pole_name,
          latitude || 28.6139,
          longitude || 77.2090,
          sensor_type || 'water',
          new Date().toISOString().split('T')[0],
          battery_percent || 90,
          signal_strength || 85,
          'online'
        );
        node = db.prepare('SELECT * FROM nodes WHERE id = ?').get(result.lastInsertRowid);
      } else {
        db.prepare(`
          UPDATE nodes 
          SET battery_percent = COALESCE(?, battery_percent),
              signal_strength = COALESCE(?, signal_strength),
              status = 'online'
          WHERE id = ?
        `).run(battery_percent, signal_strength, node.id);
      }

      const validatedAlertLevel = ['Safe', 'Watch', 'Warning', 'Critical'].includes(alert_level)
        ? alert_level
        : 'Safe';

      const readingTimestamp = timestamp || new Date().toISOString();
      const score = confidence_score || 0.95;

      const readingResult = db.prepare(`
        INSERT INTO readings (node_id, water_level, alert_level, cause, confidence_score, timestamp)
        VALUES (?, ?, ?, ?, ?, ?)
      `).run(
        node.id,
        water_level !== undefined ? parseFloat(water_level) : 0,
        validatedAlertLevel,
        cause || 'Nominal push',
        score,
        readingTimestamp
      );

      let raisedAlert = null;
      if (validatedAlertLevel === 'Warning' || validatedAlertLevel === 'Critical') {
        const existingAlert = db.prepare(`
          SELECT * FROM alerts 
          WHERE node_id = ? AND status = 'active'
        `).get(node.id);

        if (!existingAlert) {
          const alertRes = db.prepare(`
            INSERT INTO alerts (node_id, alert_level, cause, raised_at, status)
            VALUES (?, ?, ?, ?, 'active')
          `).run(node.id, validatedAlertLevel, cause || 'Automated sensor threshold trigger', readingTimestamp);

          raisedAlert = db.prepare('SELECT * FROM alerts WHERE id = ?').get(alertRes.lastInsertRowid);
        }
      }

      const payload = {
        reading_id: readingResult.lastInsertRowid,
        node_id: node.id,
        pole_name: node.pole_name,
        latitude: node.latitude,
        longitude: node.longitude,
        sensor_type: node.sensor_type,
        water_level: parseFloat(water_level || 0),
        alert_level: validatedAlertLevel,
        cause: cause || 'Sensor push',
        confidence_score: score,
        timestamp: readingTimestamp,
        raisedAlert
      };

      if (io) {
        io.emit('telemetry_update', payload);
        if (raisedAlert) {
          io.emit('emergency_sos_alert', {
            alert: raisedAlert,
            pole_name: node.pole_name,
            latitude: node.latitude,
            longitude: node.longitude
          });
        }
      }

      res.status(201).json({
        status: 'success',
        message: 'Telemetry ingested successfully',
        data: payload
      });
    } catch (err) {
      console.error('Error ingesting reading:', err);
      res.status(500).json({ error: 'Failed to ingest sensor reading' });
    }
  });

  return router;
}
