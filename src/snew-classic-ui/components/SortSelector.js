import React from "react";
import LinkComponent from "./Link";
import DropdownComponent from "./Dropdown";

const SortSelector = ({
  Link = LinkComponent,
  Dropdown = DropdownComponent,
  hideSortOptions,
  sortOptions,
  currentSort,
  onOpen,
  isOpen = false,
  permalink
}) => (
  <div className="menuarea">
    <div className="spacer">
      <span className="dropdown-title lightdrop">sorted by:</span>
      <Dropdown value={currentSort} {...{ isOpen, onOpen }}>
        {hideSortOptions ? null : sortOptions.map(sortName => (sortName !== currentSort) && (
          <Link
            key={sortName}
            className="choice"
            href={`${permalink}?sort=${sortName}`}
          >
            {sortName}
          </Link>
        ))}
      </Dropdown>
    </div>
    <div className="spacer" />
  </div>
);

export default SortSelector;
