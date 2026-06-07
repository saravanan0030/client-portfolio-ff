const fs = require('fs');
const path = require('path');

const backendUrl = (process.env.BACKEND_URL || '').replace(/\/$/, '');
const frontendDir = path.join(__dirname, '..', 'frontend');
const redirectsPath = path.join(frontendDir, '_redirects');
const configPath = path.join(frontendDir, 'config.js');

if (!backendUrl) {
  console.warn(
    'BACKEND_URL is not set. Deploy will work for static pages only.\n' +
    'Add BACKEND_URL in Netlify env vars (your Render/Railway API URL).'
  );
  fs.writeFileSync(redirectsPath, '# Set BACKEND_URL in Netlify to enable API proxy\n');
  fs.writeFileSync(
    configPath,
    'window.APP_CONFIG = { apiBase: "", uploadBase: "" };\n'
  );
  process.exit(0);
}

const redirects = [
  `/api/*  ${backendUrl}/api/:splat  200`,
  `/assets/uploads/*  ${backendUrl}/assets/uploads/:splat  200`,
].join('\n');

fs.writeFileSync(redirectsPath, redirects + '\n');
fs.writeFileSync(
  configPath,
  `window.APP_CONFIG = {
  apiBase: "${backendUrl}",
  uploadBase: "${backendUrl}"
};\n`
);

console.log('Netlify build OK — proxying API and uploads to:', backendUrl);
