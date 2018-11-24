import React from "react";
import TimeAgo from "react-timeago";

const Edited = ({ title, children }) => (
  <time className="edited-timestamp" title={`last edited ${children}`} datetime={title}>*</time>
);

export const Timestamp = React.memo(
  ({ created_utc, edited }) => {
    if (created_utc) return <TimeAgo date={created_utc * 1000} />;
    if (edited) return <TimeAgo date={edited} component={Edited} />;
  }
);
