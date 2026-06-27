import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  getHealthStatus,
  getVersion,
  getIncidents,
  getServiceRequests,
  getAssets,
} from "@/lib/api";

const mockFetch = vi.fn();
vi.stubGlobal("fetch", mockFetch);

function makeFetchResponse(body: unknown, ok = true, status = ok ? 200 : 500) {
  return {
    ok,
    status,
    statusText: ok ? "OK" : "Internal Server Error",
    json: async () => body,
  };
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("getHealthStatus", () => {
  it("returns parsed JSON on success", async () => {
    mockFetch.mockResolvedValue(makeFetchResponse({ status: "ok" }));
    const result = await getHealthStatus();
    expect(result).toEqual({ status: "ok" });
  });

  it("throws on non-ok response", async () => {
    mockFetch.mockResolvedValue(makeFetchResponse({}, false));
    await expect(getHealthStatus()).rejects.toThrow("Health check failed:");
  });
});

describe("getVersion", () => {
  it("returns parsed JSON on success", async () => {
    mockFetch.mockResolvedValue(makeFetchResponse({ version: "1.0.0" }));
    const result = await getVersion();
    expect(result).toEqual({ version: "1.0.0" });
  });

  it("throws on non-ok response", async () => {
    mockFetch.mockResolvedValue(makeFetchResponse({}, false));
    await expect(getVersion()).rejects.toThrow("Version fetch failed:");
  });
});

describe("getIncidents", () => {
  it("returns parsed JSON on success", async () => {
    const mockIncidents = [{ id: "INC-001", title: "Test" }];
    mockFetch.mockResolvedValue(makeFetchResponse(mockIncidents));
    const result = await getIncidents();
    expect(result).toEqual(mockIncidents);
  });

  it("throws on non-ok response", async () => {
    mockFetch.mockResolvedValue(makeFetchResponse({}, false));
    await expect(getIncidents()).rejects.toThrow("Incidents fetch failed:");
  });
});

describe("getServiceRequests", () => {
  it("returns parsed JSON on success", async () => {
    const mockRequests = [{ id: "SR-001", requestType: "VPN Access" }];
    mockFetch.mockResolvedValue(makeFetchResponse(mockRequests));
    const result = await getServiceRequests();
    expect(result).toEqual(mockRequests);
  });

  it("throws on non-ok response", async () => {
    mockFetch.mockResolvedValue(makeFetchResponse({}, false));
    await expect(getServiceRequests()).rejects.toThrow(
      "Service requests fetch failed:"
    );
  });
});

describe("getAssets", () => {
  it("returns parsed JSON on success", async () => {
    const mockAssets = [{ id: "AST-001", assetType: "Windows Laptop" }];
    mockFetch.mockResolvedValue(makeFetchResponse(mockAssets));
    const result = await getAssets();
    expect(result).toEqual(mockAssets);
  });

  it("throws on non-ok response", async () => {
    mockFetch.mockResolvedValue(makeFetchResponse({}, false));
    await expect(getAssets()).rejects.toThrow("Assets fetch failed:");
  });
});
