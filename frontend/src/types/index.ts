export type AlertLevel = 'Safe' | 'Watch' | 'Warning' | 'Critical';
export type SensorType = 'water' | 'fire' | 'air' | 'landslide' | 'industrial';
export type UserRole = 'admin' | 'field_officer' | 'public';
export type NodeStatus = 'online' | 'offline';

export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
}

export interface NodeItem {
  id: number;
  pole_name: string;
  latitude: number;
  longitude: number;
  sensor_type: SensorType;
  deployed_date: string;
  battery_percent: number;
  signal_strength: number;
  status: NodeStatus;
  water_level?: number;
  alert_level?: AlertLevel;
  cause?: string;
  confidence_score?: number;
  last_reading_time?: string;
}

export interface Reading {
  id: number;
  node_id: number;
  water_level: number;
  alert_level: AlertLevel;
  cause: string;
  confidence_score: number;
  timestamp: string;
}

export interface AlertItem {
  id: number;
  node_id: number;
  pole_name?: string;
  latitude?: number;
  longitude?: number;
  sensor_type?: SensorType;
  alert_level: AlertLevel;
  cause: string;
  raised_at: string;
  resolved_at?: string | null;
  acknowledged_by?: string | null;
  status: 'active' | 'acknowledged' | 'resolved';
}

export interface CommunityReport {
  id: number;
  user_id?: number | null;
  user_name?: string;
  latitude: number;
  longitude: number;
  description: string;
  photo_url?: string;
  submitted_at: string;
  verified: number;
}

export interface AnalyticsTrends {
  summary: {
    totalNodes: number;
    activeCritical: number;
    offlineNodes: number;
    avgWaterLevel: number;
  };
  basinTrends: Array<{ month: string; Yamuna: number; Brahmaputra: number; Kerala: number; Uttarakhand: number }>;
  aqiTrends: Array<{ time: string; Delhi: number; Mumbai: number; Guwahati: number; Rishikesh: number }>;
  fireSeasonality: Array<{ season: string; incidents: number; riskIndex: string }>;
  rainfallCorrelation: Array<{ rainfall_mm: number; flood_risk: number; water_level: number }>;
}
