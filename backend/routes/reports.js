import express from 'express';
import { communityReports, readings, nodes, nextId } from '../db.js';

export function createReportsRouter(io) {
  const router = express.Router();

  router.get('/community-reports', async (req, res) => {
    try { res.json(await communityReports.find().sort({ submitted_at: -1 }).toArray()); }
    catch (err) { console.error(err); res.status(500).json({ error: 'Failed to fetch community reports' }); }
  });

  router.post('/community-reports', async (req, res) => {
    const { user_id, user_name, latitude, longitude, description, photo_url } = req.body;
    if (latitude === undefined || longitude === undefined || !description) return res.status(400).json({ error: 'Latitude, longitude, and description are required' });
    try {
      const report = { id: await nextId(communityReports), user_id: user_id || null, user_name: user_name || 'Anonymous Citizen', latitude: parseFloat(latitude), longitude: parseFloat(longitude), description, photo_url: photo_url || 'https://images.unsplash.com/photo-1547683905-f686c993aae5?auto=format&fit=crop&w=600&q=80', submitted_at: new Date().toISOString(), verified: 0 };
      await communityReports.insertOne(report);
      io.emit('new_community_report', report);
      res.status(201).json({ message: 'Community report submitted successfully', report });
    } catch (err) { console.error(err); res.status(500).json({ error: 'Failed to submit report' }); }
  });

  router.post('/community-reports/:id/verify', async (req, res) => {
    try {
      const id = Number(req.params.id);
      await communityReports.updateOne({ id }, { $set: { verified: 1 } });
      const report = await communityReports.findOne({ id });
      io.emit('community_report_verified', report);
      res.json({ message: 'Report verified', report });
    } catch (err) { console.error(err); res.status(500).json({ error: 'Failed to verify report' }); }
  });

  router.get('/reports/download', async (req, res) => {
    try {
      const rows = await readings.aggregate([{ $sort: { timestamp: -1 } }, { $limit: 200 }, { $lookup: { from: 'nodes', localField: 'node_id', foreignField: 'id', as: 'node' } }, { $unwind: '$node' }, { $project: { id: 1, pole_name: '$node.pole_name', sensor_type: '$node.sensor_type', water_level: 1, alert_level: 1, cause: 1, confidence_score: 1, timestamp: 1 } }]).toArray();
      if (req.query.format === 'csv') {
        const quote = (value) => `"${String(value ?? '').replace(/"/g, '""')}"`;
        const csv = ['ID,Pole Name,Sensor Type,Water Level (m),Alert Level,Cause,Confidence,Timestamp', ...rows.map((row) => [row.id, row.pole_name, row.sensor_type, row.water_level, row.alert_level, row.cause, row.confidence_score, row.timestamp].map(quote).join(','))].join('\n');
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename="EIN_Environmental_Report.csv"');
        return res.send(csv);
      }
      res.json(rows);
    } catch (err) { console.error(err); res.status(500).json({ error: 'Failed to generate report' }); }
  });

  return router;
}
