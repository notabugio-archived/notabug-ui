export { cached } from "./Cached";
export { locationKey } from "./locationKey";
export { JavaScriptRequired } from "./JavaScriptRequired";
export { default as Dropdown } from "./Dropdown";
export { Link } from "./Link";
export { Loading } from "./Loading";
export { ErrorBoundary } from "./ErrorBoundary";
export { Markdown } from "./Markdown";
export { ScrollToTop } from "./ScrollToTop";
export { Timestamp } from "./Timestamp";
export { injectHook } from "./injectHook";
export { default as slugify } from "./slugify";
export { interceptClicks } from "./interceptClicks";
export * from "./hooks";

// https://stackoverflow.com/questions/14555347
export function isLocalStorageNameSupported() {
  var testKey = "test",
    storage = window.localStorage;

  try {
    storage.setItem(testKey, "1");
    storage.removeItem(testKey);
    return true;
  } catch (error) {
    console.warn("disabling local storage", error);
    return false;
  }
}
