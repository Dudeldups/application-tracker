import { describe, expect, it, vi, afterEach } from "vitest";

import { applicationDetailLoader } from "./applicationLoaders";

const originalFetch = globalThis.fetch;

function buildLoaderArgs(id: string) {
  return {
    params: { id },
    request: new Request(`http://localhost/applications/${id}`),
    context: undefined,
    url: new URL(`http://localhost/applications/${id}`),
    pattern: "/applications/:id",
  } as Parameters<typeof applicationDetailLoader>[0];
}

describe("applicationDetailLoader", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    globalThis.fetch = originalFetch;
  });

  it("maps 404 responses to a not found message", async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 404,
      json: async () => ({ error: "Application not found" }),
    }) as typeof fetch;

    const result = await applicationDetailLoader(buildLoaderArgs("missing-id"));

    expect(result).toEqual({
      application: null,
      error: "Application not found.",
    });
  });

  it("maps network failures to a service unavailable message", async () => {
    globalThis.fetch = vi.fn().mockRejectedValue(new TypeError("Failed to fetch")) as typeof fetch;

    const result = await applicationDetailLoader(buildLoaderArgs("app-1"));

    expect(result).toEqual({
      application: null,
      error: "The application service could not be reached.",
    });
  });

  it("rethrows aborted requests", async () => {
    const abortError = new DOMException("The operation was aborted.", "AbortError");

    globalThis.fetch = vi.fn().mockRejectedValue(abortError) as typeof fetch;

    await expect(
      applicationDetailLoader(buildLoaderArgs("app-1")),
    ).rejects.toThrow("The operation was aborted.");
  });
});
