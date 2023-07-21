const JSONdb = require("simple-json-db");
const db = new JSONdb("./database.json");
module.exports = db;
