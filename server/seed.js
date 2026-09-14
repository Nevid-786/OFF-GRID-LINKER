import bcrypt from 'bcryptjs';
import { db, initDb } from './db.js';

export function seedDatabase() {
  initDb();

  // Seed Users
  const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get().count;
  if (userCount === 0) {
    const salt = bcrypt.genSaltSync(10);
    const passHashAdmin = bcrypt.hashSync('admin123', salt);
    const passHashOfficer = bcrypt.hashSync('officer123', salt);
    const passHashPublic = bcrypt.hashSync('citizen123', salt);

    const insertUser = db.prepare('INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)');
    insertUser.run('Dr. Rajesh Sharma', 'admin@ein.gov.in', passHashAdmin, 'admin');
    insertUser.run('Inspector Sunita Verma', 'officer@ein.gov.in', passHashOfficer, 'field_officer');
    insertUser.run('Aarav Mehta', 'citizen@ein.gov.in', passHashPublic, 'public');
    console.log('Seeded default users.');
  }

  // Seed Nodes
  const nodeCount = db.prepare('SELECT COUNT(*) as count FROM nodes').get().count;
  if (nodeCount === 0) {
    const mockNodes = [
      // Yamuna Basin (Delhi / UP)
      { name: 'Yamuna-Ghat-01', lat: 28.6139, lng: 77.2090, type: 'water', status: 'online', battery: 94, signal: 88 },
      { name: 'Yamuna-Okhla-02', lat: 28.5448, lng: 77.3090, type: 'water', status: 'online', battery: 82, signal: 91 },
      { name: 'Yamuna-Wazirabad-03', lat: 28.7180, lng: 77.2285, type: 'water', status: 'online', battery: 76, signal: 85 },
      { name: 'Yamuna-ItoBridge-04', lat: 28.6289, lng: 77.2480, type: 'water', status: 'online', battery: 65, signal: 94 },
      { name: 'Yamuna-NoidaBarrage-05', lat: 28.5601, lng: 77.3195, type: 'water', status: 'online', battery: 89, signal: 79 },

      // Brahmaputra Basin (Assam)
      { name: 'Brahmaputra-Guwahati-01', lat: 26.1923, lng: 91.7462, type: 'water', status: 'online', battery: 91, signal: 83 },
      { name: 'Brahmaputra-Majuli-02', lat: 26.9500, lng: 94.1667, type: 'water', status: 'online', battery: 70, signal: 62 },
      { name: 'Brahmaputra-Tezpur-03', lat: 26.6338, lng: 92.8006, type: 'water', status: 'online', battery: 88, signal: 89 },
      { name: 'Brahmaputra-Dibrugarh-04', lat: 27.4728, lng: 94.9120, type: 'water', status: 'online', battery: 58, signal: 74 },

      // Uttarakhand Hills (Landslide / Wildfire / Cloudburst)
      { name: 'Uttarakhand-Kedarnath-01', lat: 30.7346, lng: 79.0669, type: 'landslide', status: 'online', battery: 95, signal: 78 },
      { name: 'Uttarakhand-Joshimath-02', lat: 30.5564, lng: 79.5661, type: 'landslide', status: 'online', battery: 83, signal: 69 },
      { name: 'Uttarakhand-Rishikesh-03', lat: 30.0869, lng: 78.2676, type: 'water', status: 'online', battery: 92, signal: 96 },
      { name: 'Uttarakhand-NainitalPine-04', lat: 29.3919, lng: 79.4542, type: 'fire', status: 'online', battery: 87, signal: 84 },
      { name: 'Uttarakhand-ChamoliSlope-05', lat: 30.4042, lng: 79.3325, type: 'landslide', status: 'offline', battery: 12, signal: 18 },

      // Kerala Backwaters & Western Ghats (Flood / Landslide)
      { name: 'Kerala-Alappuzha-01', lat: 9.4981, lng: 76.3388, type: 'water', status: 'online', battery: 90, signal: 92 },
      { name: 'Kerala-WayanadSlope-02', lat: 11.6854, lng: 76.1320, type: 'landslide', status: 'online', battery: 79, signal: 81 },
      { name: 'Kerala-IdukkiDam-03', lat: 9.8458, lng: 76.9745, type: 'water', status: 'online', battery: 98, signal: 95 },
      { name: 'Kerala-MunroeIsland-04', lat: 8.9950, lng: 76.6128, type: 'water', status: 'online', battery: 81, signal: 77 },

      // Mumbai Coastal & Industrial Zone (AQI / Chemical / Urban Flood)
      { name: 'Mumbai-MithiRiver-01', lat: 19.0760, lng: 72.8777, type: 'water', status: 'online', battery: 85, signal: 88 },
      { name: 'Mumbai-ChemburInd-02', lat: 19.0544, lng: 72.8942, type: 'industrial', status: 'online', battery: 94, signal: 90 },
      { name: 'Mumbai-MahulAir-03', lat: 19.0116, lng: 72.8872, type: 'air', status: 'online', battery: 77, signal: 82 },
      { name: 'Mumbai-ThaneCreek-04', lat: 19.1860, lng: 72.9759, type: 'industrial', status: 'online', battery: 88, signal: 86 },

      // North & Central Urban Stations (AQI / Fire)
      { name: 'Delhi-AnandVihar-01', lat: 28.6469, lng: 77.3160, type: 'air', status: 'online', battery: 92, signal: 94 },
      { name: 'Delhi-PunjabiBagh-02', lat: 28.6700, lng: 77.1300, type: 'air', status: 'online', battery: 84, signal: 91 },
      { name: 'Bhopal-GasPlantZone-01', lat: 23.2599, lng: 77.4126, type: 'industrial', status: 'online', battery: 96, signal: 95 },
      { name: 'Shimla-RidgeForest-01', lat: 31.1048, lng: 77.1734, type: 'fire', status: 'online', battery: 89, signal: 79 },
      { name: 'Sunderbans-Delta-01', lat: 21.9497, lng: 88.9007, type: 'water', status: 'online', battery: 64, signal: 55 },
      { name: 'Chennai-AdyarEstuary-01', lat: 13.0067, lng: 80.2571, type: 'water', status: 'online', battery: 90, signal: 93 },
      { name: 'Bangalore-PeenyaInd-01', lat: 13.0285, lng: 77.5197, type: 'industrial', status: 'online', battery: 93, signal: 92 }
    ];

    const insertNode = db.prepare(`
      INSERT INTO nodes (pole_name, latitude, longitude, sensor_type, deployed_date, battery_percent, signal_strength, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const insertReading = db.prepare(`
      INSERT INTO readings (node_id, water_level, alert_level, cause, confidence_score, timestamp)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    const insertAlert = db.prepare(`
      INSERT INTO alerts (node_id, alert_level, cause, raised_at, status)
      VALUES (?, ?, ?, ?, ?)
    `);

    const now = new Date();

    mockNodes.forEach((n, idx) => {
      const result = insertNode.run(
        n.name,
        n.lat,
        n.lng,
        n.type,
        '2025-01-15',
        n.battery,
        n.signal,
        n.status
      );

      const nodeId = result.lastInsertRowid;

      // Determine mock alert level & initial reading
      let alertLevel = 'Safe';
      let cause = 'Nominal status';
      let waterLevel = (2.0 + Math.random() * 2.5).toFixed(2);

      if (idx === 0) { // Yamuna-Ghat-01
        alertLevel = 'Critical';
        cause = 'Water level crossed Danger Threshold (4.8m)';
        waterLevel = 4.85;
      } else if (idx === 5) { // Brahmaputra
        alertLevel = 'Warning';
        cause = 'Rapid discharge rate increase (+0.8m/hr)';
        waterLevel = 4.20;
      } else if (idx === 9) { // Kedarnath
        alertLevel = 'Watch';
        cause = 'Subtle slope deformation detected';
        waterLevel = 1.10;
      } else if (idx === 20) { // Delhi Anand Vihar
        alertLevel = 'Warning';
        cause = 'AQI Hazardous Index > 420 PM2.5';
        waterLevel = 0.50;
      }

      const timestamp = new Date(now.getTime() - idx * 3600000).toISOString();

      insertReading.run(
        nodeId,
        parseFloat(waterLevel),
        alertLevel,
        cause,
        parseFloat((0.85 + Math.random() * 0.14).toFixed(2)),
        timestamp
      );

      if (alertLevel === 'Warning' || alertLevel === 'Critical') {
        insertAlert.run(nodeId, alertLevel, cause, timestamp, 'active');
      }
    });

    console.log(`Seeded ${mockNodes.length} nodes and initial telemetry.`);
  }

  // Seed Community Reports
  const reportCount = db.prepare('SELECT COUNT(*) as count FROM community_reports').get().count;
  if (reportCount === 0) {
    const insertReport = db.prepare(`
      INSERT INTO community_reports (user_id, user_name, latitude, longitude, description, photo_url, submitted_at, verified)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    insertReport.run(
      3,
      'Aarav Mehta',
      28.6180,
      77.2150,
      'Severe riverbank erosion noticed near Yamuna Bridge pillar 4. Water fast approaching embankment.',
      'https://images.unsplash.com/photo-1547683905-f686c993aae5?auto=format&fit=crop&w=600&q=80',
      new Date(Date.now() - 7200000).toISOString(),
      1
    );

    insertReport.run(
      null,
      'Local Resident (Anonymous)',
      26.1950,
      91.7500,
      'Debris accummulating near Brahmaputra drainage culvert, risk of local overflow.',
      'https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=600&q=80',
      new Date(Date.now() - 3600000).toISOString(),
      0
    );

    console.log('Seeded community reports.');
  }
}
