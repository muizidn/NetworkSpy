import { describe, it, expect } from "vitest";
import { parseCurl } from "./curlParser";

const curlCommand = `curl --request POST \\
  --url 'https://api.example.com/v1/orders?include=items,customer&expand=payments' \\
  --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' \\
  --header 'Content-Type: application/json' \\
  --header 'Accept: application/json' \\
  --header 'X-Request-ID: req_123456789' \\
  --header 'X-Client-Version: 2.4.1' \\
  --header 'X-Platform: ios' \\
  --header 'User-Agent: MyApp/2.4.1 (iPhone15,3; iOS 18.0)' \\
  --cookie 'session_id=abc123; locale=en-US' \\
  --data '{
    "customer": {
      "id": "cust_123",
      "email": "john@example.com"
    },
    "items": [
      {
        "sku": "SKU-001",
        "quantity": 2,
        "price": 100
      },
      {
        "sku": "SKU-002",
        "quantity": 1,
        "price": 250
      }
    ],
    "shipping": {
      "address": {
        "street": "123 Main Street",
        "city": "Jakarta",
        "country": "ID"
      }
    },
    "metadata": {
      "source": "mobile_app",
      "campaign": "summer_sale"
    }
  }' \\
  --compressed \\
  --verbose \\
  --write-out '\\n\\nDNS: %{time_namelookup}s\\nConnect: %{time_connect}s\\nTTFB: %{time_starttransfer}s\\nTotal: %{time_total}s\\n'`;

describe("parseCurl", () => {
  describe("full curl command", () => {
    const result = parseCurl(curlCommand);

    it("parses the method as POST", () => {
      expect(result.method).toBe("POST");
    });

    it("parses the URL from --url flag", () => {
      expect(result.url).toBe("https://api.example.com/v1/orders?include=items,customer&expand=payments");
    });

    it("parses all headers", () => {
      expect(result.headers).toEqual([
        { key: "Authorization", value: "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." },
        { key: "Content-Type", value: "application/json" },
        { key: "Accept", value: "application/json" },
        { key: "X-Request-ID", value: "req_123456789" },
        { key: "X-Client-Version", value: "2.4.1" },
        { key: "X-Platform", value: "ios" },
        { key: "User-Agent", value: "MyApp/2.4.1 (iPhone15,3; iOS 18.0)" },
        { key: "Cookie", value: "session_id=abc123; locale=en-US" },
      ]);
    });

    it("parses the JSON body", () => {
      expect(result.body).toBeTruthy();
      const parsed = JSON.parse(result.body!);
      expect(parsed.customer.id).toBe("cust_123");
      expect(parsed.items).toHaveLength(2);
      expect(parsed.shipping.address.city).toBe("Jakarta");
    });
  });

  describe("--url flag", () => {
    it("parses URL from --url with quoted value", () => {
      const r = parseCurl("curl --url 'https://example.com/api'");
      expect(r.url).toBe("https://example.com/api");
    });

    it("parses URL from --url with unquoted value", () => {
      const r = parseCurl("curl --url https://example.com/api");
      expect(r.url).toBe("https://example.com/api");
    });

    it("parses URL from --url=value form", () => {
      const r = parseCurl("curl --url=https://example.com/api");
      expect(r.url).toBe("https://example.com/api");
    });

    it("--url sets the URL (overrides positional if later)", () => {
      const r = parseCurl("curl https://old.example.com --url https://new.example.com");
      expect(r.url).toBe("https://new.example.com");
    });
  });

  describe("--cookie flag", () => {
    it("parses --cookie as a Cookie header", () => {
      const r = parseCurl("curl --cookie 'session=abc123' https://example.com");
      expect(r.headers).toContainEqual({ key: "Cookie", value: "session=abc123" });
    });

    it("parses -b as a Cookie header", () => {
      const r = parseCurl("curl -b 'session=abc123' https://example.com");
      expect(r.headers).toContainEqual({ key: "Cookie", value: "session=abc123" });
    });

    it("parses --cookie with multiple cookie values", () => {
      const r = parseCurl("curl --cookie 'a=1; b=2; c=3' https://example.com");
      expect(r.headers).toContainEqual({ key: "Cookie", value: "a=1; b=2; c=3" });
    });
  });

  describe("--flag=value tokenizer", () => {
    it("parses --flag=value form for --header", () => {
      const r = parseCurl('curl --header=Authorization:Bearer\\ token https://example.com');
      expect(r.headers).toContainEqual({ key: "Authorization", value: "Bearer token" });
    });

    it("parses --flag=value form for --data with quoted body", () => {
      const r = parseCurl("curl --data='{\"key\":\"value\"}' https://example.com");
      expect(r.body).toBe('{"key":"value"}');
    });
  });

  describe("basic requests", () => {
    it("parses a simple GET request", () => {
      const r = parseCurl("curl https://example.com");
      expect(r.method).toBe("GET");
      expect(r.url).toBe("https://example.com");
      expect(r.headers).toEqual([]);
      expect(r.body).toBeNull();
    });

    it("parses a POST request with -X", () => {
      const r = parseCurl("curl -X POST https://example.com");
      expect(r.method).toBe("POST");
      expect(r.url).toBe("https://example.com");
    });

    it("parses -XPOST shorthand (no space)", () => {
      const r = parseCurl("curl -XPOST https://example.com");
      expect(r.method).toBe("POST");
      expect(r.url).toBe("https://example.com");
    });

    it("parses a POST request with --request", () => {
      const r = parseCurl("curl --request PUT https://example.com");
      expect(r.method).toBe("PUT");
    });

    it("auto-detects POST when data is present without explicit method", () => {
      const r = parseCurl("curl -d 'hello' https://example.com");
      expect(r.method).toBe("POST");
      expect(r.body).toBe("hello");
    });

    it("parses multiple headers", () => {
      const r = parseCurl("curl -H 'X-One: 1' -H 'X-Two: 2' https://example.com");
      expect(r.headers).toEqual([
        { key: "X-One", value: "1" },
        { key: "X-Two", value: "2" },
      ]);
    });
  });

  describe("edge cases", () => {
    it("handles unknown flags without eating the next flag", () => {
      const r = parseCurl("curl --compressed --verbose https://example.com");
      expect(r.url).toBe("https://example.com");
    });

    it("handles --data-raw", () => {
      const r = parseCurl("curl --data-raw 'raw body' https://example.com");
      expect(r.body).toBe("raw body");
    });

    it("handles --data-binary", () => {
      const r = parseCurl("curl --data-binary 'binary data' https://example.com");
      expect(r.body).toBe("binary data");
    });

    it("preserves header values with colons", () => {
      const r = parseCurl("curl -H 'X-Custom: value:with:colons' https://example.com");
      expect(r.headers).toContainEqual({ key: "X-Custom", value: "value:with:colons" });
    });
  });
});
