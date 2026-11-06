export function validPublicBase(value) {
  try {
    const u = new URL(value);
    if (
      u.protocol !== "https:" ||
      u.username ||
      u.password ||
      u.search ||
      u.hash ||
      /^(localhost|127\.|0\.|10\.|192\.168\.|\[::1\])/.test(u.hostname) ||
      /^172\.(1[6-9]|2\d|3[01])\./.test(u.hostname) ||
      /\.(local|test|invalid)$/.test(u.hostname)
    )
      return "";
    return u.href.replace(/\/$/, "");
  } catch {
    return "";
  }
}
export const publicBase = validPublicBase(
  import.meta.env?.VITE_PUBLIC_SITE_URL || "",
);
export function workLink(id, base = publicBase) {
  const site = base ? `${base.replace(/\/$/, "")}/` : location.href.split("#")[0];
  return `${site}#/work/${encodeURIComponent(id)}`;
}
