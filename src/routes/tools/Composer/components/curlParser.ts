export interface ParsedCurl {
  method: string;
  url: string;
  headers: { key: string; value: string }[];
  body: string | null;
}

export function parseCurl(input: string): ParsedCurl {
  const result: ParsedCurl = {
    method: "GET",
    url: "",
    headers: [],
    body: null,
  };

  const cleaned = input
    .replace(/^curl\s+/i, "")
    .replace(/\\\n/g, " ")
    .replace(/\\\r\n/g, " ")
    .trim();

  const tokens = tokenize(cleaned);

  let i = 0;
  let hasData = false;

  while (i < tokens.length) {
    const token = tokens[i];

    // --request / -X
    if (token.startsWith("-X") && token.length > 2) {
      result.method = token.substring(2).toUpperCase();
    } else if (headerMatches(token, "-X", "--request")) {
      const val = flagValue(token, "-X", "--request");
      if (val !== undefined) {
        result.method = val.toUpperCase();
      } else {
        i++;
        if (i < tokens.length) {
          result.method = tokens[i].toUpperCase();
        }
      }
    } else if (headerMatches(token, "-H", "--header")) {
      // --header / -H
      const val = flagValue(token, "-H", "--header");
      if (val !== undefined) {
        const header = parseHeader(val);
        if (header) result.headers.push(header);
      } else {
        i++;
        if (i < tokens.length) {
          const header = parseHeader(tokens[i]);
          if (header) result.headers.push(header);
        }
      }
    } else if (headerMatches(token, "-d", "--data", "--data-raw", "--data-binary")) {
      // --data / -d / --data-raw / --data-binary
      const val = flagValue(token, "-d", "--data", "--data-raw", "--data-binary");
      if (val !== undefined) {
        result.body = stripQuotes(val);
        hasData = true;
      } else {
        i++;
        if (i < tokens.length) {
          result.body = stripQuotes(tokens[i]);
          hasData = true;
        }
      }
    } else if (headerMatches(token, "--url")) {
      const val = flagValue(token, "--url");
      if (val !== undefined) {
        result.url = stripQuotes(val);
      } else {
        i++;
        if (i < tokens.length) {
          result.url = stripQuotes(tokens[i]);
        }
      }
    } else if (headerMatches(token, "--cookie", "-b")) {
      const val = flagValue(token, "--cookie", "-b");
      if (val !== undefined) {
        result.headers.push({ key: "Cookie", value: stripQuotes(val) });
      } else {
        i++;
        if (i < tokens.length) {
          result.headers.push({ key: "Cookie", value: stripQuotes(tokens[i]) });
        }
      }
    } else if (token.startsWith("-") || token.startsWith("--")) {
      // skip unknown flags and their values
      const parts = token.split("=");
      if (parts.length === 2) {
        // --flag=value form, already consumed
      } else if (i + 1 < tokens.length && !tokens[i + 1].startsWith("-") && !looksLikeUrl(tokens[i + 1])) {
        i++; // skip value
      }
    } else if (!result.url) {
      result.url = stripQuotes(token);
    }

    i++;
  }

  if (hasData && result.method === "GET") {
    result.method = "POST";
  }

  return result;
}

function tokenize(input: string): string[] {
  const tokens: string[] = [];
  let i = 0;

  while (i < input.length) {
    while (i < input.length && input[i] === " ") i++;
    if (i >= input.length) break;

    if (input[i] === "'" || input[i] === '"') {
      const quote = input[i];
      i++;
      let val = "";
      while (i < input.length && input[i] !== quote) {
        if (input[i] === "\\" && i + 1 < input.length) {
          i++;
        }
        val += input[i];
        i++;
      }
      i++; // skip closing quote
      tokens.push(val);
    } else if (input[i] === "$" && i + 1 < input.length && input[i + 1] === "(") {
      // skip $() subshell
      i += 2;
      let depth = 1;
      while (i < input.length && depth > 0) {
        if (input[i] === "(") depth++;
        else if (input[i] === ")") depth--;
        i++;
      }
    } else {
      let val = "";
      while (i < input.length && input[i] !== " " && input[i] !== "'" && input[i] !== '"') {
        if (input[i] === "\\" && i + 1 < input.length) {
          i++;
        }
        val += input[i];
        i++;
      }
      // push token as-is; --flag=value splitting is handled by the parser
      tokens.push(val);
    }
  }

  return tokens;
}

function parseHeader(raw: string): { key: string; value: string } | null {
  const colonIdx = raw.indexOf(":");
  if (colonIdx === -1) return null;
  return {
    key: raw.substring(0, colonIdx).trim(),
    value: raw.substring(colonIdx + 1).trim(),
  };
}

function stripQuotes(s: string): string {
  if (s.length >= 2) {
    const first = s[0];
    const last = s[s.length - 1];
    if ((first === '"' && last === '"') || (first === "'" && last === "'")) {
      return s.slice(1, -1);
    }
  }
  return s;
}

function looksLikeUrl(s: string): boolean {
  return /^https?:\/\//i.test(s);
}

function headerMatches(token: string, ...names: string[]): boolean {
  return names.some(n => token === n || token.startsWith(n + "="));
}

function flagValue(token: string, ...names: string[]): string | undefined {
  for (const name of names) {
    if (token.startsWith(name + "=")) {
      const val = token.substring(name.length + 1);
      if (val.length > 0) return val;
      return undefined;
    }
  }
  return undefined;
}
