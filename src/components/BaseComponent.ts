import { Component } from "./component";

export type SlotChild = Component | HTMLElement;

export interface BaseProps {
  children?: SlotChild[];
}

export abstract class BaseComponent<TProps extends BaseProps = BaseProps> extends Component {
  protected readonly cleanups: Array<() => void> = [];
  protected readonly props: TProps;

  constructor(props: TProps) {
    super();
    this.props = props;
  }

  protected appendChildren(container: HTMLElement): void {
    const children = this.props.children ?? [];

    children.forEach((child) => {
      if (child instanceof HTMLElement) {
        container.appendChild(child);
        return;
      }

      container.appendChild(child.render());
    });
  }

  protected registerCleanup(cleanup: () => void): void {
    this.cleanups.push(cleanup);
  }

  override onDestroy(): void {
    this.cleanups.forEach((cleanup) => cleanup());
    this.cleanups.length = 0;
  }
}
