const keyspace = "carservice";
exports.keyspace = keyspace;

exports.TYPE = "TYPE";
exports.TABLE = "TABLE";

exports.typeClient = `${keyspace}.client`;
exports.typeEmployee = `${keyspace}.employee`;
exports.typeCar = `${keyspace}.car`;

exports.typeClientColumns = "id text, name text, email text, phone text";
exports.typeEmployeeColumns = "id text, name text";
exports.typeCarColumns = "manufacturer text, model text, year int";

exports.tableVisit = `${keyspace}.visit`;
exports.tableClient = `${keyspace}.clientInfo`;
exports.tableEmployee = `${keyspace}.employeeInfo`;

exports.tableVisitColumns = "id text, date text, type text, cost float, car frozen <car>, employees list<frozen <employee>>, client frozen <client>, description text, PRIMARY KEY (id)";
exports.tableClientColumns = "id text, firstName text, lastName text, phone text, email text, PRIMARY KEY (id)";
exports.tableEmployeeColumns = "id text, firstName text, lastName text, PRIMARY KEY (id)";