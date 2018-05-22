import { provideState } from "freactal";
import { listing } from "lib/nab/read";
import qs from "qs";

let threshold;

try {
  threshold = (window && window.location && window.location.search)
    ? parseInt(qs.parse(window.location.search).threshold, 10) || 1 : 1;
} catch (e) {
  threshold = 1;
}

export const DEF_THRESHOLD = threshold;

const initialState = ({ getChains, threshold=DEF_THRESHOLD }) => ({
  notabugListing: listing(getChains, threshold)
});

const onNotabugListingCleanup = () => state => {
  state.notabugListing.close();
  return state;
};

export const notabugListing = provideState({
  initialState,
  effects: { onNotabugListingCleanup }
});
