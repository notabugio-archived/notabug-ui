import React from "react";
import { Link } from "utils";

export const ProfilePublicLenses = ({ state: { publicLensesNames }, userId }) =>
  !publicLensesNames.length ? null : (
    <div className="spacer">
      <div className="sidecontentbox">
        <div className="title">
          <h1>PUBLIC LENSES</h1>
        </div>
        <ul className="content">
          <li>
            <ul id="side-multi-list">
              {publicLensesNames.map(name => (
                <li>
                  <Link href={`/user/${userId}/lenses/${name}`}>{name}</Link>
                </li>
              ))}
            </ul>
          </li>
        </ul>
      </div>
    </div>
  );
