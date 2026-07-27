import assert from "node:assert/strict";
import test from "node:test";

import { routeShot } from "../scripts/route-shot.mjs";

const cases = [
  {
    name: "simple atmospheric shot stays at T0",
    input: {},
    expected: ["T0"]
  },
  {
    name: "identity requirement adds T1",
    input: { identityRequired: true },
    expected: ["T1"]
  },
  {
    name: "restyling existing footage routes to T2",
    input: { restyleExistingFootage: true },
    expected: ["T2"]
  },
  {
    name: "exact camera with a 3D blockout routes to T3",
    input: { exactCamera: true, canBuild3d: true },
    expected: ["T3"]
  },
  {
    name: "complex interaction routes to T4",
    input: { complexInteraction: true },
    expected: ["T4"]
  },
  {
    name: "duration alone routes to the T5 wrapper",
    input: { exceedsReliableClipLength: true },
    expected: ["T5"]
  },
  {
    name: "identity and interaction compose instead of stopping at T1",
    input: { identityRequired: true, complexInteraction: true },
    expected: ["T1", "T4"]
  },
  {
    name: "all independent constraints compose",
    input: {
      identityRequired: true,
      exactCamera: true,
      canBuild3d: true,
      complexInteraction: true,
      exceedsReliableClipLength: true
    },
    expected: ["T1", "T3", "T4", "T5"]
  },
  {
    name: "existing footage can provide structure when 3D is unavailable",
    input: {
      exactCamera: true,
      canBuild3d: false,
      restyleExistingFootage: true
    },
    expected: ["T2"]
  },
  {
    name: "exact from-scratch geometry without 3D falls back to multistep control",
    input: {
      exactCamera: true,
      canBuild3d: false,
      restyleExistingFootage: false
    },
    expected: ["T4"]
  }
];

for (const scenario of cases) {
  test(scenario.name, () => {
    assert.deepEqual(routeShot(scenario.input), scenario.expected);
  });
}
