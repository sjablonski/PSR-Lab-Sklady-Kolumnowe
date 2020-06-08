const MongoClient = require('mongodb').MongoClient;

const user = "student01";
const password = "student01";
const host = "localhost";
const port = 27017;
const database = "database01";
const clientURI = `mongodb://${user}:${password}@${host}:${port}/${database}`;

const MongoClientInstance = {
    connect: () => {
        return MongoClient.connect(clientURI, {useUnifiedTopology: true})
            .then(client => client.db(database))
    }
}

module.exports = MongoClientInstance;

