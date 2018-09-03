import React, { PureComponent } from "react";
import { Manager, Reference, Popper } from "react-popper";


export class Dropdown extends PureComponent {
  constructor(props) {
    super(props);
    this.state = { isOpen: false };
  }

  onOpen = () => this.setState({ isOpen: true })

  render() {
    const { value, children } = this.props;
    const { isOpen } = this.state;
    const { onOpen } = this;
    return (
      <Manager>
        <Reference>
          {({ ref }) => (
            <div className="dropdown lightdrop" onClick={onOpen} ref={ref}>
              <span className="selected">{value}</span>
            </div>
          )}
        </Reference>
        <Popper placement="left-end">
          {({ ref, style, placement }) => (
            <div
              className={`drop-choices lightdrop ${isOpen ? "inuse" : ""}`}
              data-placement={placement}
              {...{ ref, style }}
            >{children}</div>
          )}
        </Popper>
      </Manager>
    );
  }
}
