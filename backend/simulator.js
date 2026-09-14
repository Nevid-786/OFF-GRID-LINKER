import { nodes, readings, alerts, nextId } from './db.js';

export function startSimulator(io) {
  console.log('Sensor Pole Telemetry Live Simulator active (10s interval)...');
  setInterval(async () => {
    try {
      const activeNodes = await nodes.find({ status: 'online' }).toArray();
      if (!activeNodes.length) return;
      const node = activeNodes[Math.floor(Math.random() * activeNodes.length)];
      const emergency = Math.random() < 0.2;
      const selected = emergency ? [
        { level: 'Watch', cause: 'Water level approaching Warning threshold', value: 3.8 },
        { level: 'Warning', cause: 'Rapid river discharge increase (+0.95m/hr)', value: 4.3 },
        { level: 'Critical', cause: 'Severe flood surge detected by edge AI vision', value: 5.1 }
      ][Math.floor(Math.random() * 3)] : { level: 'Safe', cause: 'Nominal sensor telemetry', value: 1.5 + Math.random() * 2.2 };
      const timestamp = new Date().toISOString();
      const reading = { id: await nextId(readings), node_id: node.id, water_level: Number(selected.value.toFixed(2)), alert_level: selected.level, cause: selected.cause, confidence_score: Number((0.88 + Math.random() * 0.11).toFixed(2)), timestamp };
      await readings.insertOne(reading);
      let raisedAlert = null;
      if (['Warning', 'Critical'].includes(reading.alert_level) && !await alerts.findOne({ node_id: node.id, status: 'active' })) {
        raisedAlert = { id: await nextId(alerts), node_id: node.id, alert_level: reading.alert_level, cause: reading.cause, raised_at: timestamp, resolved_at: null, acknowledged_by: null, status: 'active' };
        await alerts.insertOne(raisedAlert);
      }
      io.emit('telemetry_update', { reading_id: reading.id, ...node, ...reading, raisedAlert });
      if (raisedAlert) io.emit('emergency_sos_alert', { alert: raisedAlert, pole_name: node.pole_name, latitude: node.latitude, longitude: node.longitude });
    } catch (err) { console.error('Error in telemetry simulator:', err); }
  }, 10000);
}
