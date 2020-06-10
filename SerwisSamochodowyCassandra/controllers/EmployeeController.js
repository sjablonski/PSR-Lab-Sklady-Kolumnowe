const {v4: uuidv4} = require('uuid');
const cassandra = require('cassandra-driver');
const keysToCamelCase = require('../utils/keysUnderscoreToCamelCase');
const {keyspace, tableEmployee, tableVisit, tableClientVisits, tableEmployeeVisits} = require('../constants');

const employee = (db) => {
    const Mapper = cassandra.mapping.Mapper;
    const mapper = new Mapper(db, {
        models: {
            'Employee': {
                tables: ['employee'],
                keyspace,
                mappings: new cassandra.mapping.UnderscoreCqlToCamelCaseMappings()
            }
        }
    });
    const employeeMapper = mapper.forModel('Employee');

    return {
        getAllEmployees: async (req, res) => {
            try {
                const result = await db.execute(`SELECT * FROM ${tableEmployee};`);
                const employees = keysToCamelCase(result.rows);
                res.render('pages/employee', {employees});
            } catch (err) {
                console.error(err.message);
            }
        },
        getSingleEmployee: async (req, res) => {
            try {
                const id = req.params.id;
                const result = await employeeMapper.find({id});
                const employee = result.first();
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
                await employeeMapper.insert(employee);
                res.render('pages/success', {success: "Dodano pracownika"});
            } catch (err) {
                console.error(err.message);
            }
        },
        updateEmployee: async (req, res) => {
            try {
                const employee = {
                    id: req.body.id,
                    firstName: req.body.firstName,
                    lastName: req.body.lastName,
                };
                const employeeName = `${employee.firstName} ${employee.lastName}`;

                await employeeMapper.update(employee);

                const result = await db.execute(`SELECT * FROM ${tableEmployeeVisits} WHERE employee_id = '${employee.id}';`);
                for (const row of result.rows) {
                    await db.execute(`UPDATE ${tableEmployeeVisits} SET employee_name = '${employeeName}' WHERE employee_id = '${employee.id}' AND visit_id = '${row.visit_id}';`);
                    const resultVisits = await db.execute(`SELECT * FROM ${tableVisit} WHERE visit_id = '${row.visit_id}';`);
                    for(const rowVisits of resultVisits.rows) {
                        await db.execute(`UPDATE ${tableVisit} SET employee_name = '${employeeName}' WHERE visit_id = '${rowVisits.visit_id}';`);
                    }
                    const resultClientVisits = await db.execute(`SELECT * FROM ${tableClientVisits} WHERE client_id = '${row.client_id}';`);
                    for(const rowClientVisits of resultClientVisits.rows) {
                        await db.execute(`UPDATE ${tableClientVisits} SET employee_name = '${employeeName}' WHERE client_id = '${rowClientVisits.client_id}' AND visit_id = '${row.visit_id}';`);
                    }
                }
                res.render('pages/success', {success: "Zaktualizowano dane o pracowniku"});
            } catch (err) {
                console.error(err.message);
            }
        },
        deleteEmployee: async (req, res) => {
            try {
                const id = req.body.id;
                const result = await db.execute(`SELECT * FROM ${tableEmployeeVisits} WHERE employee_id = '${id}';`);
                for (const row of result.rows) {
                    await db.execute(`DELETE FROM ${tableEmployeeVisits} WHERE employee_id = '${id}' AND visit_id = '${row.visit_id}';`);
                    const resultVisits = await db.execute(`SELECT * FROM ${tableVisit} WHERE visit_id = '${row.visit_id}';`);
                    for(const rowVisits of resultVisits.rows) {
                        await db.execute(`DELETE FROM ${tableVisit} WHERE visit_id = '${rowVisits.visit_id}';`);
                    }
                    const resultClientVisits = await db.execute(`SELECT * FROM ${tableClientVisits} WHERE client_id = '${row.client_id}';`);
                    for(const rowClientVisits of resultClientVisits.rows) {
                        await db.execute(`DELETE FROM ${tableClientVisits} WHERE client_id = '${rowClientVisits.client_id}' AND visit_id = '${row.visit_id}';`);
                    }
                }

                await employeeMapper.remove({id});
                res.render('pages/success', {success: "Usunięto pracownika"});
            } catch (err) {
                console.error(err.message);
            }
        }
    }
}

module.exports = employee;