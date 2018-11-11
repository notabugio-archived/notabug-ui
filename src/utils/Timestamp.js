import React from "react";
import TimeAgo from "react-timeago";

export const Timestamp = React.memo(
  ({ created_utc }) =>
    (created_utc && <TimeAgo date={created_utc * 1000} />) || null
);
