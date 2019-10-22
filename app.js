const express = require('express');
const fetch = require("node-fetch");
const {JsonRpc} = require('eosjs');

const {normalizePort, retry} = require('./tools/tools');

const config = require('./config/config');
const DbRequests = require('./db/db-requests');
const HayaRequests = require('./haya-api/haya-requests');
const PrometheusMetrics = require('./prometheus/prometheus-metrics');


new Promise(async () => {

    console.log("Haya-metrics-service is checking haya node...");

    const hayaRequests = new HayaRequests(new JsonRpc(
        config.hayaNodeUrl,
        {fetch}
    ));

    let hayaData = await retry(hayaRequests, hayaRequests.update, 1000);

    console.log("Haya-metrics-service connected to node, connecting to mongodb...");

    let mongoClient = await retry(
        null,
        require("mongodb"),
        1000,
        config.mongodbUrl,
        {useNewUrlParser: true, useUnifiedTopology: true}
    );

    if (!mongoClient.s.options.dbName)
        throw new Error("Please specify mongodb database name in the connection string");

    console.log("Haya-metrics-service is connected to mongoDB, getting mongoDB initial data...");

    const dbRequests = new DbRequests(mongoClient);
    let mongoData = await retry(dbRequests, dbRequests.update, 1000);

    console.log("Initial database data fetched, starting server...");

    const prometheusMetrics = new PrometheusMetrics({...mongoData, ...hayaData});

    const app = express();

    app.get('/', async function (req, res) {
        res.send({...mongoData, ...hayaData});
    });

    app.get('/metrics', async function (req, res) {
        res.send(prometheusMetrics.getMetrics());
    });

    let server = app.listen(normalizePort(process.env.PORT || '3000'), () => {

        const setUpdateDbTimeout = () => {
            setTimeout(async () => {
                mongoData = await retry(dbRequests, dbRequests.update);
                prometheusMetrics.updateData(mongoData);
                setUpdateDbTimeout();
            }, config.dbUpdatePeriod);
        };

        const setUpdateHayaTimeout = () => {
            setTimeout(async () => {
                hayaData = await retry(hayaRequests, hayaRequests.update);
                prometheusMetrics.updateData(hayaData);
                setUpdateHayaTimeout();
            }, config.hayaUpdatePeiod);
        };

        setUpdateDbTimeout();
        setUpdateHayaTimeout();

        console.log("Haya-metrics-service is listening at " + server.address().port + " port");
    });


}).catch(e => {
    console.error(e);
});
