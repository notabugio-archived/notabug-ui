import { App as AppComponent } from "./App";
import { notabugProvider } from "./state";

export { routes } from "Routing";
export const App = notabugProvider(AppComponent);
