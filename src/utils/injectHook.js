export const injectHook = customHook => fn => props => fn({ ...props, ...customHook(props) });
