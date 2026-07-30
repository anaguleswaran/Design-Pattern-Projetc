import { AppConfig, AppStore } from "../src/core/singleton";
import { TagBuilder } from "../src/core/TagBuilder";
import { TagFactory } from "../src/core/TagFactory";
import { Observable } from "../src/core/observer";
import { LocalStorageAdapter, VolatileStorage } from "../src/core/strategy";

describe("TagBuilder", () => {
  test("builds an element and applies fluent changes", () => {
    const handler = vi.fn();
    const child = document.createElement("span");

    const element = new TagBuilder("button")
      .withText("Bonjour")
      .withClass("primary")
      .withStyle("color", "red")
      .withEvent("click", handler)
      .withChild(child)
      .withoutClass("primary")
      .build();

    element.dispatchEvent(new Event("click"));

    expect(element.textContent).toContain("Bonjour");
    expect(element.classList.contains("primary")).toBe(false);
    expect(element.style.getPropertyValue("color")).toBe("red");
    expect(element.lastElementChild).toBe(child);
    expect(handler).toHaveBeenCalledTimes(1);
  });

  test("removes an event handler", () => {
    const handler = vi.fn();
    const element = new TagBuilder("button")
      .withEvent("click", handler)
      .withoutEvent("click", handler)
      .build();

    element.dispatchEvent(new Event("click"));
    expect(handler).not.toHaveBeenCalled();
  });
});

describe("TagFactory", () => {
  test("creates supported tags", () => {
    expect(TagFactory.create("button").toHtml().tagName).toBe("BUTTON");
    expect(TagFactory.create("div").toHtml().tagName).toBe("DIV");
    expect(TagFactory.create("img").toHtml().tagName).toBe("IMG");
  });
});

describe("Observable", () => {
  test("subscribes, emits and unsubscribes", () => {
    const observable = new Observable<number>(0);
    const received: number[] = [];
    const unsubscribe = observable.subscribe((value) => received.push(value));

    observable.next(2);
    unsubscribe();
    observable.next(3);

    expect(received).toEqual([0, 2]);
    expect(observable.getValue()).toBe(3);
  });
});

describe("Storage strategies", () => {
  test("handles volatile storage methods", async () => {
    const storage = new VolatileStorage();

    await storage.set("a", 1);
    expect(await storage.get<number>("a")).toBe(1);
    await storage.remove("a");
    expect(await storage.get<number>("a")).toBeUndefined();
    await storage.set("b", 2);
    await storage.clear();
    expect(await storage.get<number>("b")).toBeUndefined();
  });

  test("handles localStorage adapter methods", async () => {
    const storage = new LocalStorageAdapter("test:");

    await storage.set("a", { ok: true });
    expect(await storage.get<{ ok: boolean }>("a")).toEqual({ ok: true });
    await storage.remove("a");
    expect(await storage.get("a")).toBeUndefined();
    await storage.set("b", 2);
    await storage.clear();
    expect(await storage.get("b")).toBeUndefined();
  });
});

describe("Singletons", () => {
  test("shares the same app config instance", () => {
    const first = AppConfig.getInstance();
    const second = AppConfig.getInstance();

    first.set("apiUrl", "/api");

    expect(second.get("apiUrl")).toBe("/api");
    expect(first).toBe(second);
  });

  test("stores and hydrates app store values", async () => {
    const store = AppStore.getInstance();
    const strategy = new VolatileStorage();
    store.setStrategy(strategy);

    store.setState("theme", "dark");
    expect(store.getState("theme")).toBe("dark");

    await strategy.set("language", "fr");
    await store.hydrate("language");
    expect(store.getState("language")).toBe("fr");
  });
});
