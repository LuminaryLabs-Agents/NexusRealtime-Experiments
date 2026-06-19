export const NORMAL_STYLE_KIT_VERSION = "0.1.0";

export function createNormalStyleKit(config = {}) {
  return {
    id: "normal-style-kit",
    version: NORMAL_STYLE_KIT_VERSION,
    domain: "normal-style",
    provides: ["normal:policy", "normal:facets", "normal:water"],
    policies: config.policies ?? {
      island: { mode: "smooth-heightfield", strength: 0.78 },
      palm: { mode: "segment-faceted", strength: 0.64 },
      coconut: { mode: "round-faceted", strength: 0.58 },
      water: { mode: "flow-normal", strength: 0.82 },
      fish: { mode: "soft-body", strength: 0.45 }
    },
    getPolicy(domain = "island") {
      return this.policies[domain] ?? this.policies.island;
    }
  };
}

export default createNormalStyleKit;
