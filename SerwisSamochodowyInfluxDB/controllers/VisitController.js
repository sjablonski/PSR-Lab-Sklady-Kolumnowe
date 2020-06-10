const {v4: uuidv4} = require('uuid');
const {tableVisit, tableClient, tableEmployee} = require('../constants');

const visit = (db) => {
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
                const result = await db.query(`SELECT * FROM ${tableVisit} WHERE date = '${new Date().toISOString().substr(0, 10)}' AND status='open';`);
                const visits = JSON.parse(JSON.stringify(result));

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

                const result = await db.query(`SELECT * FROM ${tableVisit};`);
                const visits = JSON.parse(JSON.stringify(result));

                visits.forEach(visit => visit.type = convertType(visit.type));

                visits.forEach(visit => {
                    const itemDate = new Date(visit.date).setHours(0, 0, 0, 0);
                    const today = new Date().setHours(0, 0, 0, 0);
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
                const result = await db.query(`SELECT * FROM ${tableVisit} WHERE clientID = '${id}'`);
                const visits = JSON.parse(JSON.stringify(result));

                visits.forEach(visit => visit.type = convertType(visit.type));

                res.render('pages/client-visits', {visits});
            } catch (err) {
                console.error(err.message);
            }
        },
        getAllEmployeeVisits: async (req, res) => {
            try {
                const id = req.params.id;
                const result = await db.query(`SELECT * FROM ${tableVisit} WHERE employeeID = '${id}'`);
                const visits = JSON.parse(JSON.stringify(result));

                visits.forEach(visit => visit.type = convertType(visit.type));

                res.render('pages/employee-visits', {visits});
            } catch (err) {
                console.error(err.message);
            }
        },
        getVisit: async (req, res) => {
            try {
                const id = req.params.id;
                const result = await db.query(`SELECT * FROM ${tableVisit} WHERE visitID = '${id}';`);
                const visit = JSON.parse(JSON.stringify(result[0]));

                res.render('pages/visit-id', {visit});
            } catch (err) {
                console.error(err.message);
            }
        },
        addVisitGet: async (req, res) => {
            try {
                const resEmployees = await db.query(`SELECT * FROM ${tableEmployee};`);
                const resClients = await db.query(`SELECT * FROM ${tableClient};`);
                const employees = JSON.parse(JSON.stringify(resEmployees));
                const clients = JSON.parse(JSON.stringify(resClients));

                res.render('pages/visit-new', {employees, clients});
            } catch (err) {
                console.error(err.message);
            }
        },
        addVisitPost: async (req, res) => {
            try {
                const visit = {
                    date: req.body.date,
                    type: req.body.type,
                    price: req.body.price ? parseFloat(req.body.price) : 0,
                    status: req.body.status,
                    carManufacturer: req.body.manufacturer,
                    carModel: req.body.model,
                    carYear: parseInt(req.body.year),
                    description: req.body.description,
                    employeeName: req.body.employeeName,
                    clientName: req.body.clientName,
                };

                await db.writePoints([{
                    measurement: tableVisit,
                    tags: {
                        visitID: uuidv4().substr(0, 5),
                        clientID: req.body.clientID,
                        employeeID: req.body.employeeID,
                    },
                    fields: visit
                }]);

                res.render('pages/success', {success: "Dodano wizytę"});
            } catch (err) {
                console.error(err.message);
            }
        },
        updateVisit: async (req, res) => {
            try {
                const id = req.body.id;

                const visit = {
                    date: req.body.date,
                    type: req.body.type,
                    price: req.body.price ? parseFloat(req.body.price) : 0,
                    status: req.body.status,
                    carManufacturer: req.body.manufacturer,
                    carModel: req.body.model,
                    carYear: parseInt(req.body.year),
                    description: req.body.description,
                    employeeName: req.body.employeeName,
                    clientName: req.body.clientName,
                };

                await db.query(`DELETE FROM ${tableVisit} WHERE visitID = '${id}';`);
                await db.writePoints([{
                    measurement: tableVisit,
                    tags: {
                        visitID: id,
                        clientID: req.body.clientID,
                        employeeID: req.body.employeeID,
                    },
                    fields: visit
                }]);

                res.render('pages/success', {success: "Zaktualizowano dane o wizycie"});
            } catch (err) {
                console.error(err.message);
            }
        },
        deleteVisit: async (req, res) => {
            try {
                const id = req.body.id;
                await db.query(`DELETE FROM ${tableVisit} WHERE visitID = '${id}';`);
                res.render('pages/success', {success: "Usunięto wizytę"});
            } catch (err) {
                console.error(err.message);
            }
        }
    }
};

module.exports = visit;