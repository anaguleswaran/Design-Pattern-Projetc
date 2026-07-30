import { TagBuilder } from "../../core/TagBuilder";
import { BaseComponent, type BaseProps } from "../BaseComponent";

interface CardProps extends BaseProps {
  title: string;
  subtitle?: string;
  footer?: HTMLElement;
}

export class Card extends BaseComponent<CardProps> {
  render(): HTMLElement {
    const wrapper = new TagBuilder("article").withClass("panel").build();
    const header = new TagBuilder("div").withClass("panel-header").build();
    const body = new TagBuilder("div").withClass("panel-body").build();

    header.appendChild(new TagBuilder("h3").withText(this.props.title).build());

    if (this.props.subtitle) {
      header.appendChild(
        new TagBuilder("p").withClass("muted").withText(this.props.subtitle).build(),
      );
    }

    this.appendChildren(body);

    wrapper.appendChild(header);
    wrapper.appendChild(body);

    if (this.props.footer) {
      const footer = new TagBuilder("div").withClass("panel-footer").build();
      footer.appendChild(this.props.footer);
      wrapper.appendChild(footer);
    }

    return wrapper;
  }
}
