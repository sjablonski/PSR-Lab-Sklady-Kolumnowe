const express = require('express');
const methodOverride = require('method-override');
const cassandra = require('cassandra-driver');
const routes = require('./routes');
const {
    TYPE,
    TABLE,
    keyspace,
    typeClient,
    typeEmployee,
    typeCar,
    typeClientColumns,
    typeEmployeeColumns,
    typeCarColumns,
    tableVisit,
    tableClient,
    tableEmployee,
    tableVisitColumns,
    tableClientColumns,
    tableEmployeeColumns
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

function create(type, name, columns) {
    const query = `CREATE ${type} IF NOT EXISTS ${name} (${columns})`;
    return client.execute(query);
}

client.connect()
    .then(() => {
        const query = `CREATE KEYSPACE IF NOT EXISTS ${keyspace} WITH replication =` +
            "{'class': 'SimpleStrategy', 'replication_factor': '1' }";
        return client.execute(query);
    })
    .then(() => {
        return create(TYPE, typeClient, typeClientColumns);
    })
    .then(() => {
        return create(TYPE, typeEmployee, typeEmployeeColumns);
    })
    .then(() => {
        return create(TYPE, typeCar, typeCarColumns);
    })
    .then(() => {
        return create(TABLE, tableVisit, tableVisitColumns);
    })
    .then(() => {
        return create(TABLE, tableClient, tableClientColumns);
    })
    .then(() => {
        return create(TABLE, tableEmployee, tableEmployeeColumns);
    })
    .then(() => {
        routes(app, client);
        const server = app.listen(3001, function () {
            const host = server.address().address;
            const port = server.address().port;

            console.log("App listening at http://%s:%s", host, port)
        });
    });

process.on('SIGINT', async () => {
    try {
        await client.execute(`DROP TABLE IF EXISTS ${tableVisit};`);
        await client.execute(`DROP TABLE IF EXISTS ${tableClient};`);
        await client.execute(`DROP TABLE IF EXISTS ${tableEmployee};`);
        await client.execute(`DROP TYPE IF EXISTS ${typeClient};`);
        await client.execute(`DROP TYPE IF EXISTS ${typeEmployee};`);
        await client.execute(`DROP TYPE IF EXISTS ${typeCar};`);
        await client.execute(`DROP KEYSPACE IF EXISTS ${keyspace};`);
        process.exit();
    } catch (err) {
        console.error(err.message);
    }
});