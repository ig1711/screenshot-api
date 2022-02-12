import puppeteer from 'puppeteer';
import Fastify from 'fastify';

const fastify = Fastify();

fastify.get('/', async (request, reply) => {
  try {
    const browser = await puppeteer.launch({ args: ['--no-sandbox'] });
    const page = await browser.newPage();
    await page.setViewport({
      width: 1920,
      height: 1080,
      deviceScaleFactor: request.query?.size === 'small' ? 1/4 : 1,
    });
    await page.goto(request.query?.link || 'https://ryopaste.netlify.app');
    const img = await page.screenshot({ type: 'webp', quality: parseInt(request.query?.quality) || 100 });
    await page.close();
    await browser.close();
    reply.headers({ 'Content-Type': 'image/webp' });
    reply.send(img);
  } catch (e) {
    console.log({ t: Date.now(), e });
    reply.code(500);
    reply.send({ errorTimestamp: Date.now() });
  }
});

try {
  await fastify.listen(process.env.PORT || 3000, '0.0.0.0');
} catch (e) {
  fastify.log.error(err)
  process.exit(1);
}

