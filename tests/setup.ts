import { afterEach, beforeEach, vi } from "vitest";

beforeEach(() => {
  document.body.innerHTML = "";
  localStorage.clear();
  history.replaceState({}, "", "/");
});

afterEach(() => {
  vi.restoreAllMocks();
});
