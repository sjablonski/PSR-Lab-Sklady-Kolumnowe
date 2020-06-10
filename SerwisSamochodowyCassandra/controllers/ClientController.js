const {v4: uuidv4} = require('uuid');
const cassandra = require('cassandra-driver');
const keysToCamelCase = require('../utils/keysUnderscoreToCamelCase');
const {keyspace, tableClient, tableVisit, tableClientVisits, tableEmployeeVisits} = require('../constants');

const client = (db) => {
    const Mapper = cassandra.mapping.Mapper;
    const mapper = new Mapper(db, {
        models: {
            'Client': {
                tables: ['client'],
                keyspace,
                mappings: new cassandra.mapping.UnderscoreCqlToCamelCaseMappings()
            }
        }
    });
    const clientMapper = mapper.forModel('Client');

    return {
        getAllClients: async (req, res) => {
            try {
                const result = await db.execute(`SELECT * FROM ${tableClient};`);
                const clients = keysToCamelCase(result.rows);
                res.render('pages/client', {clients});
            } catch (err) {
                console.error(err.message);
            }
        },
        getSingleClient: async (req, res) => {
            try {
                const id = req.params.id;
                const result = await clientMapper.find({id});
                const clientDetails = result.first();
                res.render('pages/client-id', {clientDetails});
            } catch (err) {
                console.error(err.message);
            }
        },
        addClientGet: async (req, res) => {
            try {
                res.render('pages/client-new');
            } catch (err) {
                console.error(err.message);
            }
        },
        addClientPost: async (req, res) => {
            try {
                const client = {
                    id: uuidv4().substr(0, 5),
                    firstName: req.body.firstName,
                    lastName: req.body.lastName,
                    phone: req.body.phone,
                    email: req.body.email,
                };
                await clientMapper.insert(client);
                res.render('pages/success', {success: "Dodano klienta"});
            } catch (err) {
                console.error(err.message);
            }
        },
        updateClient: async (req, res) => {
            try {
                const client = {
                    id: req.body.id,
                    clientId: req.body.id,
                    firstName: req.body.firstName,
                    lastName: req.body.lastName,
                    phone: req.body.phone,
                    email: req.body.email,
                    clientName: `${req.body.firstName} ${req.body.lastName}`
                };
                const clientName = `${client.firstName} ${client.lastName}`;

                await clientMapper.update(client);

                const result = await db.execute(`SELECT * FROM ${tableClientVisits} WHERE client_id = '${client.id}';`);
                for (const row of result.rows) {
                    await db.execute(`UPDATE ${tableClientVisits} SET client_name = '${clientName}' WHERE client_id = '${client.id}' AND visit_id = '${row.visit_id}';`);
                    const resultVisits = await db.execute(`SELECT * FROM ${tableVisit} WHERE visit_id = '${row.visit_id}';`);
                    for(const rowVisits of resultVisits.rows) {
                        await db.execute(`UPDATE ${tableVisit} SET client_name = '${clientName}' WHERE visit_id = '${rowVisits.visit_id}';`);
                    }
                    const resultEmpVisits = await db.execute(`SELECT * FROM ${tableEmployeeVisits} WHERE employee_id = '${row.employee_id}';`);
                    for(const rowClientVisits of resultEmpVisits.rows) {
                        await db.execute(`UPDATE ${tableEmployeeVisits} SET client_name = '${clientName}' WHERE employee_id = '${rowClientVisits.employee_id}' AND visit_id = '${row.visit_id}';`);
                    }
                }

                res.render('pages/success', {success: "Zaktualizowano dane o kliencie"});
            } catch (err) {
                console.error(err.message);
            }
        },
        deleteClient: async (req, res) => {
            try {
                const id = req.body.id;

                const result = await db.execute(`SELECT * FROM ${tableClientVisits} WHERE client_id = '${id}';`);
                for (const row of result.rows) {
                    await db.execute(`DELETE FROM ${tableClientVisits} WHERE client_id = '${id}' AND visit_id = '${row.visit_id}';`);
                    const resultVisits = await db.execute(`SELECT * FROM ${tableVisit} WHERE visit_id = '${row.visit_id}';`);
                    for(const rowVisits of resultVisits.rows) {
                        await db.execute(`DELETE FROM ${tableVisit} WHERE visit_id = '${rowVisits.visit_id}';`);
                    }
                    const resultEmpVisits = await db.execute(`SELECT * FROM ${tableEmployeeVisits} WHERE employee_id = '${row.employee_id}';`);
                    for(const rowClientVisits of resultEmpVisits.rows) {
                        await db.execute(`DELETE FROM ${tableEmployeeVisits} WHERE employee_id = '${rowClientVisits.employee_id}' AND visit_id = '${row.visit_id}';`);
                    }
                }

                await clientMapper.remove({id})
                res.render('pages/success', {success: "Usunięto klienta"});
            } catch (err) {
                console.error(err.message);
            }
        }
    }
}

module.exports = client;