import React from "react";
import jdenticon from "jdenticon";

export const Identicon = ({
  size,
  author,
  author_fullname
}) => (
  <span
    className="identicon"
    title={`This icon is generated with ${author}'s public crypto key`}
    dangerouslySetInnerHTML={{ __html: jdenticon.toSvg(`${author}${author_fullname}`, size) }}
  />
);
