const express = require('express');
const methodOverride = require('method-override');
const cassandra = require('cassandra-driver');
const routes = require('./routes');
const {
    keyspace,
    createKeyspace,
    createCar,
    createClient,
    createEmployee,
    createVisit,
    createClientVisits,
    createEmployeeVisits
} = require('./constants');

const app = express();

app.use(express.urlencoded({extended: true}))
app.use(methodOverride(function (req, res) {
    if (req.body && typeof req.body === 'object' && '_method' in req.body) {
        const method = req.body._method
        delete req.body._method
        return method
    }
}));
app.set('view engine', 'ejs');

const client = new cassandra.Client({contactPoints: ['127.0.0.1'], localDataCenter: 'datacenter1'});

client.connect()
    .then(() => {
        return client.execute(`${createKeyspace}`);
    })
    .then(() => {
        return client.execute(`${createCar}`);
    })
    .then(() => {
        return client.execute(`${createClient}`);
    })
    .then(() => {
        return client.execute(`${createEmployee}`);
    })
    .then(() => {
        return client.execute(`${createVisit}`);
    })
    .then(() => {
        return client.execute(`${createClientVisits}`);
    })
    .then(() => {
        return client.execute(`${createEmployeeVisits}`);
    })
    .then(() => {
        routes(app, client);
        const server = app.listen(3001, function () {
            const host = server.address().address;
            const port = server.address().port;

            console.log("App listening at http://%s:%s", host, port)
        });
    })
    .catch(err => {
        console.error(err.message);
    });

process.on('SIGINT', async () => {
    try {
        await client.execute(`DROP KEYSPACE IF EXISTS ${keyspace};`);
        process.exit();
    } catch (err) {
        console.error(err.message);
    }
});