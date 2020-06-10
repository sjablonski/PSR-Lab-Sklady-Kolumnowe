const {v4: uuidv4} = require('uuid');
const {tableVisit, tableClient, tableEmployee, tableVisitColumns} = require('../constants');

const visit = (db) => {
    const createObject = (input) => {
        const values = Object.values(input);
        const obj = Object.keys(input).map((item, index) => {
            let value = values[index];
            value = typeof value === "number" ? value : `'${value}'`;
            return `${item}: ${value}`
        });
        return `{${obj.join()}}`;
    }

    const createArray = (input) => {
        return `[${input.map(item => createObject(item))}]`
    }

    const convertType = (type) => {
        switch (type) {
            case "overview": return "Przegląd";
            case "diagnostics": return "Diagnostyka";
            case "repair": return "Naprawa";
            case "service": return "Serwis";
            default: return type;
        }
    }

    return {
        getAllTodayVisits: async (req, res) => {
            try {
                const result = await db.execute(`SELECT * FROM ${tableVisit} WHERE date = '${new Date().toISOString().substr(0, 10)}' ALLOW FILTERING;`);
                const visits = result.rows;
                visits.forEach(visit => visit.type = convertType(visit.type));
                res.render('pages/index', {visits});
            } catch (err) {
                console.error(err.message);
            }
        },
        getAllVisits: async (req, res) => {
            try {
                const result = await db.execute(`SELECT * FROM ${tableVisit};`);
                const pendingVisits = [];
                const hisotryVisits = [];
                result.rows.forEach(item => {
                    const itemDate = new Date(item.date).setHours(0, 0, 0, 0);
                    const today = new Date().setHours(0, 0, 0, 0);
                    if (itemDate > today) {
                        pendingVisits.push(item);
                    } else if (itemDate < today) {
                        hisotryVisits.push(item);
                    }
                });
                res.render('pages/visit', {pendingVisits, hisotryVisits});
            } catch (err) {
                console.error(err.message);
            }
        },
        getVisit: async (req, res) => {
            try {
                const id = req.params.id;
                const resEmployees = await db.execute(`SELECT * FROM ${tableEmployee};`);
                const resClients = await db.execute(`SELECT * FROM ${tableClient};`);
                const resVisit = await db.execute(`SELECT * FROM ${tableVisit} WHERE id = '${id}';`);
                const employees = resEmployees.rows;
                const clients = resClients.rows;
                const visit = resVisit.rows[0];

                res.render('pages/visit-id', {visit, employees, clients});
            } catch (err) {
                console.error(err.message);
            }
        },
        addVisitGet: async (req, res) => {
            try {
                const resEmployees = await db.execute(`SELECT * FROM ${tableEmployee};`);
                const resClients = await db.execute(`SELECT * FROM ${tableClient};`);
                const employees = resEmployees.rows;
                const clients = resClients.rows;
                res.render('pages/visit-new', {employees, clients});
            } catch (err) {
                console.error(err.message);
            }
        },
        addVisitPost: async (req, res) => {
            try {
                let employees = req.body.employees;
                employees = employees && Array.isArray(employees) ? employees : [employees || '{"id": "", "name": ""}'];
                employees = employees.map(employee => employee && JSON.parse(employee));

                const visit = {
                    id: uuidv4().substr(0, 5),
                    date: req.body.date,
                    type: req.body.type,
                    cost: parseFloat(req.body.cost),
                    car: {
                        manufacturer: req.body.manufacturer,
                        model: req.body.model,
                        year: parseInt(req.body.year)
                    },
                    employees,
                    client: {
                        id: req.body.clientId,
                        name: req.body.clientName,
                        email: req.body.email,
                        phone: req.body.phone
                    },
                    description: req.body.description
                };

                await db.execute(`INSERT INTO ${tableVisit} JSON '${JSON.stringify(visit)}';`);
                res.render('pages/success', {success: "Dodano wizytę"});
            } catch (err) {
                console.error(err.message);
            }
        },
        updateVisit: async (req, res) => {
            try {
                const id = req.body.id;
                let employees = req.body.employees;
                employees = employees && Array.isArray(employees) ? employees : [employees || '{"id": "", "name": ""}'];
                employees = employees.map(employee => employee && JSON.parse(employee));

                const visit = {
                    date: req.body.date,
                    type: req.body.type,
                    cost: parseFloat(req.body.cost),
                    car: {
                        manufacturer: req.body.manufacturer,
                        model: req.body.model,
                        year: parseInt(req.body.year)
                    },
                    employees,
                    client: {
                        id: req.body.clientId,
                        name: req.body.clientName,
                        email: req.body.email,
                        phone: req.body.phone
                    },
                    description: req.body.description
                };

                const columns = tableVisitColumns.split(",")
                    .map((item) => {
                        const substr = item.substring(1, item.indexOf(" ", 1));
                        let value;
                        if (typeof visit[substr] === "number") {
                            value = visit[substr];
                        } else if (Array.isArray(visit[substr])) {
                            value = createArray(visit[substr]);
                        } else if (typeof visit[substr] === "object") {
                            value = createObject(visit[substr]);
                        } else {
                            value = `'${visit[substr]}'`;
                        }
                        return visit[substr] ? substr + `=${value}` : "";
                    })
                    .filter((item) => item)
                    .join();
                const query = `UPDATE ${tableVisit} SET ${columns} WHERE id = '${id}';`;
                db.execute(query);
                res.render('pages/success', {success: "Zaktualizowano dane o pracowniku"});
            } catch (err) {
                console.error(err.message);
            }
        }
    }
};

module.exports = visit;