const {v4: uuidv4} = require('uuid');
const {tableEmployee, tableEmployeeColumns} = require('../constants');

const employee = (db) => {
    return {
        getAllEmployees: async (req, res) => {
            try {
                const result = await db.execute(`SELECT * FROM ${tableEmployee};`);
                const employees = result.rows;
                res.render('pages/employee', {employees});
            } catch (err) {
                console.error(err.message);
            }
        },
        getSingleEmployee: async (req, res) => {
            try {
                const id = req.params.id;
                const result = await db.execute(`SELECT * FROM ${tableEmployee} WHERE id = '${id}';`);
                const employee = result.rows[0];
                res.render('pages/employee-id', {employee});
            } catch (err) {
                console.error(err.message);
            }
        },
        addEmployeeGet: (req, res) => {
            try {
                res.render('pages/employee-new');
            } catch (err) {
                console.error(err.message);
            }
        },
        addEmployeePost: async (req, res) => {
            try {
                const employee = {
                    id: uuidv4().substr(0, 5),
                    firstName: req.body.firstName,
                    lastName: req.body.lastName,
                };
                await db.execute(`INSERT INTO ${tableEmployee} JSON '${JSON.stringify(employee)}';`);
                res.render('pages/success', {success: "Dodano pracownika"});
            } catch (err) {
                console.error(err.message);
            }
        },
        updateEmployee: async (req, res) => {
            try {
                const id = req.body.id;
                const employee = {
                    firstName: req.body.firstName,
                    lastName: req.body.lastName,
                };
                const columns = tableEmployeeColumns.split(",")
                    .map((item) => {
                        const substr = item.substring(1, item.indexOf(" ", 1));
                        const value = typeof employee[substr] === "number" ? employee[substr] : `'${employee[substr]}'`;
                        return employee[substr] ? substr + `=${value}` : "";
                    })
                    .filter((item) => item)
                    .join();
                const query = `UPDATE ${tableEmployee} SET ${columns} WHERE id = '${id}';`;
                db.execute(query);
                res.render('pages/success', {success: "Zaktualizowano dane o pracowniku"});
            } catch (err) {
                console.error(err.message);
            }
        },
        deleteEmployee: async (req, res) => {
            try {
                const id = req.body.id;
                await db.execute(`DELETE FROM ${tableEmployee} WHERE id = '${id}';`);
                res.render('pages/success', {success: "Usunięto pracownika"});
            } catch (err) {
                console.error(err.message);
            }
        }
    }
}

module.exports = employee;