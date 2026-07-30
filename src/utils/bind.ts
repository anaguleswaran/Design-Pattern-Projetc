import type { Observable } from './observer';

// relie un observable à un élément du DOM à chaque next() le texte se met à jour seul
export function bindText<T>(observable: Observable<T>, element: HTMLElement): () => void {
  return observable.subscribe((value) => {
    element.textContent = String(value);
  });
}