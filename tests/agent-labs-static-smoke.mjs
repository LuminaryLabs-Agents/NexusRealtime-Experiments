import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const living = readFileSync("experiments/living-agent-lab/index.html", "utf8");
const onnx = readFileSync("experiments/onnx-agent-lab/index.html", "utf8");

assert.match(living, /Living Agent Lab/);
assert.match(living, /Xenova\/mobilebert-uncased-mnli/);
assert.match(living, /zero-shot-classification/);
assert.match(living, /availableActions/);
assert.match(living, /visibleState/);
assert.match(living, /window\.GameHost/);
assert.match(living, /Dispose/);

assert.match(onnx, /ONNX Agent Lab/);
assert.match(onnx, /Xenova\/distilgpt2/);
assert.match(onnx, /text-generation/);
assert.match(onnx, /Dispose/);
assert.match(onnx, /window\.GameHost/);
assert.match(onnx, /fallbackReply/);

console.log("agent-labs-static-smoke.mjs passed");
