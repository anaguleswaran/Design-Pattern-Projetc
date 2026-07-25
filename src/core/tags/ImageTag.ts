import type { Tag } from "../Tag";

export class ImageTag implements Tag {
  public readonly src: string;
  public constructor(src: string = "") {
    this.src = src;
  }

  public toHtml(): HTMLElement {
    const image = document.createElement("img");
    image.src = this.src;
    return image;
  }
}
