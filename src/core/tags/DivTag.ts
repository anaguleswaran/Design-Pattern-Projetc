import type { Tag } from "../Tag";

export class DivTag implements Tag {
    public toHtml(): HTMLElement {
        return document.createElement("div");
    }
}
