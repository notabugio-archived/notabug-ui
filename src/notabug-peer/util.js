export function getDayStr(timestamp) {
  const d = new Date(timestamp || new Date().getTime());
  const year = d.getUTCFullYear();
  const month = d.getUTCMonth() + 1;
  const dayNum = d.getUTCDate();
  return `${year}/${month}/${dayNum}`;
}
