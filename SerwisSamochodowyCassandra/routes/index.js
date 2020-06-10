const bodyParser = require('body-parser');
const { clientCtrl, employeeCtrl, visitCtrl } = require('../controllers');

const urlencodedParser = bodyParser.urlencoded({ extended: false });

const routers = (app, db) => {
    const employee = employeeCtrl(db);
    const visit = visitCtrl(db);
    const client = clientCtrl(db);

    app.get('/', visit.getAllTodayVisits);

    app.get('/employee', employee.getAllEmployees);
    app.get('/employee/id/:id', employee.getSingleEmployee);
    app.get('/employee/new', employee.addEmployeeGet);
    app.post('/employee/new', urlencodedParser, employee.addEmployeePost);
    app.put('/employee/id/:id', employee.updateEmployee);
    app.delete('/employee/id/:id', employee.deleteEmployee);

    app.get('/client', client.getAllClients);
    app.get('/client/id/:id', client.getSingleClient);
    app.get('/client/new', client.addClientGet);
    app.post('/client/new',urlencodedParser, client.addClientPost);
    app.put('/client/id/:id', client.updateClient);
    app.delete('/client/id/:id', client.deleteClient);

    app.get('/visit', visit.getAllVisits);
    app.get('/visit/new', visit.addVisitGet);
    app.post('/visit/new', visit.addVisitPost);
    app.put('/visit/id/:id', visit.updateVisit);
    app.get('/visit/id/:id', visit.getVisit);

    return app;
}

module.exports = routers;
