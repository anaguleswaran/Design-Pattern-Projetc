import { Observable } from "../core/observer";
import type { ValidationStrategy } from "./validation";

type Errors<T extends Record<string, string>> = Record<keyof T, string[]>;
type InputElement = HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;

type StringFields<T> = { [K in keyof T]: string };

function createEmptyErrors<T extends StringFields<T>>(values: T): Errors<T> {
  const entries = Object.keys(values).map((key) => [key, [] as string[]]);
  return Object.fromEntries(entries) as Errors<T>;
}

export class FormController<T extends StringFields<T>> {
  private readonly values$: Observable<T>;
  private readonly errors$: Observable<Errors<T>>;
  private readonly strategies: Partial<Record<keyof T, ValidationStrategy[]>>;

  constructor(
    initialValues: T,
    strategies: Partial<Record<keyof T, ValidationStrategy[]>> = {},
  ) {
    this.strategies = strategies;
    this.values$ = new Observable<T>(initialValues);
    this.errors$ = new Observable<Errors<T>>(createEmptyErrors(initialValues));
  }

  subscribeValues(callback: (values: T) => void): () => void {
    return this.values$.subscribe(callback);
  }

  subscribeErrors(callback: (errors: Errors<T>) => void): () => void {
    return this.errors$.subscribe(callback);
  }

  getValues(): T {
    return this.values$.getValue();
  }

  getErrors(): Errors<T> {
    return this.errors$.getValue();
  }

  setValues(values: T): void {
    this.values$.next(values);
    this.validateAll();
  }

  setValue<K extends keyof T>(field: K, value: T[K]): void {
    this.values$.next({
      ...this.getValues(),
      [field]: value,
    });
    this.validateField(field);
  }

  bindInput<K extends keyof T>(field: K, input: InputElement): () => void {
    const valuesUnsubscribe = this.subscribeValues((values) => {
      const nextValue = values[field];
      if (input.value !== nextValue) {
        input.value = nextValue;
      }
    });

    const inputHandler = () => {
      this.setValue(field, input.value as T[K]);
    };

    input.addEventListener("input", inputHandler);

    return () => {
      valuesUnsubscribe();
      input.removeEventListener("input", inputHandler);
    };
  }

  validateField<K extends keyof T>(field: K): boolean {
    const value = this.getValues()[field];
    const strategies = this.strategies[field] ?? [];
    const fieldErrors = strategies
      .map((strategy) => strategy.validate(value))
      .filter((error): error is string => error !== null);

    this.errors$.next({
      ...this.errors$.getValue(),
      [field]: fieldErrors,
    });

    return fieldErrors.length === 0;
  }

  validateAll(): boolean {
    const values = this.getValues();
    const nextErrors = createEmptyErrors(values);
    let valid = true;

    (Object.keys(values) as Array<keyof T>).forEach((field) => {
      const strategies = this.strategies[field] ?? [];
      const fieldErrors = strategies
        .map((strategy) => strategy.validate(values[field]))
        .filter((error): error is string => error !== null);

      nextErrors[field] = fieldErrors;
      if (fieldErrors.length > 0) {
        valid = false;
      }
    });

    this.errors$.next(nextErrors);
    return valid;
  }
}
