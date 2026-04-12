/** Faktory rychlosti podél kola (0–1), odvozené z ohybu SVG dráhy — cache podle `pathD`. */

const cache = new Map<string, Float32Array>();

const SAMPLE_COUNT = 384;
const BLUR_RADIUS = 3;
/** Úhel mezi sousedními úseky (rad); nad touto hodnotou už skoro plné „zabrzdění“. */
const ANGLE_FOR_MIN = 0.52;
/** Minimální faktor před normalizací průměru (zatáčky vs rovinka). */
const MIN_MULT_RAW = 0.4;

function clamp(n: number, lo: number, hi: number): number {
  return Math.min(hi, Math.max(lo, n));
}

function blurRing(src: Float32Array, r: number): Float32Array {
  const n = src.length;
  const out = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    let s = 0;
    for (let k = -r; k <= r; k++) {
      s += src[(i + k + n * 32) % n];
    }
    out[i] = s / (2 * r + 1);
  }
  return out;
}

function angleAt(
  px: ArrayLike<number>,
  py: ArrayLike<number>,
  i: number,
  n: number,
): number {
  const prev = (i - 1 + n) % n;
  const next = (i + 1) % n;
  const v1x = px[i] - px[prev];
  const v1y = py[i] - py[prev];
  const v2x = px[next] - px[i];
  const v2y = py[next] - py[i];
  const l1 = Math.hypot(v1x, v1y);
  const l2 = Math.hypot(v2x, v2y);
  if (l1 < 1e-6 || l2 < 1e-6) return 0;
  const dot = clamp((v1x * v2x + v1y * v2y) / (l1 * l2), -1, 1);
  return Math.acos(dot);
}

/**
 * Vypočte faktor rychlosti pro každý vzorek podél délky dráhy (1 = rovinka, méně = zatáčka).
 * Volat jen v prohlížeči (potřebuje SVG path).
 */
export function computeLapSpeedFactors(pathD: string): Float32Array | null {
  if (typeof document === "undefined") return null;

  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
  path.setAttribute("d", pathD);
  svg.appendChild(path);
  svg.setAttribute("aria-hidden", "true");
  svg.style.cssText =
    "position:absolute;left:-9999px;top:0;width:1px;height:1px;overflow:hidden;visibility:hidden";
  document.body.appendChild(svg);

  try {
    const total = path.getTotalLength();
    if (!Number.isFinite(total) || total < 1) return null;

    const n = SAMPLE_COUNT;
    const px = new Float64Array(n);
    const py = new Float64Array(n);
    for (let i = 0; i < n; i++) {
      const pt = path.getPointAtLength((i / n) * total);
      px[i] = pt.x;
      py[i] = pt.y;
    }

    const raw = new Float32Array(n);
    for (let i = 0; i < n; i++) {
      const ang = angleAt(px, py, i, n);
      const t = clamp(ang / ANGLE_FOR_MIN, 0, 1);
      raw[i] = MIN_MULT_RAW + (1 - MIN_MULT_RAW) * (1 - t * t);
    }

    const smoothed = blurRing(raw, BLUR_RADIUS);
    let sum = 0;
    for (let i = 0; i < n; i++) sum += smoothed[i];
    const mean = sum / n || 1;
    const out = new Float32Array(n);
    for (let i = 0; i < n; i++) {
      out[i] = clamp(smoothed[i] / mean, 0.28, 1.45);
    }
    return out;
  } finally {
    document.body.removeChild(svg);
  }
}

export function ensureLapSpeedFactors(pathD: string): Float32Array {
  const hit = cache.get(pathD);
  if (hit) return hit;

  const computed = computeLapSpeedFactors(pathD);
  const fallback = new Float32Array(SAMPLE_COUNT);
  fallback.fill(1);
  const arr = computed ?? fallback;
  cache.set(pathD, arr);
  return arr;
}

/** τ v [0,1) — lineární interpolace mezi vzorky. */
export function lookupLapSpeedFactor(factors: Float32Array, tau: number): number {
  const n = factors.length;
  if (n === 0) return 1;
  const u = ((tau % 1) + 1) % 1;
  const x = u * n;
  const i0 = Math.floor(x) % n;
  const i1 = (i0 + 1) % n;
  const frac = x - Math.floor(x);
  return factors[i0] * (1 - frac) + factors[i1] * frac;
}
