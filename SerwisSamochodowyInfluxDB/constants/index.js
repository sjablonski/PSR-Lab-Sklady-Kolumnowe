const Influx = require('influx');

const database = "carservice";
const schema = [
    {
        measurement: 'client',
        fields: {
            firstName: Influx.FieldType.STRING,
            lastName: Influx.FieldType.STRING,
            phone: Influx.FieldType.STRING,
            email: Influx.FieldType.STRING
        },
        tags: [
            'id'
        ]
    },
    {
        measurement: 'employee',
        fields: {
            firstName: Influx.FieldType.STRING,
            lastName: Influx.FieldType.STRING
        },
        tags: [
            'id'
        ]
    },
    {
        measurement: 'visit',
        fields: {
            date: Influx.FieldType.STRING,
            type: Influx.FieldType.STRING,
            price: Influx.FieldType.FLOAT,
            status: Influx.FieldType.STRING,
            carManufacturer: Influx.FieldType.STRING,
            carModel: Influx.FieldType.STRING,
            carYear: Influx.FieldType.INTEGER,
            description: Influx.FieldType.STRING,
            employeeName: Influx.FieldType.STRING,
            clientName: Influx.FieldType.STRING
        },
        tags: [
            'visitID',
            'clientID',
            'employeeID'
        ]
    }
];

const connectOptions = {
    host: 'localhost',
    database,
    schema
}

exports.tableVisit = `visit`;
exports.tableClient = `client`;
exports.tableEmployee = `employee`;

exports.database = database;
exports.schema = schema;
exports.connectOptions = connectOptions;