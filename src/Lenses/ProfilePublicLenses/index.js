import { injectState } from "freactal";
import { profilePublicLensesProvider } from "./state";
import { ProfilePublicLenses as ProfilePublicLensesComponent } from "./ProfilePublicLenses";

export const ProfilePublicLenses =
  profilePublicLensesProvider(injectState(ProfilePublicLensesComponent));
