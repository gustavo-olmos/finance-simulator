// Import estático do sharp: faz o tracing da Vercel incluir os binários nativos
// na function (o server.mjs o trata como dependência externa, fora do bundle).
import 'sharp';

let serverApp;

export default async function handler(req, res) {
  if (!serverApp) {
    const { app } = await import('../dist/simulae-financiamento/server/server.mjs');
    serverApp = app();
  }
  serverApp(req, res);
}
