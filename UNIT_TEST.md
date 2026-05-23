# Unit Testing

This project uses [Vitest](https://vitest.dev/) as the test runner.

## Quick Start

```bash
bun run test          # run all unit tests once
bun run test:watch    # run in watch mode (re-runs on file changes)
```

## Running a Specific Test File

```bash
npx vitest run path/to/test-file.test.ts
```

Example:

```bash
npx vitest run src/packages/bottom-pane/__tests__/SmartViewerMatching.test.ts
```

## Test File Convention

- Test files go in `__tests__/` directories alongside the code they test
- Filename pattern: `*.test.ts` or `*.test.tsx`
- Vitest auto-discovers these by default

## Writing Tests

Import from `vitest`:

```ts
import { describe, it, expect, vi } from "vitest";
```

### Mocking

Use `vi.fn()` for mocking functions:

```ts
const mockFn = vi.fn().mockResolvedValue({ data: "ok" });
```

### Example

```ts
describe("MyClass", () => {
  it("does something", async () => {
    const result = await myClass.doThing();
    expect(result).toEqual("expected");
  });
});
```

## Tauri Backend (Rust) Tests

The Rust backend tests are separate. Run them with:

```bash
cd src-tauri && cargo test
```
