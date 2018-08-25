import React, { PureComponent } from "react";
import TimeAgo from "react-timeago";

class PureTimestamp extends PureComponent {
  render () {
    const { created_utc } = this.props;
    return (created_utc && <TimeAgo date={created_utc * 1000} />) || null;
  }
}

export const Timestamp = ({ created_utc }) => <PureTimestamp created_utc={created_utc} />;
