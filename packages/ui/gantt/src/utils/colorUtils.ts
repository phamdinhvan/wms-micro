// Color utilities for generating Tailwind color palettes
import {MantineColorTuple} from '@wms/core';
import colors from 'tailwindcss/colors';

// Available Tailwind color names that we support
export const AVAILABLE_COLORS = [
  'slate',
  'gray',
  'zinc',
  'neutral',
  'stone',
  'red',
  'orange',
  'amber',
  'yellow',
  'lime',
  'green',
  'emerald',
  'teal',
  'cyan',
  'sky',
  'blue',
  'indigo',
  'violet',
  'purple',
  'fuchsia',
  'pink',
  'rose',
] as const;

export type TailwindColorName = (typeof AVAILABLE_COLORS)[number];

// Parse Tailwind color slug (e.g., "blue-500" -> { hue: "blue", weight: 500 })
export function parseTailwindSlug(slug: string) {
  const [hue, weightStr] = slug.split('-');
  const weight = Number(weightStr) || 500;
  return {hue: hue as TailwindColorName, weight};
}

// Parse color input - supports both "blue" and "blue-500" formats
export function parseColorInput(input: string): {
  colorName: TailwindColorName;
  shade?: number;
} {
  if (input.includes('-')) {
    const {hue, weight} = parseTailwindSlug(input);
    return {colorName: hue, shade: weight};
  }
  return {colorName: input as TailwindColorName};
}

// Generate full color palette from any color input (color name or color-shade)
export function generateColorPaletteFromInput(
  input: string,
): MantineColorTuple {
  const {colorName} = parseColorInput(input);

  if (!isValidColorName(colorName)) {
    throw new Error(`Invalid color name: ${colorName}`);
  }

  return getTailwindScale(colorName);
}

// Get the main color from input (returns 500 shade or specified shade)
export function getMainColorFromInput(input: string): string {
  const {colorName, shade} = parseColorInput(input);

  if (!isValidColorName(colorName)) {
    throw new Error(`Invalid color name: ${colorName}`);
  }

  const palette = (colors as any)[colorName];
  const targetShade = shade || 500;
  return palette[targetShade.toString()] || palette['500'];
}

// Get 10-shade scale from Tailwind colors (50, 100, 200, ..., 900)
export function getTailwindScale(hue: TailwindColorName): MantineColorTuple {
  const palette = (colors as any)[hue];
  if (!palette) throw new Error(`Unknown Tailwind color: ${hue}`);

  const keys = [
    '50',
    '100',
    '200',
    '300',
    '400',
    '500',
    '600',
    '700',
    '800',
    '900',
  ];
  return keys.map(k => palette[k]) as MantineColorTuple;
}

// Get the main color (500 shade) from a Tailwind color name
export function getTailwindMainColor(hue: TailwindColorName): string {
  const palette = (colors as any)[hue];
  if (!palette) throw new Error(`Unknown Tailwind color: ${hue}`);
  return palette['500'];
}

// Generate color options for select dropdown
export function getColorOptions() {
  return AVAILABLE_COLORS.map(colorName => ({
    value: colorName,
    label: colorName.charAt(0).toUpperCase() + colorName.slice(1),
    color: getTailwindMainColor(colorName), // For preview in dropdown
  }));
}

// Convert color name to full Mantine color tuple
export function colorNameToMantineTuple(
  colorName: TailwindColorName,
): MantineColorTuple {
  return getTailwindScale(colorName);
}

// Get color preview for a given color name (returns the 500 shade)
export function getColorPreview(colorName: TailwindColorName): string {
  return getTailwindMainColor(colorName);
}

// Validate if a color name is supported
export function isValidColorName(
  colorName: string,
): colorName is TailwindColorName {
  return AVAILABLE_COLORS.includes(colorName as TailwindColorName);
}

// Generate default color palette for theme
export function generateDefaultColorPalette(): Record<
  string,
  MantineColorTuple
> {
  return {
    primary: getTailwindScale('blue'),
    secondary: getTailwindScale('pink'),
    gray: getTailwindScale('gray'),
    red: getTailwindScale('red'),
    orange: getTailwindScale('orange'),
    yellow: getTailwindScale('yellow'),
    green: getTailwindScale('green'),
    cyan: getTailwindScale('cyan'),
    blue: getTailwindScale('blue'),
    indigo: getTailwindScale('indigo'),
    purple: getTailwindScale('purple'),
  };
}

// Reverse-engineer color name from Mantine color tuple (best effort)
export function getColorNameFromTuple(
  colorTuple: MantineColorTuple,
  defaultName: TailwindColorName,
): TailwindColorName {
  return defaultName;
}
/** ---------- sRGB <-> OKLCH helpers (no libs) ---------- */

const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
const srgbToLinear = (c: number) =>
  c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
