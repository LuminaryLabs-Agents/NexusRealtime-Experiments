import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { apps } from "../experiments/_shared/nexus-gallery-data.js";

const cutoverManifestPath = "experiments/domain-kit-cutover-manifest.json";
const pruningMapPath = "experiments/canonical-route-pruning-map.json";

const cutoverManifest = JSON.parse(readFileSync(cutoverManifestPath, "utf8"));
const pruningMap = JSON.parse(readFileSync(pruningMapPath, "utf8"));

function normalizeRoute(route) {
  return route.replace(/^\.\//, "").replace(/\/?$/, "/");
}

const allowedScenarioLanes = new Set([
  "traversal-cargo-pressure",
  "survey-pressure",
  "field-engineer-composition",
  "aerial-open-traversal",
  "survival-ecology",
  "strategic-pressure-loop",
  "action-defense-extraction"
]);

assert.equal(
  pruningMap.policy,
  "one pruning issue per manifest canonical route",
  "route pruning map should keep one issue per manifest-owned canonical route"
);
assert.equal(
  pruningMap.sourceManifest,
  cutoverManifestPath,
  "route pruning map should declare the cutover manifest it extends"
);
assert.ok(
  pruningMap.decisionRule.includes("DSK") && pruningMap.decisionRule.includes("deterministic replay"),
  "route pruning map should preserve DSK and replay promotion rules"
);

assert.ok(Array.isArray(pruningMap.canonicalRouteIssues), "route pruning map should expose canonicalRouteIssues[]");

const canonicalById = new Map(cutoverManifest.canonicalRoutes.map((entry) => [entry.id, entry]));
const issueByCanonicalId = new Map();
const galleryById = new Map(apps.map((app) => [app.id, app]));

for (const issue of pruningMap.canonicalRouteIssues) {
  assert.ok(issue.canonicalId, "each pruning issue needs a canonicalId");
  assert.ok(!issueByCanonicalId.has(issue.canonicalId), `${issue.canonicalId} should have one pruning issue`);
  issueByCanonicalId.set(issue.canonicalId, issue);
}

assert.equal(
  issueByCanonicalId.size,
  canonicalById.size,
  "each canonical cutover route should have exactly one pruning issue"
);

for (const canonicalId of canonicalById.keys()) {
  assert.ok(issueByCanonicalId.has(canonicalId), `${canonicalId} should have a pruning issue`);
}

for (const issue of pruningMap.canonicalRouteIssues) {
  const canonical = canonicalById.get(issue.canonicalId);

  assert.equal(
    issue.canonicalPath,
    canonical.canonicalPath,
    `${issue.canonicalId} should match the canonical path in the cutover manifest`
  );
  assert.ok(!/-v[0-9]+\/?$/.test(issue.canonicalPath), `${issue.canonicalId} canonical path should not be versioned`);
  assert.ok(existsSync(`${issue.canonicalPath}index.html`), `${issue.canonicalId} canonical route should have index.html`);
  assert.ok(allowedScenarioLanes.has(issue.scenarioLane), `${issue.canonicalId} should use a known scenario lane`);

  assert.ok(Array.isArray(issue.variantsToFold), `${issue.canonicalId} should list variants to fold or hold as backlog`);
  const legacyPaths = Array.isArray(issue.legacyPathsToRetire) ? issue.legacyPathsToRetire : [];
  assert.ok(
    issue.variantsToFold.length + legacyPaths.length > 0,
    `${issue.canonicalId} should identify variant or legacy-path pruning pressure`
  );

  assert.ok(
    Array.isArray(issue.manifestDocsUpdates) && issue.manifestDocsUpdates.length > 0,
    `${issue.canonicalId} should list manifest/docs updates`
  );
  assert.ok(
    Array.isArray(issue.localJsToMoveIntoProtoKits) && issue.localJsToMoveIntoProtoKits.length > 0,
    `${issue.canonicalId} should identify local JS to move toward ProtoKits`
  );
  assert.ok(
    Array.isArray(issue.smokeReplayTestsToPreserve) && issue.smokeReplayTestsToPreserve.length > 0,
    `${issue.canonicalId} should preserve smoke/replay coverage direction`
  );
  assert.equal(
    issue.pruningHelpsAbout20Portfolio,
    true,
    `${issue.canonicalId} should say whether pruning helps the about-20 canonical portfolio`
  );
  assert.ok(
    typeof issue.portfolioEffect === "string" && issue.portfolioEffect.length > 20,
    `${issue.canonicalId} should explain portfolio effect`
  );

  const variantIds = new Set();
  for (const variant of issue.variantsToFold) {
    assert.ok(variant.id || variant.path, `${issue.canonicalId} variants should include an id or path`);
    assert.ok(
      typeof variant.reason === "string" && variant.reason.length > 20,
      `${issue.canonicalId} variant pruning entries should explain why they fold or remain backlog`
    );

    if (variant.id) {
      assert.notEqual(variant.id, issue.canonicalId, `${variant.id} should not list itself as a variant`);
      assert.ok(!variantIds.has(variant.id), `${variant.id} should not be duplicated within one issue`);
      variantIds.add(variant.id);
      assert.ok(
        !canonicalById.has(variant.id),
        `${variant.id} should not be both canonical and listed as a fold/backlog variant`
      );

      const galleryEntry = galleryById.get(variant.id);
      if (galleryEntry && variant.route) {
        assert.equal(
          normalizeRoute(galleryEntry.route),
          normalizeRoute(variant.route),
          `${variant.id} route should match generated gallery data when the variant exists in the gallery`
        );
      }
    }
  }

  for (const legacyPath of legacyPaths) {
    assert.ok(
      /-v[0-9]+\/?$/.test(legacyPath) || (canonical.removedLegacyPaths || []).includes(legacyPath),
      `${issue.canonicalId} legacy paths should be explicit versioned folds or already recorded in the cutover manifest`
    );
  }
}

console.log("Canonical route pruning map smoke passed.");
