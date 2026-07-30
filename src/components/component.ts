// classe de base pour tous les composants
export abstract class Component {
  private mounted = false;

  // appelé une fois quand le composant est ajouté au DOM
  onMount(): void {}

  // appelé à chaque mise à jour du composant
  onUpdate(): void {}

  // appelé quand le composant est retiré du DOM
  onDestroy(): void {}

  // chaque composant doit dire comment il se rend en htmlelemment
  abstract render(): HTMLElement;

  // monte le composant dans un parent du DOM
  mount(parent: HTMLElement): void {
    const el = this.render();
    parent.appendChild(el);
    this.mounted = true;
    this.onMount();
  }

  // force une mise à jour re-render + remplace l'ancien élément
  update(parent: HTMLElement, oldEl: HTMLElement): void {
    const newEl = this.render();
    parent.replaceChild(newEl, oldEl);
    this.onUpdate();
  }

  // retire le composant du DOM
  destroy(el: HTMLElement): void {
    if (!this.mounted) return;
    el.remove();
    this.mounted = false;
    this.onDestroy();
  }
}