import { Component } from "../src/components/component";
import { HttpClient, HttpError } from "../src/http/HttpClient";
import { AppStateStore } from "../src/store/AppStateStore";

class DemoComponent extends Component {
  public mounts = 0;
  public updates = 0;
  public destroys = 0;

  onMount(): void {
    this.mounts += 1;
  }

  onUpdate(): void {
    this.updates += 1;
  }

  onDestroy(): void {
    this.destroys += 1;
  }

  render(): HTMLElement {
    const element = document.createElement("div");
    element.textContent = "demo";
    return element;
  }
}

describe("HttpClient", () => {
  test("supports get, post, put and delete", async () => {
    const fetchMock = vi.spyOn(window, "fetch").mockImplementation(async () =>
      new Response(JSON.stringify({ ok: true }), {
        headers: { "Content-Type": "application/json" },
      }),
    );

    const client = new HttpClient("/api");

    await expect(client.get("/tasks")).resolves.toEqual({ ok: true });
    await expect(client.post("/tasks", { title: "A" })).resolves.toEqual({ ok: true });
    await expect(client.put("/tasks/0", { title: "B" })).resolves.toEqual({ ok: true });
    await expect(client.delete("/tasks/0")).resolves.toEqual({ ok: true });

    expect(fetchMock).toHaveBeenCalledTimes(4);
  });

  test("throws an HttpError on bad status", async () => {
    vi.spyOn(window, "fetch").mockResolvedValue(
      new Response("ko", { status: 500, headers: { "Content-Type": "text/plain" } }),
    );

    const client = new HttpClient("/api");

    await expect(client.get("/tasks")).rejects.toBeInstanceOf(HttpError);
  });
});

describe("Component", () => {
  test("mounts, updates and destroys", () => {
    const component = new DemoComponent();
    const host = document.createElement("div");

    component.mount(host);
    const mountedElement = host.firstElementChild as HTMLElement;
    component.update(host, mountedElement);
    component.destroy(host.firstElementChild as HTMLElement);

    expect(component.mounts).toBe(1);
    expect(component.updates).toBe(1);
    expect(component.destroys).toBe(1);
  });
});

describe("AppStateStore", () => {
  test("subscribes, dispatches and hydrates", async () => {
    const store = AppStateStore.getInstance();
    store.useLocalStorage();

    const callback = vi.fn();
    store.subscribe(callback);

    await store.dispatch({ type: "SET_ROUTE", payload: "/demo" });
    await store.dispatch({
      type: "SET_TASKS",
      payload: [
        {
          title: "A",
          description: "B",
          priorite: "standard",
          ownerEmail: "a@b.fr",
          createdAt: new Date(),
        },
      ],
    });
    await store.hydrate();

    expect(store.getState().routePath).toBe("/demo");
    expect(store.getState().tasks).toHaveLength(1);
    expect(callback).toHaveBeenCalled();
  });
});
