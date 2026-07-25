import { ButtonTag } from "./tags/ButtonTag";
import { DivTag } from "./tags/DivTag";
import { ImageTag } from "./tags/ImageTag";
import type { Tag } from "./Tag";

type ElementType = "button" | "div" | "img";

export class TagFactory {
  private static readonly tags: Record<ElementType, () => Tag> = {
    button: () => new ButtonTag(),
    div: () => new DivTag(),
    img: () => new ImageTag(),
  };

  public static create(type: ElementType): Tag {
    return this.tags[type]();
  }
}
