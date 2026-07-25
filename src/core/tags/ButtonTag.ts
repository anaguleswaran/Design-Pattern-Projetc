import type { Tag } from "../Tag";

export class ButtonTag implements Tag {
  public readonly text: string;
  public constructor(text: string = "") {
    this.text = text;
  }

  public toHtml(): HTMLElement {
    const button = document.createElement("button");
    button.textContent = this.text;
    return button;
  }
}
