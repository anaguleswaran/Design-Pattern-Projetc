export class TagBuilder {
    public readonly element: HTMLElement;
    public constructor(tag: string) {
        this.element = document.createElement(tag);
    }

    public withText(text: string) {
        this.element.textContent = text;
        return this;
    }

    public withClass(className: string) {
        this.element.classList.add(className);
        return this;
    }

    public withStyle(property: string, value: string) {
        this.element.style.setProperty(property, value);
        return this;
    }

    public withEvent(event: string, handler: EventListener) {
        this.element.addEventListener(event, handler);
        return this;
    }

    public withChild(child: HTMLElement) {
        this.element.appendChild(child);
        return this;
    }

    public withoutClass(className: string) {
        this.element.classList.remove(className);
        return this;
    }

    public withoutEvent(event: string, handler: EventListener) {
        this.element.removeEventListener(event, handler);
        return this;
    }

    public build(): HTMLElement {
        return this.element;
    }

}