// Sends the workers.dev address to the real domain. Everything else is the static site.
// Cloudflare runs this only for the home page and for paths that have no file (see wrangler.jsonc).
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.hostname.endsWith('.workers.dev')) {
      return Response.redirect('https://freeplayinc.org' + url.pathname + url.search, 301);
    }
    return env.ASSETS.fetch(request);
  }
};
