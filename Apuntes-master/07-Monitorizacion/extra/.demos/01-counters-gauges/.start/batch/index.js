const express = require('express');
const promClient = require('prom-client');
const { port } = require('./config');
const { batch } = require('./batch');

const { register, collectDefaultMetrics } = promClient // Nos traemos dos librerías de prom-client
collectDefaultMetrics({ prefix: 'default_' })  // Decimos como coger las métricas por defecto
const intervalId = batch();
const app = express();

app.get('/metrics', async (_, res) => {
  try {
    // Recogemos las métricas
    res.set('Content-Type', register.contentType);
    res.end(await register.metrics());
  } catch (ex) {
    res.status(500).end(ex);
  }
});

app.post('/stop', (_, res) => {
  clearInterval(intervalId);
  res.send('batch process stopped');
});

app.listen(port, () => {
  console.log(`Listening at ${port}`);
});
