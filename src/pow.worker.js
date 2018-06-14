import { pow } from "notabug-peer";

const solver = new pow.Solver();

function toHexString(byteArray) {
  return Array.from(byteArray, function(byte) {
    return ("0" + (byte & 0xFF).toString(16)).slice(-2);
  }).join("");
}

try {
  onmessage = function(e) { // eslint-disable-line
    const nonce = toHexString(solver.solve(e.data[1], e.data[0]));
    postMessage(nonce);
  };
} catch (e) { // eslint-disable-line

}
