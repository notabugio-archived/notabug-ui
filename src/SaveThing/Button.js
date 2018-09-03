import React from "react";
import { injectState } from "freactal";
import { Manager, Reference, Popper } from "react-popper";
import { saveThingProvider } from "./state";
import SaveThingForm from "./Form";

export const SaveThingButton = ({
  className="link-save-button save-button",
  label="save",
  state: { isSaveModalOpen },
  effects: { onShowSave }
}) => isSaveModalOpen ? (
  <Manager>
    <Reference>
      {({ ref }) => (
        <li className={`${className} save-button`} ref={ref}>
          <a>{label}</a>
        </li>
      )}
    </Reference>
    <Popper placement="right">
      {({ ref, style, placement, arrowProps }) => (
        <div
          className="hover-bubble anchor-left save-selector"
          style={{ ...style, display: "block" }}
          ref={ref}
          data-placement={placement}
        >
          <SaveThingForm {...{ arrowProps, label }} />
        </div>
      )}
    </Popper>
  </Manager>
) : (
  <li className={className}>
    <a
      href=""
      onClick={e => {
        e.preventDefault();
        onShowSave();
      }}
    >{label}</a>
  </li>
);

export default saveThingProvider(injectState(SaveThingButton));
