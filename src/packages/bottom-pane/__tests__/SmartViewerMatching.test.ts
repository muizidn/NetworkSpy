/**
 * SmartViewerMatching Unit Tests
 *
 * SmartViewerMatching is responsible for scoring viewer modes against
 * intercepted traffic. It evaluates two kinds of matchers:
 *
 *  1. Glob matchers — URL pattern strings with wildcard support.
 *   Example: "*\/graphql" matches /anything/graphql.
 *     Substring matching is also supported (url.includes(pattern)).
 *
 *  2. JS matchers — async JavaScript functions evaluated at runtime
 *     with access to traffic metadata, request/response headers, and
 *     request/response bodies. They return true/false.
 *
 * Each built-in or custom viewer can declare multiple matchers.
 * A viewer's score is the count of its matchers that return true.
 * Only viewers with score > 0 appear in the result map.
 */

import { describe, it, expect, vi } from "vitest";
import { SmartViewerMatching, TrafficDataProvider } from "../SmartViewerMatching";
import { ViewerMatcher, Viewer } from "@src/context/ViewerContext";

/**
 * Creates a mock TrafficDataProvider with stubbed request/response data.
 * By default returns empty headers and body to keep glob-only tests simple.
 */
const makeProvider = (overrides?: Partial<TrafficDataProvider>): TrafficDataProvider => ({
  getRequestPairData: vi.fn().mockResolvedValue({ headers: [], body: "" }),
  getResponsePairData: vi.fn().mockResolvedValue({ headers: [], body: "" }),
  ...overrides,
});

/**
 * Creates a mock Viewer with empty blocks/matchers. Override `content`
 * or other fields as needed for specific test cases.
 */
const makeViewer = (overrides?: Partial<Viewer>): Viewer => ({
  id: "v1",
  name: "Test Viewer",
  content: JSON.stringify({ blocks: [], matchers: [] }),
  createdAt: new Date().toISOString(),
  ...overrides,
});

