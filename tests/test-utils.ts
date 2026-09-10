// Single import point for test files. Instead of:
//   import { describe, it, expect } from "vitest";
// every test file does:
//   import { describe, it, expect } from "../test-utils"; (or "./test-utils"
//   depending on location — see note at bottom on path placement)
//
// The payoff isn't just fewer characters — it's one place to add
// project-specific helpers later (a DB reset function for integration
// tests, a custom matcher, a fixture factory) without editing every test
// file that already exists to pick it up.

export {
  describe,
  it,
  expect,
  vi,
  beforeAll,
  afterAll,
  beforeEach,
  afterEach,
} from "vitest";
