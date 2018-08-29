import { votingProvider } from "./state";
export * from "./Item";
export const Voting = votingProvider(({ children }) => children);
