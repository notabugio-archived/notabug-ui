import pow from "/vendor/proof-of-work";

const solver = new pow.Solver();

function toHexString(byteArray) {
  return Array.from(byteArray, function (byte) {
    return ("0" + (byte & 0xff).toString(16)).slice(-2);
  }).join("");
}

onmessage = async function (e) {
  try {
    const nonce = await solver.solve(e.data[1], e.data[0])
    if(nonce)
      postMessage([true, toHexString(nonce)]);
    else
      postMessage([false])
  } catch (e) {
    console.error(e.stack || e);
    throw e;
  }
};
