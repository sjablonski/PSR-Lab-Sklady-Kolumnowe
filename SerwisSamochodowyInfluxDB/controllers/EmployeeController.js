const {v4: uuidv4} = require('uuid');
const {tableEmployee, tableVisit} = require('../constants');

const employee = (db) => {
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
        getAllEmployees: async (req, res) => {
            try {
                const result = await db.query(`SELECT * FROM ${tableEmployee};`);
                const employees = JSON.parse(JSON.stringify(result));
                res.render('pages/employee', {employees});
            } catch (err) {
                console.error(err.message);
            }
        },
        getSingleEmployee: async (req, res) => {
            try {
                const id = req.params.id;
                const result = await db.query(`SELECT * FROM ${tableEmployee} WHERE id = '${id}';`);
                const employee = JSON.parse(JSON.stringify(result[0]));
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
                    firstName: req.body.firstName,
                    lastName: req.body.lastName,
                };

                await db.writePoints([{
                    measurement: tableEmployee,
                    tags: {id: uuidv4().substr(0, 5)},
                    fields: employee
                }]);
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
                const result = await db.query(`SELECT * FROM ${tableVisit} WHERE employeeID = '${id}';`);
                const allEmployeeVisits = JSON.parse(JSON.stringify(result));


                await db.query(`DELETE FROM ${tableVisit} WHERE employeeID = '${id}';`);
                await db.query(`DELETE FROM ${tableEmployee} WHERE id = '${id}';`);
                await db.writePoints([{
                    measurement: tableEmployee,
                    tags: {id},
                    fields: employee
                }]);
                for (const item of allEmployeeVisits) {
                    item.employeeName = `${employee.firstName} ${employee.lastName}`;
                    const fields = filterObject(item);
                    await db.writePoints([{
                        measurement: tableVisit,
                        tags: {visitID: item.visitID, clientID: item.clientID, employeeID: item.employeeID},
                        fields
                    }]);
                }
                res.render('pages/success', {success: "Zaktualizowano dane o pracowniku"});
            } catch (err) {
                console.error(err.message);
            }
        },
        deleteEmployee: async (req, res) => {
            try {
                const id = req.body.id;
                await db.query(`DELETE FROM ${tableVisit} WHERE employeeID = '${id}';`);
                await db.query(`DELETE FROM ${tableEmployee} WHERE id = '${id}';`);
                res.render('pages/success', {success: "Usunięto pracownika"});
            } catch (err) {
                console.error(err.message);
            }
        }
    }
}

module.exports = employee;