const keyspace = "carservice";

const clientColumns =
    `id text,
    first_name text,
    last_name text,
    phone text,
    email text,
    PRIMARY KEY(id)`;

const employeeColumns = `
    id text,
    first_name text,
    last_name text,
    PRIMARY KEY(id)
`;

const carColumns = `
    manufacturer text,
    model text,
    year int
`;

const visitColumns = `
    visit_id text,
    date text,
    type text,
    price float,
    status text,
    car frozen<car>,
    description text,
    client_id text,
    client_name text,
    employee_id text,
    employee_name text,
    PRIMARY KEY(visit_id)
`;

const clientVisitsColumns = `
    client_id text,
    visit_id text,
    date text,
    type text,
    client_name text,
    employee_id text,
    employee_name text,
    car_name text,
    PRIMARY KEY(client_id, visit_id)
`;

const employeeVisitsColumns = `
    employee_id text,
    visit_id text,
    date text,
    type text,
    employee_name text,
    client_id text,
    client_name text,
    car_name text,
    PRIMARY KEY(employee_id, visit_id)
`;

const typeCar = `${keyspace}.car`;
const tableClient = `${keyspace}.client`;
const tableEmployee = `${keyspace}.employee`;
const tableVisit = `${keyspace}.visit`;
const tableClientVisits = `${keyspace}.client_visits`;
const tableEmployeeVisits = `${keyspace}.employee_visits`;

const createKeyspace = `CREATE KEYSPACE IF NOT EXISTS ${keyspace} WITH replication = {'class': 'SimpleStrategy', 'replication_factor': '1' };`;
const createCar = `CREATE TYPE IF NOT EXISTS ${typeCar} (${carColumns});`;
const createClient = `CREATE TABLE IF NOT EXISTS ${tableClient} (${clientColumns});`;
const createEmployee = `CREATE TABLE IF NOT EXISTS ${tableEmployee} (${employeeColumns});`;
const createVisit = `CREATE TABLE IF NOT EXISTS ${tableVisit} (${visitColumns});`;
const createClientVisits = `CREATE TABLE IF NOT EXISTS ${tableClientVisits} (${clientVisitsColumns});`;
const createEmployeeVisits = `CREATE TABLE IF NOT EXISTS ${tableEmployeeVisits} (${employeeVisitsColumns});`;

exports.keyspace = keyspace;
exports.createKeyspace = createKeyspace;
exports.createCar = createCar;
exports.createClient = createClient;
exports.createEmployee = createEmployee;
exports.createVisit = createVisit;
exports.createClientVisits = createClientVisits;
exports.createEmployeeVisits = createEmployeeVisits;
exports.typeCar = typeCar;
exports.tableClient = tableClient;
exports.tableEmployee = tableEmployee;
exports.tableVisit = tableVisit;
exports.tableClientVisits = tableClientVisits;
exports.tableEmployeeVisits = tableEmployeeVisits;

