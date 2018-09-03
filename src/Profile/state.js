import { provideState } from "freactal";

const initialState = ({
  userId, userAlias, createdAt
}) => ({
  profileUserName: userAlias,
  profileUserId: userId,
  profileCreatedAt: createdAt
});

export const userProfileProvider = provideState({
  initialState
});
