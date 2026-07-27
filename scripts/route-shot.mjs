const rungOrder = ["T0", "T1", "T2", "T3", "T4", "T5"];

/**
 * Return every technique rung required by the independent constraints in a shot.
 *
 * T1 anchors identity, T2/T3 provide structural guidance, T4 owns interaction and
 * compositing, and T5 wraps the resulting per-segment pipeline for duration. T0 is
 * returned only when no higher rung is required.
 */
export function routeShot({
  identityRequired = false,
  restyleExistingFootage = false,
  exactCamera = false,
  canBuild3d = false,
  complexInteraction = false,
  exceedsReliableClipLength = false
} = {}) {
  const routes = new Set();

  if (identityRequired) routes.add("T1");

  if (restyleExistingFootage) {
    // Existing footage already owns camera and geometry, so T2 is the structural route.
    routes.add("T2");
  } else if (exactCamera) {
    // Prefer a 3D blockout. When that is unavailable, separate constrained passes at T4
    // are the controllable fallback instead of pretending a prompt can be exact.
    routes.add(canBuild3d ? "T3" : "T4");
  }

  if (complexInteraction) routes.add("T4");
  if (exceedsReliableClipLength) routes.add("T5");

  if (routes.size === 0) routes.add("T0");

  return rungOrder.filter((rung) => routes.has(rung));
}
