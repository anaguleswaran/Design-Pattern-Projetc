import { Observable } from "../core/observer";
import {
  LocalStorageAdapter,
  type StorageStrategy,
  VolatileStorage,
} from "../core/strategy";
import { Tache, type Priorite } from "../models/Tache";

export interface StoredTask extends Tache {
  ownerEmail: string;
}

export interface TaskDraft {
  title: string;
  description: string;
  priorite: Priorite;
  ownerEmail: string;
}

export interface AppState {
  routePath: string;
  modalOpen: boolean;
  submittedCount: number;
  draft: TaskDraft;
  tasks: StoredTask[];
}

export type AppAction =
  | { type: "SET_ROUTE"; payload: string }
  | { type: "TOGGLE_MODAL"; payload: boolean }
  | { type: "SET_DRAFT"; payload: TaskDraft }
  | { type: "SET_TASKS"; payload: StoredTask[] }
  | {
      type: "SET_DRAFT_FIELD";
      payload: {
        field: keyof TaskDraft;
        value: string;
      };
    }
  | { type: "RESET_DRAFT" }
  | {
      type: "ADD_TASK";
      payload: {
        title: string;
        description: string;
        priorite: Priorite;
        ownerEmail: string;
      };
    }
  | { type: "REMOVE_TASK"; payload: { index: number } };

const STORAGE_KEY = "mini-framework-state";

const initialDraft: TaskDraft = {
  title: "",
  description: "",
  priorite: "standard",
  ownerEmail: "",
};

const initialState: AppState = {
  routePath: "/",
  modalOpen: false,
  submittedCount: 0,
  draft: initialDraft,
  tasks: [
    Object.assign(
      new Tache(
        "Préparer la soutenance",
        "Assembler la démonstration du framework dans une SPA réactive.",
        "urgente",
      ),
      { ownerEmail: "demo@framework.fr" },
    ),
    Object.assign(
      new Tache(
        "Documenter les patterns",
        "Expliquer Factory, Builder, Strategy, Observer et Router dans le README.",
        "standard",
      ),
      { ownerEmail: "docs@framework.fr" },
    ),
  ],
};

function reducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case "SET_ROUTE":
      return {
        ...state,
        routePath: action.payload,
      };
    case "TOGGLE_MODAL":
      return {
        ...state,
        modalOpen: action.payload,
      };
    case "SET_DRAFT":
      return {
        ...state,
        draft: action.payload,
      };
    case "SET_TASKS":
      return {
        ...state,
        tasks: action.payload,
      };
    case "RESET_DRAFT":
      return {
        ...state,
        draft: initialDraft,
      };
    case "ADD_TASK":
      return {
        ...state,
        submittedCount: state.submittedCount + 1,
        draft: initialDraft,
        tasks: [
          ...state.tasks,
          Object.assign(
            new Tache(
              action.payload.title,
              action.payload.description,
              action.payload.priorite,
            ),
            { ownerEmail: action.payload.ownerEmail },
          ),
        ],
      };
    case "REMOVE_TASK":
      return {
        ...state,
        tasks: state.tasks.filter((_, index) => index !== action.payload.index),
      };
    default:
      return state;
  }
}

export class AppStateStore {
  private static instance: AppStateStore;
  private strategy: StorageStrategy = new VolatileStorage();
  private readonly state$ = new Observable<AppState>(initialState);

  private constructor() {}

  static getInstance(): AppStateStore {
    if (!AppStateStore.instance) {
      AppStateStore.instance = new AppStateStore();
    }

    return AppStateStore.instance;
  }

  setStrategy(strategy: StorageStrategy): void {
    this.strategy = strategy;
  }

  useLocalStorage(): void {
    this.setStrategy(new LocalStorageAdapter("framework:"));
  }

  subscribe(callback: (state: AppState) => void): () => void {
    return this.state$.subscribe(callback);
  }

  getState(): AppState {
    return this.state$.getValue();
  }

  async hydrate(): Promise<void> {
    const stored = await this.strategy.get<AppState>(STORAGE_KEY);
    if (stored) {
      this.state$.next({
        ...stored,
        tasks: stored.tasks.map((task) =>
          Object.assign(
            new Tache(
              task.title,
              task.description,
              task.priorite,
              new Date(task.createdAt),
            ),
            { ownerEmail: task.ownerEmail },
          ),
        ),
      });
    }
  }

  async dispatch(action: AppAction): Promise<void> {
    const nextState = reducer(this.getState(), action);
    this.state$.next(nextState);
    await this.strategy.set(STORAGE_KEY, nextState);
  }
}
