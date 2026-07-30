import type { StorageStrategy } from './strategy';
import { VolatileStorage } from './strategy';

// config globale de l'app 
export class AppConfig {
  private static instance: AppConfig;
  private config: Record<string, string> = {};

  private constructor() {}

  static getInstance(): AppConfig {
    if (!AppConfig.instance) {
      AppConfig.instance = new AppConfig();
    }
    return AppConfig.instance;
  }

  set(key: string, value: string): void {
    this.config[key] = value;
  }

  get(key: string): string | undefined {
    return this.config[key];
  }
}

// store global de l'état de l'app storageStrategy
export class AppStore {
  private static instance: AppStore;
  private state: Record<string, unknown> = {};
  private strategy: StorageStrategy = new VolatileStorage(); // en mémoire par défaut

  private constructor() {}

  static getInstance(): AppStore {
    if (!AppStore.instance) {
      AppStore.instance = new AppStore();
    }
    return AppStore.instance;
  }

  // change le backend de stockage
  setStrategy(strategy: StorageStrategy): void {
    this.strategy = strategy;
  }

  // recharge une valeur depuis le storage vers la mémoire 
  async hydrate<T>(key: string): Promise<void> {
    const value = await this.strategy.get<T>(key);
    if (value !== undefined) {
      this.state[key] = value;
    }
  }

  getState<T>(key: string): T | undefined {
    return this.state[key] as T | undefined;
  }

  // ecrit une valeur en mémoire et la persiste
  setState<T>(key: string, value: T): void {
    this.state[key] = value;
    void this.strategy.set(key, value); 
  }
}
