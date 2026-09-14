import type { NodeItem, Reading, AlertItem, CommunityReport, AnalyticsTrends, User } from '../types';

const API_BASE = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace(/\/$/, '');

function getHeaders() {
  const token = localStorage.getItem('ein_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };
}

export async function fetchNodes(): Promise<NodeItem[]> {
  const res = await fetch(`${API_BASE}/nodes`, { headers: getHeaders() });
  if (!res.ok) throw new Error('Failed to fetch nodes');
  return res.json();
}

export async function fetchNodeDetail(id: string | number): Promise<NodeItem & { readings: Reading[]; alerts: AlertItem[]; nearby: NodeItem[] }> {
  const res = await fetch(`${API_BASE}/nodes/${id}`, { headers: getHeaders() });
  if (!res.ok) throw new Error('Failed to fetch node detail');
  return res.json();
}

export async function createNode(data: Partial<NodeItem>): Promise<NodeItem> {
  const res = await fetch(`${API_BASE}/nodes`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error('Failed to create node');
  return res.json();
}

export async function updateNode(id: number, data: Partial<NodeItem>): Promise<NodeItem> {
  const res = await fetch(`${API_BASE}/nodes/${id}`, {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error('Failed to update node');
  return res.json();
}

export async function deleteNode(id: number): Promise<{ message: string }> {
  const res = await fetch(`${API_BASE}/nodes/${id}`, {
    method: 'DELETE',
    headers: getHeaders()
  });
  if (!res.ok) throw new Error('Failed to delete node');
  return res.json();
}

export async function fetchAlerts(params?: { level?: string; status?: string }): Promise<AlertItem[]> {
  const query = new URLSearchParams(params as Record<string, string>).toString();
  const res = await fetch(`${API_BASE}/alerts?${query}`, { headers: getHeaders() });
  if (!res.ok) throw new Error('Failed to fetch alerts');
  return res.json();
}

export async function acknowledgeAlert(id: number, officerName?: string): Promise<{ message: string; alert: AlertItem }> {
  const res = await fetch(`${API_BASE}/alerts/${id}/acknowledge`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ acknowledged_by: officerName || 'Duty Officer' })
  });
  if (!res.ok) throw new Error('Failed to acknowledge alert');
  return res.json();
}

export async function resolveAlert(id: number): Promise<{ message: string; alert: AlertItem }> {
  const res = await fetch(`${API_BASE}/alerts/${id}/resolve`, {
    method: 'POST',
    headers: getHeaders()
  });
  if (!res.ok) throw new Error('Failed to resolve alert');
  return res.json();
}

export async function fetchAnalytics(): Promise<AnalyticsTrends> {
  const res = await fetch(`${API_BASE}/analytics/trends`, { headers: getHeaders() });
  if (!res.ok) throw new Error('Failed to fetch analytics');
  return res.json();
}

export async function fetchCommunityReports(): Promise<CommunityReport[]> {
  const res = await fetch(`${API_BASE}/community-reports`, { headers: getHeaders() });
  if (!res.ok) throw new Error('Failed to fetch community reports');
  return res.json();
}

export async function submitCommunityReport(data: Partial<CommunityReport>): Promise<{ message: string; report: CommunityReport }> {
  const res = await fetch(`${API_BASE}/community-reports`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error('Failed to submit community report');
  return res.json();
}

export async function verifyCommunityReport(id: number): Promise<{ message: string; report: CommunityReport }> {
  const res = await fetch(`${API_BASE}/community-reports/${id}/verify`, {
    method: 'POST',
    headers: getHeaders()
  });
  if (!res.ok) throw new Error('Failed to verify report');
  return res.json();
}

export async function loginUser(email: string, password: string): Promise<{ token: string; user: User }> {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.error || 'Login failed');
  }
  return res.json();
}
