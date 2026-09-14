import bcrypt from 'bcryptjs';
import { users, nodes, readings, alerts, communityReports, nextId } from './db.js';

const mockNodes = [
  ['Yamuna-Ghat-01', 28.6139, 77.2090, 'water'],
  ['Yamuna-Okhla-02', 28.5448, 77.3090, 'water'],
  ['Brahmaputra-Guwahati-01', 26.1923, 91.7462, 'water'],
  ['Uttarakhand-Kedarnath-01', 30.7346, 79.0669, 'landslide'],
  ['Kerala-Alappuzha-01', 9.4981, 76.3388, 'water'],
  ['Mumbai-MithiRiver-01', 19.0760, 72.8777, 'water'],
  ['Delhi-AnandVihar-01', 28.6469, 77.3160, 'air'],
  ['Bhopal-GasPlantZone-01', 23.2599, 77.4126, 'industrial'],
  ['Shimla-RidgeForest-01', 31.1048, 77.1734, 'fire'],
  ['Chennai-AdyarEstuary-01', 13.0067, 80.2571, 'water']
];

export async function seedDatabase() {
  if (await users.countDocuments() === 0) {
    const passwordHash = await bcrypt.hash('admin123', 10);
    await users.insertOne({ id: 1, name: 'Dr. Rajesh Sharma', email: 'admin@ein.gov.in', password_hash: passwordHash, role: 'admin' });
    await users.insertOne({ id: 2, name: 'Inspector Sunita Verma', email: 'officer@ein.gov.in', password_hash: await bcrypt.hash('officer123', 10), role: 'field_officer' });
    await users.insertOne({ id: 3, name: 'Aarav Mehta', email: 'citizen@ein.gov.in', password_hash: await bcrypt.hash('citizen123', 10), role: 'public' });
  }

  if (await nodes.countDocuments() === 0) {
    const createdNodes = mockNodes.map(([pole_name, latitude, longitude, sensor_type], index) => ({
      id: index + 1,
      pole_name,
      latitude,
      longitude,
      sensor_type,
      deployed_date: '2025-01-15',
      battery_percent: 70 + index * 2,
      signal_strength: 75 + index,
      status: 'online'
    }));
    await nodes.insertMany(createdNodes);

    const now = Date.now();
    const createdReadings = createdNodes.map((node, index) => {
      const alert_level = index === 0 ? 'Critical' : index === 2 || index === 6 ? 'Warning' : 'Safe';
      const cause = alert_level === 'Safe' ? 'Nominal status' : 'Automated sensor threshold trigger';
      return {
        id: index + 1,
        node_id: node.id,
        water_level: alert_level === 'Critical' ? 4.85 : 2 + Math.random() * 2.5,
        alert_level,
        cause,
        confidence_score: 0.9,
        timestamp: new Date(now - index * 3600000).toISOString()
      };
    });
    await readings.insertMany(createdReadings);
    await alerts.insertMany(createdReadings.filter((reading) => ['Warning', 'Critical'].includes(reading.alert_level)).map((reading, index) => ({
      id: index + 1,
      node_id: reading.node_id,
      alert_level: reading.alert_level,
      cause: reading.cause,
      raised_at: reading.timestamp,
      resolved_at: null,
      acknowledged_by: null,
      status: 'active'
    })));
  }

  if (await communityReports.countDocuments() === 0) {
    await communityReports.insertOne({
      id: await nextId(communityReports),
      user_id: 3,
      user_name: 'Aarav Mehta',
      latitude: 28.618,
      longitude: 77.215,
      description: 'Severe riverbank erosion noticed near Yamuna Bridge pillar 4.',
      photo_url: 'https://images.unsplash.com/photo-1547683905-f686c993aae5?auto=format&fit=crop&w=600&q=80',
      submitted_at: new Date().toISOString(),
      verified: 1
    });
  }

  console.log('MongoDB seed data verified.');
}
