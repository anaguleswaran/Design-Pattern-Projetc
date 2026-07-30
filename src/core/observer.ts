// observable générique T = type de la valeur transportée
export class Observable<T> {
  private subscribers: Array<(value: T) => void> = [];

  constructor(private value: T) {}

  // ajout un callback retourne une fonction pour se désabonner
  subscribe(callback: (value: T) => void): () => void {
    this.subscribers.push(callback);
    callback(this.value); // on notifie direct avec la valeur actuelle

    return () => {
      this.subscribers = this.subscribers.filter((cb) => cb !== callback);
    };
  }

  // change la valeur et notifie tout le monde
  next(value: T): void {
    this.value = value;
    this.subscribers.forEach((cb) => cb(value));
  }

  // pour lire la valeur actuelle sans s'abonner
  getValue(): T {
    return this.value;
  }
}