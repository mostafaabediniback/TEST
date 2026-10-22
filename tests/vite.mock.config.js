import { mergeConfig } from 'vite';
import original from '../vite.config.js';

// Instrumentation exists only when this test config is explicitly selected.
export default mergeConfig(original, {
  plugins: [{
    name: 'ship-browser-test-instrumentation', enforce: 'pre',
    transform(code, id) {
      if (!id.endsWith('/src/components/map/WorldMap.jsx')) return;
      return code.replace('map.addControl(overlay);', `
        window.__shipTest = { map, overlay, updates: [], loadedAt: null };
        map.once('load', () => { window.__shipTest.loadedAt = performance.now(); });
        const originalSetProps = overlay.setProps.bind(overlay);
        overlay.setProps = (props) => {
          if (props.layers) {
            window.__shipTest.layers = props.layers;
            window.__shipTest.updates.push({ at: performance.now(), count: Math.max(0, ...props.layers.map(layer => layer.props.data?.length ?? 0)) });
          }
          return originalSetProps(props);
        };
        map.addControl(overlay);
      `);
    },
  }],
});
