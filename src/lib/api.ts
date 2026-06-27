import type { Incident, ServiceRequest, Asset } from "@/data/mock-data";

const baseUrl = import.meta.env.VITE_API_BASE_URL;

if (!baseUrl) {
  throw new Error("VITE_API_BASE_URL environment variable is not configured");
}

export async function getHealthStatus(): Promise<{ status: string }> {
  const res = await fetch(`${baseUrl}/health`);
  if (!res.ok) throw new Error(`Health check failed: ${res.status} ${res.statusText}`);
  return await res.json();
}

export async function getVersion(): Promise<{ version: string }> {
  const res = await fetch(`${baseUrl}/version`);
  if (!res.ok) throw new Error(`Version fetch failed: ${res.status} ${res.statusText}`);
  return await res.json();
}

export async function getIncidents(): Promise<Incident[]> {
  const res = await fetch(`${baseUrl}/incidents`);
  if (!res.ok) throw new Error(`Incidents fetch failed: ${res.status} ${res.statusText}`);
  return await res.json();
}

export async function getServiceRequests(): Promise<ServiceRequest[]> {
  const res = await fetch(`${baseUrl}/service-requests`);
  if (!res.ok) throw new Error(`Service requests fetch failed: ${res.status} ${res.statusText}`);
  return await res.json();
}

export async function getAssets(): Promise<Asset[]> {
  const res = await fetch(`${baseUrl}/assets`);
  if (!res.ok) throw new Error(`Assets fetch failed: ${res.status} ${res.statusText}`);
  return await res.json();
}
