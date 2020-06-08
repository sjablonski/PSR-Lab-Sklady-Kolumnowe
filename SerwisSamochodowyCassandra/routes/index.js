const bodyParser = require('body-parser');
const { clinicCtrl, doctorCtrl, visitCtrl } = require('../controllers');

const urlencodedParser = bodyParser.urlencoded({ extended: false });

const routers = (app, db) => {
    const doctor = doctorCtrl(db);
    const visit = visitCtrl(db);
    const clinic = clinicCtrl(db);

    app.get('/', visit.getAllVisit);

    app.get('/doctor', doctor.getAllDoctors);
    app.get('/doctor/id/:id', doctor.getSingleDoctor);
    app.get('/doctor/new', doctor.addDoctorGet);
    app.post('/doctor/new', urlencodedParser, doctor.addDoctorPost);
    app.put('/doctor/id/:id', doctor.updateDoctor);
    app.delete('/doctor/id/:id', doctor.deleteDoctor);

    app.get('/clinic', clinic.getAllClinics);
    app.get('/clinic/id/:id', clinic.getSingleClinic);
    app.get('/clinic/new', clinic.addClinicGet);
    app.post('/clinic/new',urlencodedParser, clinic.addClinicPost);
    app.put('/clinic/id/:id', clinic.updateClinic);
    app.delete('/clinic/id/:id', clinic.deleteClinic);

    app.get('/doctor/id/:id/visit/new', visit.addVisitGet);
    app.post('/doctor/id/:id/visit/new', visit.addVisitPost);
    app.get('/visit/reservation/:id', visit.reservationVisitGet);
    app.put('/visit/reservation/:id', visit.reservationVisitPut);
    app.get('/visit/history/:id', visit.getHistory);

    return app;
}

module.exports = routers;
