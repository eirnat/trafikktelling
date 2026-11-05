export const SITES = [
  { id: "e16-laerdal-vest", label: "E16 Lærdalstunnelen vest" },
  { id: "e16-laerdal-ost", label: "E16 Lærdalstunnelen øst" },
  { id: "rv52-hemsedal-vest", label: "Rv 52 Hemsedal vest" },
  { id: "rv52-hemsedal-ost", label: "Rv 52 Hemsedal øst" },
] as const;

export type SiteId = (typeof SITES)[number]["id"];

export const UNKNOWN_SITE_LABEL = "Uten sted";

const SITE_IDS = new Set<string>(SITES.map((site) => site.id));

export function isSiteId(value: string): value is SiteId {
  return SITE_IDS.has(value);
}

export function siteLabel(id: string | null) {
  if (!id) return UNKNOWN_SITE_LABEL;
  return SITES.find((site) => site.id === id)?.label ?? UNKNOWN_SITE_LABEL;
}
