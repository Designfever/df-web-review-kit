// html2canvas 가 지원하지 않는 oklch()/oklab() 색상을 sRGB 문자열로 변환한다.
// 캡처 정책(무엇을 정규화할지)은 capture.ts 에 두고, 여기서는 순수 색공간 변환만 담당한다.
export function normalizeUnsupportedColorFunctions(value: string) {
  return value
    .replace(
      /oklch\(\s*([+-]?\d*\.?\d+%?)\s+([+-]?\d*\.?\d+)\s+([+-]?\d*\.?\d+)(deg|rad|turn)?(?:\s*\/\s*([+-]?\d*\.?\d+%?))?\s*\)/gi,
      (_match, lightness, chroma, hue, unit, alpha) =>
        oklchToRgbString(lightness, chroma, hue, unit, alpha)
    )
    .replace(
      /oklab\(\s*([+-]?\d*\.?\d+%?)\s+([+-]?\d*\.?\d+%?)\s+([+-]?\d*\.?\d+%?)(?:\s*\/\s*([+-]?\d*\.?\d+%?))?\s*\)/gi,
      (_match, lightness, okA, okB, alpha) =>
        oklabToRgbString(lightness, okA, okB, alpha)
    );
}

function oklchToRgbString(
  lightness: string,
  chroma: string,
  hue: string,
  unit?: string,
  alpha?: string
) {
  const l = parsePercentNumber(lightness);
  const c = Number.parseFloat(chroma);
  const h = parseHueDegrees(hue, unit);
  const a = alpha ? parsePercentNumber(alpha) : 1;
  const hueRadians = (h * Math.PI) / 180;
  const okA = c * Math.cos(hueRadians);
  const okB = c * Math.sin(hueRadians);

  return oklabComponentsToRgbString(l, okA, okB, a);
}

function oklabToRgbString(
  lightness: string,
  okA: string,
  okB: string,
  alpha?: string
) {
  return oklabComponentsToRgbString(
    parsePercentNumber(lightness),
    parseOklabChannel(okA),
    parseOklabChannel(okB),
    alpha ? parsePercentNumber(alpha) : 1
  );
}

function oklabComponentsToRgbString(
  l: number,
  okA: number,
  okB: number,
  alpha: number
) {
  const l_ = l + 0.3963377774 * okA + 0.2158037573 * okB;
  const m_ = l - 0.1055613458 * okA - 0.0638541728 * okB;
  const s_ = l - 0.0894841775 * okA - 1.291485548 * okB;

  const l3 = l_ * l_ * l_;
  const m3 = m_ * m_ * m_;
  const s3 = s_ * s_ * s_;

  const r = linearRgbToSrgb(4.0767416621 * l3 - 3.3077115913 * m3 + 0.2309699292 * s3);
  const g = linearRgbToSrgb(-1.2684380046 * l3 + 2.6097574011 * m3 - 0.3413193965 * s3);
  const b = linearRgbToSrgb(-0.0041960863 * l3 - 0.7034186147 * m3 + 1.707614701 * s3);
  const red = Math.round(clamp01(r) * 255);
  const green = Math.round(clamp01(g) * 255);
  const blue = Math.round(clamp01(b) * 255);
  const opacity = clamp01(alpha);

  return opacity < 1
    ? `rgba(${red}, ${green}, ${blue}, ${roundAlpha(opacity)})`
    : `rgb(${red}, ${green}, ${blue})`;
}

function parsePercentNumber(value: string) {
  const number = Number.parseFloat(value);
  return value.trim().endsWith('%') ? number / 100 : number;
}

function parseOklabChannel(value: string) {
  const number = Number.parseFloat(value);
  return value.trim().endsWith('%') ? (number / 100) * 0.4 : number;
}

function parseHueDegrees(value: string, unit?: string) {
  const number = Number.parseFloat(value);
  if (unit === 'rad') return (number * 180) / Math.PI;
  if (unit === 'turn') return number * 360;
  return number;
}

function linearRgbToSrgb(value: number) {
  return value <= 0.0031308
    ? 12.92 * value
    : 1.055 * Math.pow(value, 1 / 2.4) - 0.055;
}

function clamp01(value: number) {
  if (Number.isNaN(value)) return 0;
  return Math.min(1, Math.max(0, value));
}

function roundAlpha(value: number) {
  return Math.round(value * 1000) / 1000;
}
