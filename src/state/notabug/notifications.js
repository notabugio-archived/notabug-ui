import { assocPath, path } from "ramda";
import uuid from "uuid";
import { provideState, update } from "freactal";

const initialState = () => ({
  notificationMap: {}
});

const onNotifyUser = update((state, notification) => {
  const id = notification.id || uuid.v4();
  return assocPath(["notificationMap", id], { ...notification, id }, state);
});

const onCloseNotification = update((state, id) =>  {
  const notificationMap = { ...state.notifications };
  delete notificationMap[id];
  return { notificationMap };
});

const onOpenNotification = update((state, id) => {
  const onOpen = path(["notificationMap", id, "onOpen"], state);
  onOpen && onOpen();
  return state;
});

export const notifications = provideState({
  initialState,
  effects: {
    onNotifyUser,
    onOpenNotification,
    onCloseNotification
  },

  computed: {
    notifications: ({ notificationMap }) => Object.keys(notificationMap)
      .map(key => notificationMap[key])
  }
});
