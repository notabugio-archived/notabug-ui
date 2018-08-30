import React from "react";
import jdenticon from "jdenticon";

export const Identicon = ({
  size,
  author,
  author_fullname
}) => (
  <span
    className="identicon"
    title={`This icon is generated from the ${author}'s public crypto key`}
    dangerouslySetInnerHTML={{ __html: jdenticon.toSvg(author_fullname, size) }}
  />
);
