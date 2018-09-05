var FIELD_SIZE_LIMIT=100000;

module.exports = function (obj) {
  if (!obj) return obj;

  var madeChanges = false;
  var arrow = (obj._ && obj._[">"]) || {};

  Object.keys(arrow || {}).forEach(function(key) {
    var value = arrow[key];
    if (typeof value === "object") {
      var valKeys = Object.keys(value || {});
      var remainder = valKeys[0];
      if (remainder) {
        var realKey = [key, valKeys].join(".");
        var realValue = value[remainder];
        delete arrow[key];
        arrow[realKey] = realValue;
        realValue = obj[key][remainder];
        delete obj[key];
        obj[realKey] = realValue;
        madeChanges = true;
      }
    }
  });

  if (madeChanges) console.log("unfuck redis", JSON.stringify(obj, null, 2));

  Object.keys(obj).forEach(key => {
    if (obj[key] && obj[key].length > FIELD_SIZE_LIMIT) {
      obj[key] = obj[key].slice(0, FIELD_SIZE_LIMIT);
      console.log("truncated for other peer", key);
    }
  });

  return obj;
};
