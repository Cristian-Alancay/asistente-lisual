import * as matchers from "vitest-axe/matchers";
import { expect } from "vitest";
import "@testing-library/jest-dom/vitest";

expect.extend(matchers);
