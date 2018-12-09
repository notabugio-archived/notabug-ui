import { path, trim, assocPath, keysIn } from "ramda";

export const parseListingSource = source => {
  const tokenMap = source.split("\n").reduce((def, line) => {
    const tokens = line
      .trim()
      .split(" ")
      .map(trim)
      .filter(x => x);
    if (!tokens.length) return def;
    return assocPath(tokens, {}, def);
  }, {});

  const isPresent = p => {
    let check = p;
    if (typeof p === "string") check = p.split(" ");
    return check && path(check, tokenMap);
  };

  const getValues = p => keysIn(isPresent(p));
  const getValue = p => getValues(p)[0];
  const getLastValue = p => getValues(p).pop();
  
  const getValueChain = p => {
    const keys = p.split(" ");
    const values = [];
    let next = p;
    
    while (next) {
      next = getValue([ ...keys, ...values ]);
      next && values.push(next);     
    }
    
    return values;
  }

  return { tokenMap, isPresent, getValue, getLastValue, getValueChain };
};
