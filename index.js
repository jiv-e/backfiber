import express from "express";
import { html } from '#utils.js'
import fs from 'fs';
import path from 'path';
import { createPageRouter } from '#routers/pageRouter.js';
import { createApiRouter } from '#routers/apiRouter.js';

let backfiberConfig = {
  sourceFolder: '/src',
  routes: [],
  componentFolder: "/components",
  styles: ""
};

const initBackfiber = async (app, config) => {
  backfiberConfig = config;
  app.use(express.static(import.meta.dirname + "/client"));
  config.assetFolders.forEach(folder => {
    app.use(express.static(process.env.INIT_CWD + folder));
  });

  app.get('/reloader', (req, res) => {

    // flush the headers to establish SSE with client
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();

    res.write(`retry: 300\n\ndata: \n\n`);
    // If client closes connection, stop sending events
    res.on('close', () => {
      console.log('Reloader: Connection to client lost.');
      res.end();
    });
  });
  app.use("/api", await createApiRouter(config));
  app.use("/", createPageRouter(config));
}

const generateStaticSite = async ({ host, config }) => {
  const outputDir = process.env.INIT_CWD + '/static'; // Directory to save the static files
  if (fs.existsSync(outputDir)) {
    fs.rmSync(outputDir, { recursive: true, force: true });
  }
  fs.mkdirSync(outputDir);
  // Copy assets.
  config.assetFolders.forEach(folder => {
    fs.cpSync(process.env.INIT_CWD + folder, outputDir, { recursive: true });
  });
  for (const routePath of config.routes.map(route => route.path)) {
    const url = `${host}${routePath}`;
    const folderPath = path.join(outputDir, routePath);
    const filePath = path.join(outputDir, routePath === '/' ? 'index.html' : `${routePath}/index.html`);

    try {
      const response = await fetch(url);
      fs.mkdirSync(folderPath, { recursive: true })
      fs.writeFileSync(filePath, await response.text());
      console.log(`Generated static file: ${filePath}`);
    } catch (error) {
      console.error(`Error generating static file for route ${routePath}:`, error);
    }
  }
};

export { html, initBackfiber, generateStaticSite };