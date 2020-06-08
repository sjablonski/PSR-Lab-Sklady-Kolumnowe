const express = require('express');
const methodOverride = require('method-override');
const cassandra = require('cassandra-driver');
const routes = require('./routes');

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
        const query = "CREATE KEYSPACE IF NOT EXISTS carservice WITH replication =" +
            "{'class': 'SimpleStrategy', 'replication_factor': '1' }";
        return client.execute(query);
    })
    .then(() => {
        const createEmployeeTable = "CREATE TABLE IF NOT EXISTS carservice.employee"
        const createClientTable = "CREATE TABLE IF NOT EXISTS carservice.client" +
            " ()";
        return client.execute(query);
    })
    .then(() => {
        return client.metadata.getTable('carservice', 'client');
    })
    .then((table) => {
        console.log('Table information');
        console.log('- Name: %s', table.name);
        console.log('- Columns:', table.columns);
        console.log('- Partition keys:', table.partitionKeys);
        console.log('- Clustering keys:', table.clusteringKeys);
    })
    .then(() => {
        routes(app, client);
        const server = app.listen(3001, function () {
            const host = server.address().address;
            const port = server.address().port;

            console.log("App listening at http://%s:%s", host, port)
        });
    });