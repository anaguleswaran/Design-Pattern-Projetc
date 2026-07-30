import type { Priorite } from "../models/Tache";
import type { StoredTask } from "../store/AppStateStore";

interface TaskPayload {
  description: string;
  ownerEmail: string;
  priorite: Priorite;
  title: string;
}

const STORAGE_KEY = "mock-api:tasks";

const defaultTasks: StoredTask[] = [
  {
    title: "Préparer la soutenance",
    description: "Assembler une démo simple de notre mini-framework.",
    priorite: "urgente",
    ownerEmail: "demo@framework.fr",
    createdAt: new Date("2026-07-01T08:00:00.000Z"),
  } as StoredTask,
  {
    title: "Écrire les tests",
    description: "Valider les patterns principaux avec Vitest.",
    priorite: "standard",
    ownerEmail: "tests@framework.com",
    createdAt: new Date("2026-07-05T09:00:00.000Z"),
  } as StoredTask,
];

let installed = false;

function serialize(tasks: StoredTask[]): string {
  return JSON.stringify(
    tasks.map((task) => ({
      ...task,
      createdAt: task.createdAt instanceof Date ? task.createdAt.toISOString() : task.createdAt,
    })),
  );
}

function readTasks(): StoredTask[] {
  const raw = localStorage.getItem(STORAGE_KEY);

  if (!raw) {
    localStorage.setItem(STORAGE_KEY, serialize(defaultTasks));
    return [...defaultTasks];
  }

  const parsed = JSON.parse(raw) as Array<Omit<StoredTask, "createdAt"> & { createdAt: string }>;
  return parsed.map((task) =>
    Object.assign({}, task, {
      createdAt: new Date(task.createdAt),
    }),
  ) as StoredTask[];
}

function writeTasks(tasks: StoredTask[]): void {
  localStorage.setItem(STORAGE_KEY, serialize(tasks));
}

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json",
    },
  });
}

/**
 * Installe une API mockee minimale sur `fetch`.
 */
export function installMockApi(): void {
  if (installed) {
    return;
  }

  installed = true;
  const nativeFetch = window.fetch.bind(window);

  window.fetch = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
    const url =
      typeof input === "string"
        ? new URL(input, window.location.origin)
        : input instanceof URL
          ? input
          : new URL(input.url, window.location.origin);

    if (!url.pathname.startsWith("/api/tasks")) {
      return nativeFetch(input, init);
    }

    const method = init?.method ?? "GET";
    const tasks = readTasks();
    const id = url.pathname.replace("/api/tasks/", "");

    if (url.pathname === "/api/tasks" && method === "GET") {
      return jsonResponse(tasks);
    }

    if (url.pathname === "/api/tasks" && method === "POST") {
      const payload = JSON.parse(String(init?.body ?? "{}")) as TaskPayload;
      const nextTasks = [
        ...tasks,
        Object.assign({}, payload, { createdAt: new Date() }) as StoredTask,
      ];
      writeTasks(nextTasks);
      return jsonResponse(nextTasks.at(-1), 201);
    }

    const index = Number(id);
    const task = tasks[index];

    if (!task) {
      return jsonResponse({ message: "Not found" }, 404);
    }

    if (method === "GET") {
      return jsonResponse(task);
    }

    if (method === "PUT") {
      const payload = JSON.parse(String(init?.body ?? "{}")) as TaskPayload;
      const updatedTasks = tasks.map((currentTask, currentIndex) =>
        currentIndex === index
          ? Object.assign({}, currentTask, payload)
          : currentTask,
      );
      writeTasks(updatedTasks);
      return jsonResponse(updatedTasks[index]);
    }

    if (method === "DELETE") {
      const removedTask = tasks[index];
      writeTasks(tasks.filter((_, currentIndex) => currentIndex !== index));
      return jsonResponse(removedTask);
    }

    return jsonResponse({ message: "Method not allowed" }, 405);
  };
}