const linearToSrgb = (c: number) =>
  c <= 0.0031308 ? 12.92 * c : 1.055 * Math.pow(c, 1 / 2.4) - 0.055;

// sRGB 0..255 -> 0..1 linear, then -> OKLab -> OKLCH
function hexToOklch(hex: string): {l: number; c: number; h: number} {
  const h = hex.replace('#', '');
  const r = parseInt(h.slice(0, 2), 16) / 255;
  const g = parseInt(h.slice(2, 4), 16) / 255;
  const b = parseInt(h.slice(4, 6), 16) / 255;

  const R = srgbToLinear(r);
  const G = srgbToLinear(g);
  const B = srgbToLinear(b);

  // linear sRGB -> LMS (OKLab)
  const l_ = 0.4122214708 * R + 0.5363325363 * G + 0.0514459929 * B;
  const m_ = 0.2119034982 * R + 0.6806995451 * G + 0.1073969566 * B;
  const s_ = 0.0883024619 * R + 0.2817188376 * G + 0.6299787005 * B;

  const l = Math.cbrt(l_);
  const m = Math.cbrt(m_);
  const s = Math.cbrt(s_);

  const L = 0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s;
  const A = 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s;
  const B2 = 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s;

  const C = Math.sqrt(A * A + B2 * B2);
  let H = Math.atan2(B2, A) * (180 / Math.PI);
  if (H < 0) H += 360;

  return {l: L, c: C, h: H};
}

function oklchToHex(L: number, C: number, H: number): string {
  const hRad = (H * Math.PI) / 180;
  const A = C * Math.cos(hRad);
  const B2 = C * Math.sin(hRad);

  // OKLab -> LMS -> linear sRGB
  const l = L + 0.3963377774 * A + 0.2158037573 * B2;
  const m = L - 0.1055613458 * A - 0.0638541728 * B2;
  const s = L - 0.0894841775 * A - 1.291485548 * B2;

  const l3 = l * l * l;
  const m3 = m * m * m;
  const s3 = s * s * s;

  let R = 4.0767416621 * l3 - 3.3077115913 * m3 + 0.2309699292 * s3;
  let G = -1.2684380046 * l3 + 2.6097574011 * m3 - 0.3413193965 * s3;
  let B = 0.0041960863 * l3 - 0.7034186147 * m3 + 1.707614701 * s3;

  R = clamp01(linearToSrgb(R));
  G = clamp01(linearToSrgb(G));
  B = clamp01(linearToSrgb(B));

  const to2 = (x: number) =>
    Math.round(x * 255)
      .toString(16)
      .padStart(2, '0');
  return `#${to2(R)}${to2(G)}${to2(B)}`;
}

/** Clamp OKLCH into a safe-ish gamut by reducing C if needed */
function oklchToHexClamped(L: number, C: number, H: number): string {
  // Try decreasing chroma if the color clips
  for (let k = C; k >= 0; k -= Math.max(0.005, C * 0.08)) {
    const hex = oklchToHex(L, k, H);
    // If it round-trips close enough, accept. (Quick heuristic: no NaN and not black unless L small)
    if (hex) return hex;
  }
  // Fallback: grayscale with same L
  return oklchToHex(L, 0, H);
}

/** ---------- The generator (no dependency) ---------- */
export function generateColorShades(baseHex: string): MantineColorTuple {
  const {l: L0, c: C0, h: H0} = hexToOklch(baseHex);

  // Relative lightness offsets to mimic Material-like levels.
  // Index 4 is the base (≈500). Feel free to tweak these curves to your taste.
  const ΔL = [+0.26, +0.22, +0.16, +0.08, 0, -0.12, -0.2, -0.26, -0.32, -0.4];

  // Chroma scale: vivid mid-tones, softer ends (avoid neon highlights / muddy shadows)
  const Cscale = [0.2, 0.35, 0.55, 0.8, 1.0, 1.0, 0.95, 0.9, 0.85, 0.8];

  // Guardrails for L so we don’t blow out to white/black
  const Lmin = 0.18,
    Lmax = 0.985;

  const shades: string[] = new Array(10);
  for (let i = 0; i < 10; i++) {
    let L = Math.min(Lmax, Math.max(Lmin, L0 + ΔL[i]));
    let C = Math.max(0, C0 * Cscale[i]);

    // If base is already very light/dark, compress offsets:
    if (L0 > 0.8 && i < 4) L = Math.min(Lmax, L0 + ΔL[i] * 0.6);
    if (L0 < 0.3 && i > 4) L = Math.max(Lmin, L0 + ΔL[i] * 0.6);

    shades[i] = oklchToHexClamped(L, C, H0);
  }

  // Ensure exact base at index 4 is the input color
  shades[4] = baseHex;

  return shades as MantineColorTuple;
}