describe("SmartViewerMatching", () => {
  /**
   * Glob matchers use wildcard patterns to match against the
   * traffic URL. The `*` character matches any sequence of
   * characters (converted to `.*` in regex). Non-wildcard
   * globs fall back to substring matching via `url.includes()`.
   */
  describe("glob matching", () => {
    it("matches exact URL path", async () => {
      const builtin: Record<string, ViewerMatcher[]> = {
        graphql: [{ glob: "*/graphql" }],
      };
      const matcher = new SmartViewerMatching(makeProvider(), builtin, []);
      const traffic = { id: "t1", url: "https://api.example.com/graphql" };

      const scores = await matcher.matchTraffic("t1", traffic);
      expect(scores).toHaveProperty("graphql");
      expect(scores.graphql).toBeGreaterThan(0);
    });

    it("does not match wrong URL path", async () => {
      const builtin: Record<string, ViewerMatcher[]> = {
        graphql: [{ glob: "*/graphql" }],
      };
      const matcher = new SmartViewerMatching(makeProvider(), builtin, []);
      const traffic = { id: "t1", url: "https://api.example.com/rest/v1/users" };

      const scores = await matcher.matchTraffic("t1", traffic);
      expect(scores).not.toHaveProperty("graphql");
    });

    it("matches wildcard glob with *graphql*", async () => {
      const builtin: Record<string, ViewerMatcher[]> = {
        graphql: [{ glob: "*graphql*" }],
      };
      const matcher = new SmartViewerMatching(makeProvider(), builtin, []);
      const traffic = { id: "t1", url: "https://api.example.com/graphql" };

      const scores = await matcher.matchTraffic("t1", traffic);
      expect(scores).toHaveProperty("graphql");
    });

    it("matches partial URL substring via glob", async () => {
      const builtin: Record<string, ViewerMatcher[]> = {
        custom: [{ glob: "graphql" }],
      };
      const matcher = new SmartViewerMatching(makeProvider(), builtin, []);
      const traffic = { id: "t1", url: "https://my-graphql-server.com/query" };

      const scores = await matcher.matchTraffic("t1", traffic);
      expect(scores).toHaveProperty("custom");
    });
  });

  /**
   * JS matchers are evaluated as async functions with access to:
   *   - traffic   — the traffic metadata object
   *   - readRequestHeaders()  — return type dictionary of request headers
   *   - readRequestBody()     — returns the decoded request body string
   *   - readResponseHeaders() — returns a normalized dictionary of response headers
   *   - readResponseBody()    — returns the decoded response body string
   *   - getHeader(headers, name) — case-insensitive header lookup helper
   *
   * They return a boolean indicating whether the traffic matches.
   * Thrown errors are caught and treated as "no match".
   */
  describe("JS matcher", () => {
    it("evaluates JS matcher returning true", async () => {
      const builtin: Record<string, ViewerMatcher[]> = {
        json_viewer: [{ js: "return traffic.url.includes('.json')" }],
      };
      const matcher = new SmartViewerMatching(makeProvider(), builtin, []);
      const traffic = { id: "t1", url: "https://api.example.com/data.json" };

      const scores = await matcher.matchTraffic("t1", traffic);
      expect(scores).toHaveProperty("json_viewer");
    });

    it("ignores JS matcher returning false", async () => {
      const builtin: Record<string, ViewerMatcher[]> = {
        json_viewer: [{ js: "return traffic.url.includes('.json')" }],
      };
      const matcher = new SmartViewerMatching(makeProvider(), builtin, []);
      const traffic = { id: "t1", url: "https://api.example.com/data.xml" };

      const scores = await matcher.matchTraffic("t1", traffic);
      expect(scores).not.toHaveProperty("json_viewer");
    });

    it("handles JS matcher that throws gracefully", async () => {
      const builtin: Record<string, ViewerMatcher[]> = {
        bad: [{ js: "throw new Error('oops')" }],
      };
      const matcher = new SmartViewerMatching(makeProvider(), builtin, []);
      const traffic = { id: "t1", url: "https://example.com" };

      const scores = await matcher.matchTraffic("t1", traffic);
      expect(scores).not.toHaveProperty("bad");
    });

    it("ignores empty JS matcher", async () => {
      const builtin: Record<string, ViewerMatcher[]> = {
        empty: [{ js: "" }],
      };
      const matcher = new SmartViewerMatching(makeProvider(), builtin, []);
      const traffic = { id: "t1", url: "https://example.com" };

      const scores = await matcher.matchTraffic("t1", traffic);
      expect(scores).not.toHaveProperty("empty");
    });
  });

  /**
   * When a viewer declares multiple matchers (both glob and JS),
   * each one contributes to its final score. The score equals the
   * total number of matchers that return true. This allows viewers
   * with highly-specific criteria (e.g. URL + header + body checks)
   * to rank higher than generic matchers.
   */
  describe("combined matchers", () => {
    it("scores higher when multiple matchers match", async () => {
      const builtin: Record<string, ViewerMatcher[]> = {
        graphql: [
          { glob: "*graphql*" },
          { js: "return traffic.url.includes('/graphql')" },
        ],
      };
      const matcher = new SmartViewerMatching(makeProvider(), builtin, []);
      const traffic = { id: "t1", url: "https://api.example.com/graphql" };

      const scores = await matcher.matchTraffic("t1", traffic);
      expect(scores.graphql).toBe(2);
    });

    it("has higher score when both JS checks pass", async () => {
      const builtin: Record<string, ViewerMatcher[]> = {
        graphql: [
          { js: "return true" },
          { js: "return true" },
        ],
      };
      const matcher = new SmartViewerMatching(makeProvider(), builtin, []);
      const traffic = { id: "t1", url: "https://example.com" };

      const scores = await matcher.matchTraffic("t1", traffic);
      expect(scores.graphql).toBe(2);
    });
  });

  /**
   * Custom viewers are user-created viewers stored in the app's
   * YAML config. Each viewer's content is a JSON string containing
   * a `matchers` array. Invalid JSON or missing matchers are
   * silently skipped (score 0).
   */
  describe("custom viewer matchers", () => {
    it("scores custom viewers with matchers", async () => {
      const viewers: Viewer[] = [
        makeViewer({
          id: "custom1",
          content: JSON.stringify({
            blocks: [],
            matchers: [{ glob: "*admin*" }],
          }),
        }),
      ];
      const matcher = new SmartViewerMatching(makeProvider(), {}, viewers);
      const traffic = { id: "t1", url: "https://admin.example.com/dashboard" };

      const scores = await matcher.matchTraffic("t1", traffic);
      expect(scores).toHaveProperty("custom1");
    });

    it("skips custom viewers with invalid content", async () => {
      const viewers: Viewer[] = [
        makeViewer({ id: "bad", content: "not-json" }),
      ];
      const matcher = new SmartViewerMatching(makeProvider(), {}, viewers);
      const traffic = { id: "t1", url: "https://example.com" };

      const scores = await matcher.matchTraffic("t1", traffic);
      expect(scores).not.toHaveProperty("bad");
    });
  });

  /**
   * When no built-in matchers are registered and no custom viewers
   * exist, matchTraffic should return an empty record without
   * errors.
   */
  describe("empty inputs", () => {
    it("returns empty scores for empty builtin matchers and no viewers", async () => {
      const matcher = new SmartViewerMatching(makeProvider(), {}, []);
      const traffic = { id: "t1", url: "https://example.com" };

      const scores = await matcher.matchTraffic("t1", traffic);
      expect(scores).toEqual({});
    });
  });
});
