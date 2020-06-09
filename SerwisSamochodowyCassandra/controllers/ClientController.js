const {v4: uuidv4} = require('uuid');
const {tableClient, tableClientColumns} = require('../constants');

const client = (db) => {

    return {
        getAllClients: async (req, res) => {
            try {
                const result = await db.execute(`SELECT * FROM ${tableClient};`);
                const clients = result.rows;
                res.render('pages/client', {clients});
            } catch (err) {
                console.error(err.message);
            }
        },
        getSingleClient: async (req, res) => {
            try {
                const id = req.params.id;
                const result = await db.execute(`SELECT * FROM ${tableClient} WHERE id = '${id}'`);
                const clientDetails = result.rows[0];
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
                await db.execute(`INSERT INTO ${tableClient} JSON '${JSON.stringify(client)}';`);
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
                const columns = tableClientColumns.split(",")
                    .map((item) => {
                        const substr = item.substring(1, item.indexOf(" ", 1));
                        const value = typeof client[substr] === "number" ? client[substr] : `'${client[substr]}'`;
                        return client[substr] ? substr + `=${value}` : "";
                    })
                    .filter((item) => item)
                    .join();
                const query = `UPDATE ${tableClient} SET ${columns} WHERE id = '${id}';`;
                db.execute(query);
                res.render('pages/success', {success: "Zaktualizowano dane o kliencie"});
            } catch (err) {
                console.error(err.message);
            }
        },
        deleteClient: async (req, res) => {
            try {
                const id = req.body.id;
                await db.execute(`DELETE FROM ${tableClient} WHERE id = '${id}';`);
                res.render('pages/success', {success: "Usunięto klienta"});
            } catch (err) {
                console.error(err.message);
            }
        }
    }
}

module.exports = client;