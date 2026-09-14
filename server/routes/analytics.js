import express from 'express';
import { db } from '../db.js';

const router = express.Router();

// GET /api/analytics/trends
router.get('/trends', (req, res) => {
  try {
    const totalNodes = db.prepare('SELECT COUNT(*) as count FROM nodes').get().count;
    const activeCritical = db.prepare("SELECT COUNT(*) as count FROM alerts WHERE alert_level IN ('Critical', 'Warning') AND status = 'active'").get().count;
    const offlineNodes = db.prepare("SELECT COUNT(*) as count FROM nodes WHERE status = 'offline'").get().count;
    const avgWaterLevelRes = db.prepare("SELECT AVG(water_level) as avg FROM readings WHERE alert_level != 'Offline'").get().avg;
    const avgWaterLevel = avgWaterLevelRes ? parseFloat(avgWaterLevelRes.toFixed(2)) : 2.45;

    const basinTrends = [
      { month: 'Jan', Yamuna: 2.1, Brahmaputra: 3.2, Kerala: 1.8, Uttarakhand: 1.2 },
      { month: 'Feb', Yamuna: 2.0, Brahmaputra: 3.1, Kerala: 1.9, Uttarakhand: 1.1 },
      { month: 'Mar', Yamuna: 2.2, Brahmaputra: 3.4, Kerala: 2.1, Uttarakhand: 1.3 },
      { month: 'Apr', Yamuna: 2.5, Brahmaputra: 3.8, Kerala: 2.4, Uttarakhand: 1.5 },
      { month: 'May', Yamuna: 2.8, Brahmaputra: 4.2, Kerala: 2.9, Uttarakhand: 1.8 },
      { month: 'Jun', Yamuna: 3.6, Brahmaputra: 4.9, Kerala: 3.8, Uttarakhand: 2.4 },
      { month: 'Jul', Yamuna: 4.8, Brahmaputra: 5.6, Kerala: 4.5, Uttarakhand: 3.2 },
      { month: 'Aug', Yamuna: 4.5, Brahmaputra: 5.4, Kerala: 4.2, Uttarakhand: 3.0 },
      { month: 'Sep', Yamuna: 3.9, Brahmaputra: 4.7, Kerala: 3.5, Uttarakhand: 2.2 }
    ];

    const aqiTrends = [
      { time: '00:00', Delhi: 340, Mumbai: 140, Guwahati: 85, Rishikesh: 42 },
      { time: '04:00', Delhi: 380, Mumbai: 155, Guwahati: 92, Rishikesh: 45 },
      { time: '08:00', Delhi: 425, Mumbai: 180, Guwahati: 110, Rishikesh: 52 },
      { time: '12:00', Delhi: 390, Mumbai: 165, Guwahati: 105, Rishikesh: 48 },
      { time: '16:00', Delhi: 365, Mumbai: 150, Guwahati: 98, Rishikesh: 44 },
      { time: '20:00', Delhi: 410, Mumbai: 175, Guwahati: 115, Rishikesh: 50 }
    ];

    const fireSeasonality = [
      { season: 'Winter (Dec-Feb)', incidents: 14, riskIndex: 'Low' },
      { season: 'Spring (Mar-Apr)', incidents: 58, riskIndex: 'High' },
      { season: 'Pre-Monsoon (May)', incidents: 89, riskIndex: 'Critical' },
      { season: 'Monsoon (Jun-Sep)', incidents: 8, riskIndex: 'Minimal' },
      { season: 'Post-Monsoon (Oct-Nov)', incidents: 27, riskIndex: 'Moderate' }
    ];

    const rainfallCorrelation = [
      { rainfall_mm: 10, flood_risk: 15, water_level: 1.8 },
      { rainfall_mm: 30, flood_risk: 28, water_level: 2.2 },
      { rainfall_mm: 60, flood_risk: 45, water_level: 2.9 },
      { rainfall_mm: 100, flood_risk: 68, water_level: 3.7 },
      { rainfall_mm: 150, flood_risk: 88, water_level: 4.4 },
      { rainfall_mm: 200, flood_risk: 98, water_level: 5.1 }
    ];

    res.json({
      summary: {
        totalNodes,
        activeCritical,
        offlineNodes,
        avgWaterLevel
      },
      basinTrends,
      aqiTrends,
      fireSeasonality,
      rainfallCorrelation
    });
  } catch (err) {
    console.error('Error fetching analytics:', err);
    res.status(500).json({ error: 'Failed to fetch analytics trends' });
  }
});

export default router;
