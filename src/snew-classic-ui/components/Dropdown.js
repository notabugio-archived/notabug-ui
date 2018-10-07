import React, { Fragment } from "react";

const Dropdown = ({
  value,
  isOpen,
  onOpen,
  children
}) => (
  <Fragment>
    <div className="dropdown lightdrop" onClick={onOpen}>
      <span className="selected">{value}</span>
    </div>
    <div className={`drop-choices lightdrop ${isOpen ? "inuse" : ""}`}>{children}</div>
  </Fragment>
);

export default Dropdown;
