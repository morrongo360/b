const { counter, gauge } = require('./custom-metrics'); // Importamos las métricas del fichero custom-metrics.js

const getRandom = (start, end) => Math.floor((Math.random() * end) + start);

const randomBatchProcess = () => {
  const jobs = getRandom(50, 500); // Jobs generados
  const failed = getRandom(1, 50); // Jobs fallidos
  const processed = jobs - failed; // Restamos a los generados los fallidos
  return { jobs, failed, processed };
};

module.exports.batch = () => {
  const intervalId = setInterval(() => {
    const { active, failed, processed } = randomBatchProcess();
    //console.log(active, failed, processed);
    counter.labels('200').inc(processed); // Valor 200 por ok. Incrementa por cada job procesado
    counter.labels('500').inc(failed); // Valor 500 por error. Incrementa por cada job fallado
    gauge.set(active); // Gauge ve cada 5 segundos los que hay activos
  }, 5_000); // Se va a ejecutar cada 5 segundos

  return intervalId;
};