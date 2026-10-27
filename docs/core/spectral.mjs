// Adapted from yongfu-li/eda-learning platform/assets/clustering-core.js.
// Source: https://github.com/yongfu-li/eda-learning/blob/main/platform/assets/clustering-core.js
// Teaching reference, 80 shifted inverse iterations and 20–80% sweep filter.
import {cutsize as graphCut} from './metrics.mjs';
const cutsize=(a,edges)=>graphCut({edges},a);
export function laplacian(nodes, edges) {
  const idx = Object.fromEntries(nodes.map((n, i) => [n, i]));
  const n = nodes.length;
  const L = Array.from({ length: n }, () => Array(n).fill(0));
  for (const { u, v, w } of edges) {
    const i = idx[u];
    const j = idx[v];
    L[i][j] -= w;
    L[j][i] -= w;
    L[i][i] += w;
    L[j][j] += w;
  }
  return L;
}

function dot(a, b) {
  let s = 0;
  for (let i = 0; i < a.length; i++) s += a[i] * b[i];
  return s;
}

function norm(a) {
  return Math.sqrt(dot(a, a));
}

/** Fiedler bisection via shifted inverse iteration (mirrors advanced.py). */
export function spectralBisection(nodes, edges, sizes) {
  const n = nodes.length;
  if (n < 2) return { assignment: { [nodes[0]]: "0" }, order: [[nodes[0], 0]] };
  const L = laplacian(nodes, edges);
  const ones = Array(n).fill(1 / Math.sqrt(n));
  let x = Array.from({ length: n }, (_, i) => (i % 2 === 0 ? 1 : -1));
  const proj = dot(x, ones);
  x = x.map((xi, i) => xi - proj * ones[i]);
  let xn = norm(x) || 1;
  x = x.map((xi) => xi / xn);
  const energy = v => edges.reduce((sum, e) => {
    const i = nodes.indexOf(e.u), j = nodes.indexOf(e.v);
    return sum + e.w * (v[i] - v[j]) ** 2;
  }, 0);
  // Record the actual solver state for teaching; this does not change selection.
  const snapshots = [{ iteration: 0, values: x.slice(), energy: energy(x) }];

  const eps = 1e-3;
  const M = L.map((row) => row.slice());
  for (let i = 0; i < n; i++) M[i][i] += eps;

  for (let iter = 0; iter < 80; iter++) {
    let y = x.slice();
    for (let sweep = 0; sweep < 40; sweep++) {
      const yNew = y.slice();
      for (let i = 0; i < n; i++) {
        let s = x[i];
        for (let j = 0; j < n; j++) {
          if (j !== i) s -= M[i][j] * y[j];
        }
        yNew[i] = s / M[i][i];
      }
      y = yNew;
    }
    const yp = dot(y, ones);
    y = y.map((yi, i) => yi - yp * ones[i]);
    const yn = norm(y) || 1;
    x = y.map((yi) => yi / yn);
    if ([1, 2, 5, 10, 20, 40, 80].includes(iter + 1))
      snapshots.push({ iteration: iter + 1, values: x.slice(), energy: energy(x) });
  }

  const order = nodes
    .map((name, i) => [name, x[i]])
    .sort((a, b) => a[1] - b[1] || (a[0] < b[0] ? -1 : 1));
  const sz = sizes || Object.fromEntries(nodes.map((n) => [n, 1]));
  const total = nodes.reduce((s, n) => s + sz[n], 0);
  let bestAsn = null;
  let bestCut = Infinity;
  let selectedPosition = null;
  const candidates = [];
  for (let k = 1; k < n; k++) {
    const left = new Set(order.slice(0, k).map(([name]) => name));
    const asn = Object.fromEntries(nodes.map((n) => [n, left.has(n) ? "0" : "1"]));
    const frac = [...left].reduce((s, n) => s + sz[n], 0) / total;
    const c = cutsize(asn, edges);
    candidates.push({ position: k, left: order.slice(0, k).map(v => v[0]),
      right: order.slice(k).map(v => v[0]), cut: c, fraction: frac,
      eligible: frac >= 0.2 && frac <= 0.8,
      edges: edges.filter(e => asn[e.u] !== asn[e.v]).map(e => ({...e})) });
    if (frac < 0.2 || frac > 0.8) continue;
    if (c < bestCut - 1e-12) {
      bestCut = c;
      bestAsn = asn;
      selectedPosition = k;
    }
  }
  const fallback = !bestAsn;
  if (fallback) {
    const k = Math.floor(n / 2);
    selectedPosition = k;
    const left = new Set(order.slice(0, k).map(([name]) => name));
    bestAsn = Object.fromEntries(nodes.map((n) => [n, left.has(n) ? "0" : "1"]));
  }
  for (const c of candidates) c.chosen = c.position === selectedPosition;
  return { assignment: bestAsn, order,
    trace: { nodes: nodes.slice(), edges: edges.map(e => ({...e})), matrix: L,
      snapshots, candidates, selectedPosition, fallback, shift: eps,
      outerIterations: 80, jacobiSweeps: 40 } };
}
