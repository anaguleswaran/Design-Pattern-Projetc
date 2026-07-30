import type { HttpClient } from "../http/HttpClient";
import type { Priorite } from "../models/Tache";
import type { StoredTask } from "../store/AppStateStore";

export interface TaskPayload {
  description: string;
  ownerEmail: string;
  priorite: Priorite;
  title: string;
}

/**
 * Service CRUD minimal branche sur le client HTTP.
 */
export class TacheService {
  private readonly httpClient: HttpClient;

  constructor(httpClient: HttpClient) {
    this.httpClient = httpClient;
  }

  public getAll(): Promise<StoredTask[]> {
    return this.httpClient.get<StoredTask[]>("/tasks");
  }

  public getOne(index: number): Promise<StoredTask> {
    return this.httpClient.get<StoredTask>(`/tasks/${index}`);
  }

  public create(payload: TaskPayload): Promise<StoredTask> {
    return this.httpClient.post<StoredTask>("/tasks", payload);
  }

  public update(index: number, payload: TaskPayload): Promise<StoredTask> {
    return this.httpClient.put<StoredTask>(`/tasks/${index}`, payload);
  }

  public delete(index: number): Promise<StoredTask> {
    return this.httpClient.delete<StoredTask>(`/tasks/${index}`);
  }
}
