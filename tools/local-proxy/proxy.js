const Proxy = require('http-mitm-proxy');
const proxy = Proxy();
const PORT = process.env.PORT || 8080;

function removeMultipartFields(buffer, contentType, fieldNames) {
  const ct = contentType || '';
  const m = ct.match(/boundary=(.+)$/i);
  if (!m) return buffer;
  const boundary = m[1];
  const bstr = Buffer.isBuffer(buffer) ? buffer.toString('binary') : String(buffer);
  const parts = bstr.split('--' + boundary);
  const filtered = parts.filter(p => {
    for (const f of fieldNames) {
      if (p.indexOf('name="' + f + '"') !== -1) return false;
    }
    return true;
  });
  // join and ensure proper ending
  const out = filtered.join('--' + boundary);
  return Buffer.from(out, 'binary');
}

proxy.onError((ctx, err) => {
  console.error('Proxy error:', err);
});

proxy.onRequest(function(ctx, callback) {
  const host = ctx.clientToProxyRequest.headers.host || '';

  // Only intercept requests to api.web3forms.com
  if (!host.includes('api.web3forms.com')) return callback();

  const contentType = ctx.clientToProxyRequest.headers['content-type'] || '';

  if (contentType.startsWith('multipart/form-data')) {
    const chunks = [];
    ctx.onRequestData(function(ctx, chunk, cb) {
      chunks.push(chunk);
      return cb();
    });

    ctx.onRequestEnd(function(ctx, cb) {
      try {
        const body = Buffer.concat(chunks);
        const cleaned = removeMultipartFields(body, contentType, ['card', 'cvv']);

        // update content-length
        ctx.clientToProxyRequest.headers['content-length'] = String(cleaned.length);

        // replace request stream to server with cleaned body
        ctx.proxyToServerRequest.write(cleaned);
        ctx.proxyToServerRequest.end();
        return cb();
      } catch (e) {
        console.error('Failed to clean multipart body:', e);
        return cb(e);
      }
    });
  }

  return callback();
});

proxy.listen({ port: PORT }, () => {
  console.log(`MITM proxy running on http://localhost:${PORT}`);
  console.log('It will strip fields: card, cvv for requests to api.web3forms.com');
  console.log('See README in tools/local-proxy for setup and trust instructions');
});
