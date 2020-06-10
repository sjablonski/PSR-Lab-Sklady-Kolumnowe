const {v4: uuidv4} = require('uuid');
const {tableClient, tableVisit} = require('../constants');

const client = (db) => {
    const filterObject = (obj) => {
        const allowed = ['clientID', 'employeeID', 'visitID', 'time'];
        return Object.keys(obj)
            .filter(key => !allowed.includes(key))
            .reduce((newObj, key) => {
                newObj[key] = obj[key];
                return newObj;
            }, {});
    }

    return {
        getAllClients: async (req, res) => {
            try {
                const result = await db.query(`SELECT * FROM ${tableClient};`);
                const clients = JSON.parse(JSON.stringify(result));
                res.render('pages/client', {clients});
            } catch (err) {
                console.error(err.message);
            }
        },
        getSingleClient: async (req, res) => {
            try {
                const id = req.params.id;
                const result = await db.query(`SELECT * FROM ${tableClient} WHERE id = '${id}'`);
                const clientDetails = JSON.parse(JSON.stringify(result[0]));
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
                    firstName: req.body.firstName,
                    lastName: req.body.lastName,
                    phone: req.body.phone,
                    email: req.body.email,
                };
                await db.writePoints([{
                    measurement: tableClient,
                    tags: {id: uuidv4().substr(0, 5)},
                    fields: client
                }]);
                res.render('pages/success', {success: "Dodano klienta"});
            } catch (err) {
                console.error(err.message);
            }
        },
        updateClient: async (req, res) => {
            try {
                const id = req.body.id;
                const client = {
                    firstName: req.body.firstName,
                    lastName: req.body.lastName,
                    phone: req.body.phone,
                    email: req.body.email,
                };
                const result = await db.query(`SELECT * FROM ${tableVisit} WHERE clientID = '${id}';`);
                const allClientVisits = JSON.parse(JSON.stringify(result));

                await db.query(`DELETE FROM ${tableVisit} WHERE clientID = '${id}';`);
                await db.query(`DELETE FROM ${tableClient} WHERE id = '${id}';`);
                await db.writePoints([{
                    measurement: tableClient,
                    tags: {id},
                    fields: client
                }]);
                for (const item of allClientVisits) {
                    item.clientName = `${client.firstName} ${client.lastName}`;
                    const fields = filterObject(item);
                    await db.writePoints([{
                        measurement: tableVisit,
                        tags: {visitID: item.visitID, clientID: item.clientID, employeeID: item.employeeID},
                        fields
                    }]);
                }
                res.render('pages/success', {success: "Zaktualizowano dane o kliencie"});
            } catch (err) {
                console.error(err.message);
            }
        },
        deleteClient: async (req, res) => {
            try {
                const id = req.body.id;
                await db.query(`DELETE FROM ${tableVisit} WHERE clientID = '${id}';`);
                await db.query(`DELETE FROM ${tableClient} WHERE id = '${id}';`);
                res.render('pages/success', {success: "Usunięto klienta"});
            } catch (err) {
                console.error(err.message);
            }
        }
    }
}

module.exports = client;