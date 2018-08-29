import { routerProvider } from "./state";
export { routes } from "./routes";

export const Routing = routerProvider(({ children }) => children);
