const slugify = str => (str || "").toString().toLowerCase().trim()
  .replace(/[^\w\s-]/g, "")
  .replace(/[\s_-]+/g, "-")
  .replace(/^-+|-+$/g, "");
export default slugify;
