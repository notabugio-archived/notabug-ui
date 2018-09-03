import { provideState } from "freactal";

const initialState = ({ userId }) => ({
  publicLensesUserId: userId,
  publicLensesNames: []
});

export const profilePublicLensesProvider = provideState({
  initialState
});
