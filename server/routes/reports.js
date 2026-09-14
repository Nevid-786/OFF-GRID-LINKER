import express from 'express';
import { db } from '../db.js';

export function createReportsRouter(io) {
  const router = express.Router();

  // GET /api/community-reports
  router.get('/community-reports', (req, res) => {
    try {
      const reports = db.prepare('SELECT * FROM community_reports ORDER BY submitted_at DESC').all();
      res.json(reports);
    } catch (err) {
      console.error('Error fetching community reports:', err);
      res.status(500).json({ error: 'Failed to fetch community reports' });
    }
  });

  // POST /api/community-reports — public citizen report submission
  router.post('/community-reports', (req, res) => {
    const { user_id, user_name, latitude, longitude, description, photo_url } = req.body;

    if (latitude === undefined || longitude === undefined || !description) {
      return res.status(400).json({ error: 'Latitude, longitude, and description are required' });
    }

    try {
      const submitted_at = new Date().toISOString();
      const name = user_name || 'Anonymous Citizen';

      const result = db.prepare(`
        INSERT INTO community_reports (user_id, user_name, latitude, longitude, description, photo_url, submitted_at, verified)
        VALUES (?, ?, ?, ?, ?, ?, ?, 0)
      `).run(
        user_id || null,
        name,
        parseFloat(latitude),
        parseFloat(longitude),
        description,
        photo_url || 'https://images.unsplash.com/photo-1547683905-f686c993aae5?auto=format&fit=crop&w=600&q=80',
        submitted_at
      );

      const newReport = db.prepare('SELECT * FROM community_reports WHERE id = ?').get(result.lastInsertRowid);

      if (io) {
        io.emit('new_community_report', newReport);
      }

      res.status(201).json({
        message: 'Community report submitted successfully',
        report: newReport
      });
    } catch (err) {
      console.error('Error submitting community report:', err);
      res.status(500).json({ error: 'Failed to submit report' });
    }
  });

  // POST /api/community-reports/:id/verify — verify citizen report
  router.post('/community-reports/:id/verify', (req, res) => {
    const { id } = req.params;

    try {
      db.prepare('UPDATE community_reports SET verified = 1 WHERE id = ?').run(id);
      const updated = db.prepare('SELECT * FROM community_reports WHERE id = ?').get(id);

      if (io) {
        io.emit('community_report_verified', updated);
      }

      res.json({ message: 'Report verified', report: updated });
    } catch (err) {
      console.error('Error verifying report:', err);
      res.status(500).json({ error: 'Failed to verify report' });
    }
  });

  // GET /api/reports/download — CSV export
  router.get('/reports/download', (req, res) => {
    const { format } = req.query;

    try {
      const readings = db.prepare(`
        SELECT r.id, n.pole_name, n.sensor_type, r.water_level, r.alert_level, r.cause, r.confidence_score, r.timestamp
        FROM readings r
        JOIN nodes n ON r.node_id = n.id
        ORDER BY r.timestamp DESC
        LIMIT 200
      `).all();

      if (format === 'csv') {
        let csv = 'ID,Pole Name,Sensor Type,Water Level (m),Alert Level,Cause,Confidence,Timestamp\n';
        readings.forEach(row => {
          csv += `"${row.id}","${row.pole_name}","${row.sensor_type}","${row.water_level}","${row.alert_level}","${row.cause.replace(/"/g, '""')}","${row.confidence_score}","${row.timestamp}"\n`;
        });

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename="EIN_Environmental_Report.csv"');
        return res.send(csv);
      }

      res.json(readings);
    } catch (err) {
      console.error('Error generating report download:', err);
      res.status(500).json({ error: 'Failed to generate report' });
    }
  });

  return router;
}
