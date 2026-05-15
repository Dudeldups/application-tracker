import { describe, expect, it } from "vitest";

import {
  ApiRequestError,
  getErrorMessage,
  getLoadErrorMessage,
  isAbortError,
  isApiRequestError,
} from "./errors";

describe("error helpers", () => {
  it("detects api request errors", () => {
    const error = new ApiRequestError("Not found", 404);

    expect(isApiRequestError(error)).toBe(true);
    expect(isApiRequestError(new Error("Other error"))).toBe(false);
  });

  it("detects abort errors", () => {
    const abortError = new DOMException("Aborted", "AbortError");

    expect(isAbortError(abortError)).toBe(true);
    expect(isAbortError(new Error("No abort"))).toBe(false);
  });

  it("prefers explicit error messages", () => {
    expect(getErrorMessage(new Error("Specific error"), "Fallback")).toBe(
      "Specific error",
    );
  });

  it("falls back when an error has no useful message", () => {
    expect(getErrorMessage(new Error(""), "Fallback")).toBe("Fallback");
    expect(getErrorMessage("plain string", "Fallback")).toBe("Fallback");
  });

  it("maps 404 load errors to the not found message", () => {
    const message = getLoadErrorMessage(
      new ApiRequestError("Backend says missing", 404),
      {
        fallbackMessage: "Could not load.",
        notFoundMessage: "Not found.",
        networkMessage: "Network error.",
      },
    );

    expect(message).toBe("Not found.");
  });

  it("maps network failures to the network message", () => {
    const message = getLoadErrorMessage(new TypeError("Failed to fetch"), {
      fallbackMessage: "Could not load.",
      notFoundMessage: "Not found.",
      networkMessage: "Network error.",
    });

    expect(message).toBe("Network error.");
  });

  it("uses api error messages for non-404 responses", () => {
    const message = getLoadErrorMessage(
      new ApiRequestError("Server exploded", 500),
      {
        fallbackMessage: "Could not load.",
        notFoundMessage: "Not found.",
        networkMessage: "Network error.",
      },
    );

    expect(message).toBe("Server exploded");
  });
});
