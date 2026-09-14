import { db } from './db.js';

export function startSimulator(io) {
  console.log('📡 Sensor Pole Telemetry Live Simulator active (10s interval)...');

  setInterval(() => {
    try {
      const nodes = db.prepare("SELECT * FROM nodes WHERE status = 'online'").all();
      if (!nodes || nodes.length === 0) return;

      // Select a random pole to emit reading
      const randomNode = nodes[Math.floor(Math.random() * nodes.length)];

      const isEmergencyEvent = Math.random() < 0.20; // 20% chance of alert escalation
      let alertLevel = 'Safe';
      let cause = 'Nominal sensor telemetry';
      let waterLevel = (1.5 + Math.random() * 2.2).toFixed(2);

      if (isEmergencyEvent) {
        const triggers = [
          { level: 'Watch', cause: 'Water level approaching Warning threshold', levelVal: 3.8 },
          { level: 'Warning', cause: 'Rapid river discharge increase (+0.95m/hr)', levelVal: 4.3 },
          { level: 'Critical', cause: 'CRITICAL: Severe flood surge detected by edge AI vision', levelVal: 5.1 },
          { level: 'Warning', cause: 'Landslide sensor micro-tremor detected', levelVal: 1.2 },
          { level: 'Warning', cause: 'AQI spike detected (> 380 PM2.5)', levelVal: 0.8 }
        ];
        const selected = triggers[Math.floor(Math.random() * triggers.length)];
        alertLevel = selected.level;
        cause = selected.cause;
        waterLevel = selected.levelVal;
      }

      const timestamp = new Date().toISOString();
      const confidence = parseFloat((0.88 + Math.random() * 0.11).toFixed(2));

      // Insert reading
      const result = db.prepare(`
        INSERT INTO readings (node_id, water_level, alert_level, cause, confidence_score, timestamp)
        VALUES (?, ?, ?, ?, ?, ?)
      `).run(randomNode.id, parseFloat(waterLevel), alertLevel, cause, confidence, timestamp);

      // Raise alert if Warning/Critical
      let raisedAlert = null;
      if (alertLevel === 'Warning' || alertLevel === 'Critical') {
        const existingActive = db.prepare(`
          SELECT * FROM alerts WHERE node_id = ? AND status = 'active'
        `).get(randomNode.id);

        if (!existingActive) {
          const alertRes = db.prepare(`
            INSERT INTO alerts (node_id, alert_level, cause, raised_at, status)
            VALUES (?, ?, ?, ?, 'active')
          `).run(randomNode.id, alertLevel, cause, timestamp);

          raisedAlert = db.prepare('SELECT * FROM alerts WHERE id = ?').get(alertRes.lastInsertRowid);
        }
      }

      const payload = {
        reading_id: result.lastInsertRowid,
        node_id: randomNode.id,
        pole_name: randomNode.pole_name,
        latitude: randomNode.latitude,
        longitude: randomNode.longitude,
        sensor_type: randomNode.sensor_type,
        water_level: parseFloat(waterLevel),
        alert_level: alertLevel,
        cause,
        confidence_score: confidence,
        timestamp,
        raisedAlert
      };

      // Broadcast telemetry to connected web clients
      if (io) {
        io.emit('telemetry_update', payload);

        if (raisedAlert) {
          io.emit('emergency_sos_alert', {
            alert: raisedAlert,
            pole_name: randomNode.pole_name,
            latitude: randomNode.latitude,
            longitude: randomNode.longitude
          });
        }
      }
    } catch (err) {
      console.error('Error in telemetry simulator:', err);
    }
  }, 10000);
}
