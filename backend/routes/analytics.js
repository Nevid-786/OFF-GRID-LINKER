import express from 'express';
import { nodes, alerts, readings } from '../db.js';

const router = express.Router();

router.get('/trends', async (req, res) => {
  try {
    const [totalNodes, activeCritical, offlineNodes, average] = await Promise.all([
      nodes.countDocuments(),
      alerts.countDocuments({ alert_level: { $in: ['Critical', 'Warning'] }, status: 'active' }),
      nodes.countDocuments({ status: 'offline' }),
      readings.aggregate([{ $match: { alert_level: { $ne: 'Offline' } } }, { $group: { _id: null, average: { $avg: '$water_level' } } }]).next()
    ]);
    const basinTrends = [
      { month: 'Jan', Yamuna: 2.1, Brahmaputra: 3.2, Kerala: 1.8, Uttarakhand: 1.2 }, { month: 'Feb', Yamuna: 2, Brahmaputra: 3.1, Kerala: 1.9, Uttarakhand: 1.1 }, { month: 'Mar', Yamuna: 2.2, Brahmaputra: 3.4, Kerala: 2.1, Uttarakhand: 1.3 }, { month: 'Apr', Yamuna: 2.5, Brahmaputra: 3.8, Kerala: 2.4, Uttarakhand: 1.5 }, { month: 'May', Yamuna: 2.8, Brahmaputra: 4.2, Kerala: 2.9, Uttarakhand: 1.8 }, { month: 'Jun', Yamuna: 3.6, Brahmaputra: 4.9, Kerala: 3.8, Uttarakhand: 2.4 }, { month: 'Jul', Yamuna: 4.8, Brahmaputra: 5.6, Kerala: 4.5, Uttarakhand: 3.2 }, { month: 'Aug', Yamuna: 4.5, Brahmaputra: 5.4, Kerala: 4.2, Uttarakhand: 3 }, { month: 'Sep', Yamuna: 3.9, Brahmaputra: 4.7, Kerala: 3.5, Uttarakhand: 2.2 }
    ];
    res.json({ summary: { totalNodes, activeCritical, offlineNodes, avgWaterLevel: average ? Number(average.average.toFixed(2)) : 2.45 }, basinTrends, aqiTrends: [], fireSeasonality: [], rainfallCorrelation: [] });
  } catch (err) {
    console.error('Error fetching analytics:', err);
    res.status(500).json({ error: 'Failed to fetch analytics trends' });
  }
});

export default router;
