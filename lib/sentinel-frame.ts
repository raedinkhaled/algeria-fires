/**
 * إطار صور Sentinel-2 المنشورة (s2-pre/post-truecolor وs2-dnbr-severity).
 *
 * يقرأ `Fires/scripts/08_sentinel2.py` نافذة WGS84 ثابتة (W 5.36، S 36.50،
 * E 6.45، N 36.96) من مربع 31SGA، فيحوّلها إلى غلاف UTM 31N بعشرين نقطة على
 * كل ضلع ويقرأ الشبكة بدقة 20 م. هذا الغلاف نفسه يُحسب هنا، فيتطابق مع الشبكة
 * الأصلية (4946 × 2700 بكسل في burn-severity.png) ويسمح بوضع الإحداثيات
 * المنشورة على الصورة بدقة بكسل أصلي تقريباً.
 */

export const analysisWindow = { west: 5.36, south: 36.5, east: 6.45, north: 36.96 };

const A = 6378137;
const F = 1 / 298.257223563;
const K0 = 0.9996;
const E2 = F * (2 - F);
const EP2 = E2 / (1 - E2);

/** WGS84 → UTM (نصف الكرة الشمالي)، بمتسلسلة Snyder المعتادة. */
function toUtm(lat: number, lon: number, zone = 31): [number, number] {
  const lon0 = (((zone - 1) * 6 - 180 + 3) * Math.PI) / 180;
  const phi = (lat * Math.PI) / 180;
  const lambda = (lon * Math.PI) / 180;
  const n = A / Math.sqrt(1 - E2 * Math.sin(phi) ** 2);
  const t = Math.tan(phi) ** 2;
  const c = EP2 * Math.cos(phi) ** 2;
  const a = Math.cos(phi) * (lambda - lon0);
  const e4 = E2 * E2;
  const e6 = e4 * E2;
  const m =
    A *
    ((1 - E2 / 4 - (3 * e4) / 64 - (5 * e6) / 256) * phi -
      ((3 * E2) / 8 + (3 * e4) / 32 + (45 * e6) / 1024) * Math.sin(2 * phi) +
      ((15 * e4) / 256 + (45 * e6) / 1024) * Math.sin(4 * phi) -
      ((35 * e6) / 3072) * Math.sin(6 * phi));
  const x =
    K0 *
      n *
      (a +
        ((1 - t + c) * a ** 3) / 6 +
        ((5 - 18 * t + t * t + 72 * c - 58 * EP2) * a ** 5) / 120) +
    500000;
  const y =
    K0 *
    (m +
      n *
        Math.tan(phi) *
        ((a * a) / 2 +
          ((5 - t + 9 * c + 4 * c * c) * a ** 4) / 24 +
          ((61 - 58 * t + t * t + 600 * c - 330 * EP2) * a ** 6) / 720));
  return [x, y];
}

/* غلاف النافذة كما يحسبه rasterio.transform_bounds بكثافة 21 نقطة */
const envelope = (() => {
  const { west, south, east, north } = analysisWindow;
  const points: [number, number][] = [];
  const steps = 22;
  for (let index = 0; index <= steps; index += 1) {
    const f = index / steps;
    const lon = west + (east - west) * f;
    const lat = south + (north - south) * f;
    points.push(toUtm(south, lon), toUtm(north, lon), toUtm(lat, west), toUtm(lat, east));
  }
  const xs = points.map(([x]) => x);
  const ys = points.map(([, y]) => y);
  return {
    minX: Math.min(...xs),
    maxX: Math.max(...xs),
    minY: Math.min(...ys),
    maxY: Math.max(...ys),
  };
})();

/** عرض الإطار بالأمتار (نحو 98.9 كم). */
export const frameWidthMeters = envelope.maxX - envelope.minX;

/** موضع نقطة على الصورة كنسبة مئوية من عرضها وارتفاعها. */
export function framePosition(lat: number, lon: number) {
  const [x, y] = toUtm(lat, lon);
  return {
    left: ((x - envelope.minX) / (envelope.maxX - envelope.minX)) * 100,
    top: ((envelope.maxY - y) / (envelope.maxY - envelope.minY)) * 100,
  };
}

/** داخل نافذة التحليل الجغرافية نفسها، لا غلافها المستطيل فقط. */
export function insideAnalysisWindow(lat: number, lon: number) {
  const { west, south, east, north } = analysisWindow;
  return lat >= south && lat <= north && lon >= west && lon <= east;
}
