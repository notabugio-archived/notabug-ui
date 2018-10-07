import React from "react";

export const optional = (Comp, props={}) => ( Comp ? <Comp {...props} /> : null);
