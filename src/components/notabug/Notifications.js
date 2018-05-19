import React, { Fragment } from "react";
import Notification from "react-web-notification";
import { injectState } from "freactal";

export const Notifications = injectState(({
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
));
