let serverApp;

export default async function handler(req, res) {
  if (!serverApp) {
    const { app } = await import('../dist/simulae-financiamento/server/server.mjs');
    serverApp = app();
  }
  serverApp(req, res);
}
