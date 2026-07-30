import { TagBuilder } from "../../core/TagBuilder";
import { BaseComponent, type BaseProps } from "../BaseComponent";

interface ListProps<T> extends BaseProps {
  items: T[];
  emptyText: string;
  renderItem: (item: T, index: number) => HTMLElement;
}

export class List<T> extends BaseComponent<ListProps<T>> {
  render(): HTMLElement {
    const list = new TagBuilder("div").withClass("stack-list").build();

    if (this.props.items.length === 0) {
      list.appendChild(
        new TagBuilder("p").withClass("muted").withText(this.props.emptyText).build(),
      );
      return list;
    }

    this.props.items.forEach((item, index) => {
      list.appendChild(this.props.renderItem(item, index));
    });

    return list;
  }
}
