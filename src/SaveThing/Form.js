import React, { PureComponent } from "react";
import clickOutside from "react-click-outside";
import { injectState } from "freactal";

export const SaveThingFormRender = ({
  state: {
    categoryOptions, selectedCategory, customCategory, isCustomSelected
  },
  effects: { onSetCustomCategory, onSelectCategory, onSaveThing },
  label,
  arrowProps,
}) => (
  <form
    onSubmit={e => {
      e.preventDefault();
      onSaveThing();
    }}
  >
    <label htmlFor="savedcategory" />
    {isCustomSelected ? (
      <input
        autoFocus
        name="savedcategory"
        className="savedcategory"
        placeholder="custom category..."
        value={customCategory}
        onChange={e => onSetCustomCategory(e.target.value)}
      />
    ) : (
      <select
        value={selectedCategory}
        onChange={e => onSelectCategory(e.target.value)}
      >{categoryOptions.map(name => <option key={name}>{name}</option>)}</select>
    )}
    <input  type="submit" value={label}/>
    <div ref={arrowProps.ref} style={arrowProps.style} />
  </form>
);

export class SaveThingForm extends PureComponent {
  render = () => <SaveThingFormRender {...this.props} />
  handleClickOutside = () => this.props.effects.onHideSave()
}

export default injectState(clickOutside(SaveThingForm));
