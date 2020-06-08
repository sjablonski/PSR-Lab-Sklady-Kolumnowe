const express = require('express');
const methodOverride = require('method-override');
const routes = require('./routes');
const MongoClient = require('./MongoClientInstance');

const app = express();

app.use(express.urlencoded({ extended: true }))
app.use(methodOverride(function (req, res) {
  if (req.body && typeof req.body === 'object' && '_method' in req.body) {
    const method = req.body._method
    delete req.body._method
    return method
  }
}));
app.set('view engine', 'ejs');

MongoClient.connect().then(db => {
  try {
    db.createCollection("clinics", function(err) {
      if (err) throw err;
      console.log("Clinics collection created!");
    });

    db.createCollection("doctors", function(err) {
      if (err) throw err;
      console.log("Doctors collection created!");
    });

    db.createCollection("visits", function(err) {
      if (err) throw err;
      console.log("Visits collection created!");
    });

    routes(app, db);

    const server = app.listen(3001, function () {
      const host = server.address().address;
      const port = server.address().port;

      console.log("App listening at http://%s:%s", host, port)
    });
  } catch (e) {
    console.error(e.message);
    process.exit(1)
  }
});