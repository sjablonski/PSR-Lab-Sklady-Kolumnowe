const express = require('express');
const methodOverride = require('method-override');
const Influx = require('influx');
const routes = require('./routes');
const {connectOptions, database} = require('./constants');

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

const influx = new Influx.InfluxDB(connectOptions);

influx.getDatabaseNames()
    .then(names => {
        if (!names.includes(database)) {
            return influx.createDatabase(database);
        }
    })
    .then(() => {
        routes(app, influx);
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
        await influx.dropDatabase(database);
        process.exit();
    } catch (err) {
        console.error(err.message);
    }
});