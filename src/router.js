export function readRoute(hash = location.hash) {
  const [raw = "", query = ""] = hash.replace(/^#/, "").split("?");
  const paths = raw.split("/").filter(Boolean);
  const legacy = ["checkout", "pay", "certificate"].includes(paths[0]);
  return {
    page: legacy ? "work" : paths[0] || "home",
    id: paths[1],
    spec:
      new URLSearchParams(query).get("spec") === "postcard"
        ? "postcard"
        : "print",
    legacy,
  };
}
