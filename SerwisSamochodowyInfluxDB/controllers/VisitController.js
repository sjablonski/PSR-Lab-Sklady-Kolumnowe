const { v4: uuidv4 } = require('uuid');

const visit = (db) => {
    const createObject = (input) => {
        let out = {};
        if(input) {
            const tmp = input.split(";");
            out = {
                id: tmp[0],
                name: tmp[1]
            }
        }
        return out;
    }

    return {
        getAllVisit: async(req, res) => {
            try {
                const activeVisit = await db.collection("visits").find({status: "open"}).toArray();
                const historyVisit = await db.collection("visits").find({status: "close"}).toArray();
                res.render('pages/index', { activeVisit, historyVisit });
            } catch(err) {
                console.error(err.message);
            }
        },
        getHistory: async(req, res) => {
            try {
                const id = req.params.id;
                const visit = await db.collection("visits").findOne({id: id});
                res.render('pages/visit-id', { visit });
            } catch(err) {
                console.error(err.message);
            }
        },
        reservationVisitGet: (req, res) => {
            try {
                const id = req.params.id;
                res.render('pages/visit-reservation', {id});
            } catch(err) {
                console.error(err.message);
            }
        },
        reservationVisitPut: async(req, res) => {
            try {
                const id = req.body.id;
                const visit = {
                    status: 'close',
                    patient: {
                        firstName: req.body.firstName,
                        lastName: req.body.lastName,
                        description: req.body.description
                    }
                };
                await db.collection("visits").updateOne({id}, {$set: visit});
                res.render('pages/success', {success: "Zarezerwowano wizytę"});
            } catch(err) {
                console.error(err.message);
            }
        },
        addVisitGet: async(req, res) => {
            try {
                const id = req.params.id;
                const doctor = await db.collection("doctors").findOne({id: id});
                res.render('pages/visit-new', {doctor});
            } catch(err) {
                console.error(err.message);
            }
        },
        addVisitPost: async(req, res) => {
            try {
                const clinic = createObject(req.body.clinic);
                const visit = {
                    id: uuidv4().substr(0,5),
                    date: req.body.date,
                    specialization: req.body.specializations,
                    doctor: {
                        id: req.body.doctorID,
                        name: `${req.body.firstName} ${req.body.lastName}`
                    },
                    type: req.body.type,
                    status: 'open',
                    clinic
                };
                await db.collection("visits").insertOne(visit);
                res.render('pages/success', {success: "Dodano wizytę"});
            } catch(err) {
                console.error(err.message);
            }
        }
    }
};

module.exports = visit;