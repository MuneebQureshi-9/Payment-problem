Local MITM proxy for testing Web3Forms submissions

What this does
- Runs a local HTTP(S) MITM proxy that intercepts requests to api.web3forms.com and removes `card` and `cvv` fields from multipart/form-data submissions. This lets you test the frontend as-is (no code changes) while avoiding Web3Forms "security reasons" rejections caused by sending raw card/CVV.

Requirements
- Node.js (14+)
- You must configure your browser or system to use the proxy (see below)
- To avoid TLS certificate warnings you must install the proxy CA cert into your OS/browser trust store. The proxy will generate a CA on first run and print its path.

Quick start
1. Open a terminal and install dependencies:

```bash
cd tools/local-proxy
npm install
```

2. Start the proxy:

```bash
npm start
# or
node proxy.js
```

3. Configure your browser/system to use HTTP proxy at `localhost:8080` (or set `PORT` env var to change).

4. Import the generated CA certificate into your OS/browser trust store. On first run the proxy will generate a root CA under your user profile (e.g. `~/.http-mitm-proxy/` or similar) — locate the `certs` folder and import the `ca.crt` file.

Notes and security
- This tool is intended for local development and debugging only. Do NOT use it on public networks or with real card data.
- Once proxy is active and trusted, open your app and submit — the proxy will forward the request to Web3Forms but with `card` and `cvv` removed.

If you prefer not to install the CA, you can run a local HTTP-only proxy and point the site to http://api.web3forms.com, but because the form uses HTTPS by default this will typically require frontend changes.
