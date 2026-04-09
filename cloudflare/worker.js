export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === '/media/0_Business_Meeting_3840x2160.mp4') {
      const object = await env.MEDIA_BUCKET.get('0_Business_Meeting_3840x2160.mp4');

      if (!object) {
        return new Response('Not found', { status: 404 });
      }

      const headers = new Headers();
      object.writeHttpMetadata(headers);
      headers.set('content-type', 'video/mp4');
      headers.set('cache-control', 'public, max-age=604800, immutable');
      headers.set('etag', object.httpEtag);

      return new Response(request.method === 'HEAD' ? null : object.body, {
        headers,
      });
    }

    return env.ASSETS.fetch(request);
  },
};