import { TagBuilder } from "../../core/TagBuilder";
import { BaseComponent, type BaseProps } from "../BaseComponent";

interface ModalProps extends BaseProps {
  title: string;
  onClose: () => void;
}

export class Modal extends BaseComponent<ModalProps> {
  render(): HTMLElement {
    const overlay = new TagBuilder("div")
      .withClass("modal-overlay")
      .withEvent("click", (event) => {
        if (event.target === overlay) {
          this.props.onClose();
        }
      })
      .build();

    const dialog = new TagBuilder("div").withClass("modal-card").build();
    const header = new TagBuilder("div").withClass("modal-header").build();
    const body = new TagBuilder("div").withClass("modal-body").build();
    const closeButton = new TagBuilder("button")
      .withClass("ghost-button")
      .withText("Fermer")
      .withEvent("click", () => this.props.onClose())
      .build();

    header.appendChild(new TagBuilder("h3").withText(this.props.title).build());
    header.appendChild(closeButton);
    this.appendChildren(body);

    dialog.appendChild(header);
    dialog.appendChild(body);
    overlay.appendChild(dialog);

    return overlay;
  }
}
