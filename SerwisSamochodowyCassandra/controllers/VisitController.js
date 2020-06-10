const {v4: uuidv4} = require('uuid');
const cassandra = require('cassandra-driver');
const keysToCamelCase = require('../utils/keysUnderscoreToCamelCase');
const {keyspace, tableVisit, tableClient, tableEmployee, tableClientVisits, tableEmployeeVisits} = require('../constants');

const visit = (db) => {
    const Mapper = cassandra.mapping.Mapper;
    const mapper = new Mapper(db, {
        models: {
            'Visit': {
                tables: ['visit', 'client_visits', 'employee_visits'],
                keyspace,
                mappings: new cassandra.mapping.UnderscoreCqlToCamelCaseMappings()
            }
        }
    });
    const visitMapper = mapper.forModel('Visit');

    const convertType = (type) => {
        switch (type) {
            case "overview":
                return "Przegląd";
            case "diagnostics":
                return "Diagnostyka";
            case "repair":
                return "Naprawa";
            case "service":
                return "Serwis";
            default:
                return type;
        }
    };

    return {
        getAllTodayVisits: async (req, res) => {
            try {
                const result = await db.execute(`SELECT * FROM ${tableVisit} WHERE date = '${new Date().toISOString().substr(0, 10)}' AND status='open' ALLOW FILTERING;`);
                const visits = keysToCamelCase(result.rows);
                visits.forEach(visit => visit.type = convertType(visit.type));

                res.render('pages/index', {visits});
            } catch (err) {
                console.error(err.message);
            }
        },
        getAllVisits: async (req, res) => {
            try {
                const pendingVisits = [];
                const hisotryVisits = [];

                const result = await db.execute(`SELECT * FROM ${tableVisit};`);
                const visits = keysToCamelCase(result.rows);

                visits.forEach(visit => {
                    const itemDate = new Date(visit.date).setHours(0, 0, 0, 0);
                    const today = new Date().setHours(0, 0, 0, 0);
                    visit.type = convertType(visit.type);
                    if (itemDate > today && visit.status === 'open') {
                        pendingVisits.push(visit);
                    } else if (itemDate < today || visit.status === 'close') {
                        hisotryVisits.push(visit);
                    }
                });

                res.render('pages/visit', {pendingVisits, hisotryVisits});
            } catch (err) {
                console.error(err.message);
            }
        },
        getAllClientVisits: async (req, res) => {
            try {
                const id = req.params.id;
                let visits = await visitMapper.find({clientId: id});
                visits = visits.toArray().map(visit => {visit.type = convertType(visit.type); return visit});

                res.render('pages/client-visits', {visits});
            } catch (err) {
                console.error(err.message);
            }
        },
        getAllEmployeeVisits: async (req, res) => {
            try {
                const id = req.params.id;
                let visits = await visitMapper.find({employeeId: id});
                visits = visits.toArray().map(visit => {visit.type = convertType(visit.type); return visit});

                res.render('pages/employee-visits', {visits});
            } catch (err) {
                console.error(err.message);
            }
        },
        getVisit: async (req, res) => {
            try {
                const id = req.params.id;
                const result = await visitMapper.find({visitId: id});
                const visit = result.first();
                res.render('pages/visit-id', {visit});
            } catch (err) {
                console.error(err.message);
            }
        },
        addVisitGet: async (req, res) => {
            try {
                const resEmployees = await db.execute(`SELECT * FROM ${tableEmployee};`);
                const resClients = await db.execute(`SELECT * FROM ${tableClient};`);
                const employees = keysToCamelCase(resEmployees.rows);
                const clients = keysToCamelCase(resClients.rows);

                res.render('pages/visit-new', {employees, clients});
            } catch (err) {
                console.error(err.message);
            }
        },
        addVisitPost: async (req, res) => {
            try {

                const visit = {
                    visitId: uuidv4().substr(0, 5),
                    clientId: req.body.clientID,
                    employeeId: req.body.employeeID,
                    date: req.body.date,
                    type: req.body.type,
                    price: req.body.price ? parseFloat(req.body.price) : 0,
                    status: req.body.status,
                    car: {
                        manufacturer: req.body.manufacturer,
                        model: req.body.model,
                        year: parseInt(req.body.year)
                    },
                    carName: `${req.body.manufacturer} ${req.body.model}`,
                    description: req.body.description,
                    employeeName: req.body.employeeName,
                    clientName: req.body.clientName,
                };

                await visitMapper.insert(visit);

                res.render('pages/success', {success: "Dodano wizytę"});
            } catch (err) {
                console.error(err.message);
            }
        },
        updateVisit: async (req, res) => {
            try {
                const visit = {
                    visitId: req.body.id,
                    clientId: req.body.clientID,
                    employeeId: req.body.employeeID,
                    date: req.body.date,
                    type: req.body.type,
                    price: req.body.price ? parseFloat(req.body.price) : 0,
                    status: req.body.status,
                    car: {
                        manufacturer: req.body.manufacturer,
                        model: req.body.model,
                        year: parseInt(req.body.year)
                    },
                    carName: `${req.body.manufacturer} ${req.body.model}`,
                    description: req.body.description,
                    employeeName: req.body.employeeName,
                    clientName: req.body.clientName,
                };

                await visitMapper.update(visit);

                res.render('pages/success', {success: "Zaktualizowano dane o wizycie"});
            } catch (err) {
                console.error(err.message);
            }
        },
        deleteVisit: async (req, res) => {
            try {
                const id = req.body.id;

                const result = await db.execute(`SELECT * FROM ${tableVisit} WHERE visit_id = '${id}';`);
                for (const row of result.rows) {
                    await db.execute(`DELETE FROM ${tableClientVisits} WHERE client_id = '${row.client_id}' AND visit_id = '${id}';`);
                    await db.execute(`DELETE FROM ${tableEmployeeVisits} WHERE employee_id = '${row.employee_id}' AND visit_id = '${id}';`);
                }
                await visitMapper.remove({visitId: id});
                res.render('pages/success', {success: "Usunięto wizytę"});
            } catch (err) {
                console.error(err.message);
            }
        }
    }
};

module.exports = visit;