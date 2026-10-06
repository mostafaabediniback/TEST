const CARS_PER_TILE = 50;
const MOCK_LATENCY_MIN = 90;
const MOCK_LATENCY_MAX = 240;
const REFRESH_BUCKET_MS = 5000;

function hashTile(z, x, y) {
  let hash = 2166136261;
  const value = `${z}/${x}/${y}`;

  for (let i = 0; i < value.length; i += 1) {
    hash ^= value.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }

  return hash >>> 0;
}

function seededRandom(seed) {
  let state = seed || 1;

  return () => {
    state += 0x6d2b79f5;
    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

function tileXToLng(x, z) {
  return (x / 2 ** z) * 360 - 180;
}

function tileYToLat(y, z) {
  const n = Math.PI - (2 * Math.PI * y) / 2 ** z;
  return (180 / Math.PI) * Math.atan(Math.sinh(n));
}

function getTileBounds(z, x, y) {
  return {
    west: tileXToLng(x, z),
    east: tileXToLng(x + 1, z),
    north: tileYToLat(y, z),
    south: tileYToLat(y + 1, z),
  };
}

function wait(ms, signal) {
  return new Promise((resolve, reject) => {
    const timeout = window.setTimeout(resolve, ms);

    if (!signal) return;

    const handleAbort = () => {
      window.clearTimeout(timeout);
      reject(new DOMException("Request aborted", "AbortError"));
    };

    if (signal.aborted) {
      handleAbort();
      return;
    }

    signal.addEventListener("abort", handleAbort, { once: true });
  });
}

function getStatus(random) {
  const value = random();

  if (value < 0.56) return "available";
  if (value < 0.9) return "busy";
  return "offline";
}

const firstNames = [
  "علی",
  "رضا",
  "محمد",
  "امیر",
  "حسین",
  "مهدی",
  "سعید",
  "آرمان",
  "پویان",
  "کیوان",
];

const lastNames = [
  "رضایی",
  "احمدی",
  "محمدی",
  "حسینی",
  "کریمی",
  "مرادی",
  "کاظمی",
  "رحیمی",
  "جعفری",
  "صادقی",
];

export async function getCarsByTile({ z, x, y, signal }) {
  const random = seededRandom(hashTile(z, x, y));
  const latency =
    MOCK_LATENCY_MIN + random() * (MOCK_LATENCY_MAX - MOCK_LATENCY_MIN);

  await wait(latency, signal);

  const bounds = getTileBounds(z, x, y);
  const latSpan = bounds.north - bounds.south;
  const lngSpan = bounds.east - bounds.west;
  const timeBucket = Math.floor(Date.now() / REFRESH_BUCKET_MS);
  const cars = [];

  for (let index = 0; index < CARS_PER_TILE; index += 1) {
    const baseLat = bounds.south + random() * latSpan;
    const baseLng = bounds.west + random() * lngSpan;
    const phase = random() * Math.PI * 2;
    const speed = 0.45 + random() * 0.95;
    const movementScale = Math.min(latSpan, lngSpan) * 0.018;
    const movementTime = timeBucket * 0.28 * speed;
    const firstName = firstNames[Math.floor(random() * firstNames.length)];
    const lastName = lastNames[Math.floor(random() * lastNames.length)];
    const plateNumber = 10 + Math.floor(random() * 89);
    const plateSerial = 100 + Math.floor(random() * 899);

    cars.push({
      id: `${z}-${x}-${y}-${index}`,
      lat: baseLat + Math.sin(phase + movementTime) * movementScale,
      lng: baseLng + Math.cos(phase + movementTime) * movementScale,
      driverName: `${firstName} ${lastName}`,
      plate: `${plateNumber} الف ${plateSerial}`,
      status: getStatus(random),
    });
  }

  return cars;
}

export const mockCarsConfig = {
  carsPerTile: CARS_PER_TILE,
  refreshBucketMs: REFRESH_BUCKET_MS,
};
