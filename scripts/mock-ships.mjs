import http from 'node:http';
import { pathToFileURL } from 'node:url';
import { tileToLngLat } from '../src/lib/map/mapTiles.js';

// Development fixture only. No production API or marker code is replaced.
export function createMockShipsServer({ port = 8000, count = 20000, delay = 0 } = {}) {
  let settings = { count, delay, fail: false };
  let requests = [];
  const server = http.createServer(async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Content-Type', 'application/json');
    if (req.method === 'OPTIONS') { res.writeHead(204).end(); return; }
    const url = new URL(req.url, 'http://localhost');
    const json = (data, status = 200) => { res.writeHead(status); res.end(JSON.stringify(data)); };
    if (url.pathname === '/__mock/config' && req.method === 'POST') {
      let body = ''; for await (const chunk of req) body += chunk;
      settings = { ...settings, ...JSON.parse(body) }; requests = [];
      json(settings); return;
    }
    if (url.pathname === '/__mock/requests') { json(requests); return; }
    const match = url.pathname.match(/^\/mersad\/ship\/(\d+)\/(\d+)\/(\d+)\/tile$/);
    if (match) {
      const [, z, x, y] = match.map(Number);
      requests.push({ z, x, y, at: Date.now() });
      const config = { ...settings };
      await new Promise(resolve => setTimeout(resolve, config.delay));
      if (config.fail) { json({ error: 'Simulated ship API failure' }, 503); return; }
      // One deterministic global fleet; tile filtering returns stable IDs at all zooms.
      const types = ['General Cargo', 'Tanker', 'Passenger Ship'];
      const filters = url.searchParams.getAll('vessel_type');
      const [west, north] = tileToLngLat(z, x, y);
      const [east, south] = tileToLngLat(z, x + 1, y + 1);
      const ships = [];
      for (let id = 0; id < config.count; id++) {
        const lon = 121.05 + (id % 200 + 0.5) / 200 * 0.8;
        const lat = 30.94 + (Math.floor(id / 200) + 0.5) / Math.ceil(config.count / 200) * 0.6;
        const vessel_type = types[id % types.length];
        if (lon < west || lon >= east || lat <= south || lat > north) continue;
        if (filters.length && !filters.includes(vessel_type)) continue;
        ships.push({ id: id + 1, mmsi: 400000000 + id, name: `MOCK ${id + 1}`,
          lon, lat, vessel_type, color_code: ['#90ee90', '#FF3125', '#197AFF'][id % 3],
          loa: 100 + id % 200, width: 20 + id % 20,
          position: { heading: id % 360, cog: (id + 10) % 360,
            sog: id % 5 === 0 || id % 7 === 0 ? 0 : 10, navigation_status: id % 5 === 0 ? 1 : id % 7 === 0 ? 5 : 0 } });
      }
      json({ ships }); return;
    }
    if (/^\/mersad\/tile\/.*\/ports$/.test(url.pathname)) { json({ ports: [] }); return; }
    if (url.pathname === '/mersad/ships/total_count') { json(settings.count); return; }
    json({ error: 'Mock endpoint not implemented', path: url.pathname }, 404);
  });
  return { server, listen: () => new Promise(resolve => server.listen(port, '127.0.0.1', resolve)) };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const mock = createMockShipsServer({ count: Number(process.env.MOCK_SHIPS ?? 20000), delay: Number(process.env.MOCK_DELAY_MS ?? 0) });
  await mock.listen(); console.log('Mock ship API: http://localhost:8000 (synthetic data only)');
}
