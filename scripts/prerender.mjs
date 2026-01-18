import Prerenderer from '@prerenderer/prerenderer';
import PuppeteerRenderer from '@prerenderer/renderer-puppeteer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs/promises';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distPath = path.resolve(__dirname, '../dist');

const routes = [
  '/',
  '/appartamenti',
  '/preventivo',
  '/contatti',
  '/chi-siamo',
  '/privacy-policy',
  '/cookie-policy',
];

async function prerender() {
  console.log('🚀 Starting prerender...');

  const prerenderer = new Prerenderer({
    staticDir: distPath,
    renderer: new PuppeteerRenderer({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
      // Process one route at a time to avoid Helmet state conflicts
      maxConcurrentRoutes: 1,
      // Wait for lazy components + Helmet DOM updates
      renderAfterTime: 6000,
      timeout: 90000,
    }),
  });

  try {
    await prerenderer.initialize();

    const renderedRoutes = await prerenderer.renderRoutes(routes);

    for (const route of renderedRoutes) {
      const outputDir = path.join(distPath, route.route);
      const outputFile = route.route === '/'
        ? path.join(distPath, 'index.html')
        : path.join(outputDir, 'index.html');

      // Create directory if needed
      if (route.route !== '/') {
        await fs.mkdir(outputDir, { recursive: true });
      }

      // Write the pre-rendered HTML
      await fs.writeFile(outputFile, route.html);
      console.log(`✅ Rendered: ${route.route}`);
    }

    // Create 200.html for SPA fallback
    const indexHtml = await fs.readFile(path.join(distPath, 'index.html'), 'utf-8');
    await fs.writeFile(path.join(distPath, '200.html'), indexHtml);
    console.log('✅ Created 200.html fallback');

    console.log('🎉 Prerender complete!');
  } catch (error) {
    console.error('❌ Prerender failed:', error);
    process.exit(1);
  } finally {
    await prerenderer.destroy();
  }
}

prerender();
