const { v4: uuidv4 } = require('uuid');

const clinic = (db) => {

    const createArray = (input) => {
        let out = [];
        if(input) {
            const arr = Array.isArray(input) ? input : [input];
            out = arr.map(item => {
                const tmp = item.split(";");
                return {
                    id: tmp[0],
                    name: tmp[1]
                }
            });
        }
        return out;
    }

    return {
        getAllClinics: async(req, res) => {
            try {
                const clinics = await db.collection("clinics").find({}).toArray();
                res.render('pages/clinic', { clinics });
            } catch(err) {
                console.error(err.message);
            }
        },
        getSingleClinic: async (req, res) => {
            try {
                const id = req.params.id;
                const clinic = await db.collection("clinics").findOne({id: id});
                const doctors = await db.collection("doctors").find({}).toArray();
                res.render('pages/clinic-id', {clinic, doctors});
            } catch(err) {
                console.error(err.message);
            }
        },
        addClinicGet: async(req, res) => {
            try {
                const doctors = await db.collection("doctors").find({}).toArray();
                res.render('pages/clinic-new', { doctors });
            } catch(err) {
                console.error(err.message);
            }
        },
        addClinicPost: async(req, res) => {
            try {
                const doctors = createArray(req.body.doctors);
                const clinic = {
                    id: uuidv4().substr(0,5),
                    name: req.body.clinicName,
                    location: req.body.location,
                    phone: req.body.phone,
                    nip: req.body.nip,
                    doctors
                };
                await db.collection("clinics").insertOne(clinic);
                if(doctors.length) {
                    for (const doctor of doctors) {
                        await db.collection("doctors").updateOne({id: doctor.id}, {$addToSet: {clinics: {id: clinic.id, name: clinic.name}}});
                    }
                }
                res.render('pages/success', {success: "Dodano nową przychodnię"});
            } catch(err) {
                console.error(err.message);
            }
        },
        updateClinic: async(req, res) => {
            try {
                const id = req.body.id;
                const doctors = createArray(req.body.doctors);
                const clinic = {
                    name: req.body.clinicName,
                    location: req.body.location,
                    phone: req.body.phone,
                    nip: req.body.nip,
                    doctors
                };
                await db.collection("clinics").updateOne({id}, {$set: clinic});
                if(doctors.length) {
                    for (const doctor of doctors) {
                        await db.collection("doctors").updateOne({id: doctor.id}, {$addToSet: {clinics: {id, name: clinic.name}}});
                    }
                }
                res.render('pages/success', {success: "Zaktualizowano przychodnię"});
            } catch(err) {
                console.error(err.message);
            }
        },
        deleteClinic: async(req, res) => {
            try {
                const id = req.body.id;
                await db.collection("clinics").deleteOne({id});
                await db.collection("doctors").update(
                    { "clinics.id": id },
                    { $pull: { 'clinics': { id } } }
                );
                res.render('pages/success', {success: "Usunięto przychodnię"});
            } catch(err) {
                console.error(err.message);
            }
        }
    }
}

module.exports = clinic;