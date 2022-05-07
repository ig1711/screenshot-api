import puppeteer from 'puppeteer';
import Fastify from 'fastify';

const fastify = Fastify();

let cache = [];
let pending = [];
let browser;
let page;

const waitFor = url => new Promise(resolve => {
  const interval = setInterval(() => {
    if (!pending.includes(url)) {
      clearInterval(interval);
      resolve();
    }
  }, 500);
});

try {
  browser = await puppeteer.launch({ args: ['--no-sandbox'] });
} catch (e) {
  console.log(e);
  process.exit(1);
}

const types = {
  png: 'png',
  webp: 'webp',
};

fastify.get('/', async (request, reply) => {
  if (!request.query?.link || !request.query?.link?.match(/\b\w+:\/\//)) {
    const t = Date.now();
    console.log({ t, reason: 'no protocol' });
    reply.code(400);
    return reply.send({ errorTimestamp: t, reason: 'Protocol needed for the link' });
  }
  if (pending.includes(request.query?.link)) await waitFor(request.query?.link);
  if (cache.some(c => c.link === request.query?.link)) {
    const c = cache.find(f => f.link === request.query?.link);
    if (!c) {
      const t = Date.now();
      console.log({ t, e: 'maybe cache got deleted' });
      reply.code(500);
      return reply.send({ errorTimestamp: t });
    }
    reply.headers({ 'Content-Type': `image/${c?.type}` });
    return reply.send(c?.img);
  }
  try {
    pending = [...pending, request.query?.link];
    page = await browser.newPage();
    await page.setViewport({
      width: 1920,
      height: 1080,
      deviceScaleFactor: request.query?.size === 'small' ? 1/4 : 1,
    });
    await page.goto(request.query?.link || 'https://ryopaste.netlify.app', { waitUntil: 'networkidle2' });
    const type = types[request.query?.type] || 'webp';
    const q = parseInt(request.query.quality);
    const img = await page.screenshot({ type, quality: type === 'png' ? null : (q < 0 || q > 100) ? 100 : q, fullPage: request.query?.fp ? true : false });
    await page.close();
    cache = cache.filter((_f, i) => i < 3);
    cache = [{ link: request.query?.link, img, type }, ...cache];
    pending = pending.filter(f => f !== request.query?.link);
    reply.headers({ 'Content-Type': `image/${type}` });
    reply.send(img);
  } catch (e) {
    page && !page.isClosed() && await page.close().catch(() => console.log('could not close the page'));
    const t = Date.now();
    console.log({ t, e });
    reply.code(500);
    reply.send({ errorTimestamp: t });
  }
});

fastify.get('/clearcache', (_request, reply) => {
  cache = [];
  reply.send('done');
});

try {
  await fastify.listen(process.env.PORT || 3000, '0.0.0.0');
} catch (e) {
  fastify.log.error(e)
  process.exit(1);
}

process.on('SIGTERM', async () => {
  await browser.close();
  process.exit(0);
});

