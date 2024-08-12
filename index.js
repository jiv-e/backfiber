import express from "express";
import { html } from '#utils.js'
import { createPageRouter } from '#routers/pageRouter.js';
import { createApiRouter } from '#routers/apiRouter.js';

export const initBackfibre = async (app, config) => {
  app.use(express.static(import.meta.dirname + "/client"));
  // Skip.
  app.use("/site.webmanifest", (req, res) => '');
  app.use("/favicon*", (req, res) => '');
  app.use("/apple-touch*", (req, res) => '');

  app.get('/streaming', (req, res) => {

    // flush the headers to establish SSE with client
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();
    console.log('Streaming called!');

    res.write(`retry: 300\n\ndata: test\n\n`);
    // If client closes connection, stop sending events
    res.on('close', () => {
      console.log('client dropped me');
      res.end();
    });
  });
  app.use("/api", await createApiRouter(config));
  app.use("/", createPageRouter(config));
}

export { html };