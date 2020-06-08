const { v4: uuidv4 } = require('uuid');

const doctor = (db) => {
    return {
        getAllDoctors: async(req, res) => {
            try {
                const doctors = await db.collection("doctors").find({}).toArray();
                res.render('pages/doctor', { doctors });
            } catch(err) {
                console.error(err.message);
            }
        },
        getSingleDoctor: async(req, res) => {
            try {
                const id = req.params.id;
                const doctor = await db.collection("doctors").findOne({id: id});
                res.render('pages/doctor-id', { doctor });
            } catch(err) {
                console.error(err.message);
            }
        },
        addDoctorGet: (req, res) => {
            try {
                res.render('pages/doctor-new');
            } catch(err) {
                console.error(err.message);
            }
        },
        addDoctorPost: async(req, res) => {
            try {
                const doctor = {
                    id: uuidv4().substr(0,5),
                    firstName: req.body.firstName,
                    lastName: req.body.lastName,
                    specializations: [req.body.specializations]
                };
                await db.collection("doctors").insertOne(doctor);
                res.render('pages/success', {success: "Dodano lekarza"});
            } catch(err) {
                console.error(err.message);
            }
        },
        updateDoctor: async(req, res) => {
            try {
                const id = req.body.id;
                const doctor = {
                    firstName: req.body.firstName,
                    lastName: req.body.lastName,
                    specializations: [req.body.specializations]
                };
                await db.collection("doctors").updateOne({id}, {$set: doctor});
                res.render('pages/success', {success: "Zaktualizowano dane o lekarzu"});
            } catch(err) {
                console.error(err.message);
            }
        },
        deleteDoctor: async(req, res) => {
            try {
                const id = req.body.id;
                await db.collection("doctors").deleteOne({id});
                await db.collection("clinics").update(
                    { "doctors.id": id },
                    { $pull: { 'doctors': { id } } }
                );
                res.render('pages/success', {success: "Usunięto lekarza"});
            } catch(err) {
                console.error(err.message);
            }
        }
    }
}

module.exports = doctor;