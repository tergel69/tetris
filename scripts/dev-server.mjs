import { startServer } from 'next/dist/server/lib/start-server.js';

const dir = process.cwd();
const port = Number(process.env.PORT || 3002);
const hostname = process.env.HOSTNAME || '127.0.0.1';

async function main() {
  await startServer({
    dir,
    port,
    isDev: true,
    hostname,
    allowRetry: true,
    keepAliveTimeout: undefined,
    minimalMode: false,
    quiet: false,
  });
}

main().catch(error => {
  console.error(error);
  process.exit(1);
});
