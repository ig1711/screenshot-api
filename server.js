import puppeteer from 'puppeteer';
import Fastify from 'fastify';

const fastify = Fastify();

let cache = [];

let browser;

try {
  browser = await puppeteer.launch({ args: ['--no-sandbox'] });
} catch (e) {
  console.log(e);
  process.exit(1);
}

fastify.get('/', async (request, reply) => {
  if (cache.some(c => c.link === request.query?.link)) {
    const c = cache.find(f => f.link === request.query?.link);
    if (!c) {
      const t = Date.now();
      console.log({ t, e: 'maybe cache got deleted' });
      reply.code(500);
      return reply.send({ errorTimestamp: t });
    }
    reply.headers({ 'Content-Type': 'image/webp' });
    return reply.send(c?.img);
  }
  try {
    const page = await browser.newPage();
    await page.setViewport({
      width: 1920,
      height: 1080,
      deviceScaleFactor: request.query?.size === 'small' ? 1/4 : 1,
    });
    await page.goto(request.query?.link || 'https://ryopaste.netlify.app');
    const img = await page.screenshot({ type: 'webp', quality: parseInt(request.query?.quality) || 100 });
    await page.close();
    cache = cache.filter((_f, i) => i < 10);
    cache = [{ link: request.query?.link, img }, ...cache];
    reply.headers({ 'Content-Type': 'image/webp' });
    reply.send(img);
  } catch (e) {
    const t = Date.now();
    console.log({ t, e });
    reply.code(500);
    reply.send({ errorTimestamp: t });
  }
});

try {
  await fastify.listen(process.env.PORT || 3000, '0.0.0.0');
} catch (e) {
  fastify.log.error(err)
  process.exit(1);
}

process.on('SIGTERM', async () => {
  await browser.close();
  process.exit(0);
});

