import React, { Fragment } from "react";
import Notification from "react-web-notification";

export const Notifications = ({
  state: { notifications },
  effects: { onOpenNotification, onCloseNotification }
}) => (
  <Fragment>
    {notifications.map(({ id, title, body }) => (
      <Notification
        key={id}
        title={title}
        options={{ body }}
        onClick={() => onOpenNotification(id)}
        onClose={() => onCloseNotification(id)}
      />
    ))}
  </Fragment>
);
