const mongoose = require("../connect");
var mon = require('mongoose');
var Schema = mon.Schema;
var usersSchema = new Schema({
    Nombre: String,
    Ci: String,
    Telefono: Number,
    Email: String,
    Password: String,
    Tipo_Usuario : String,
    Fecha_Registro: {
        type: Date,
        default: Date.now()
    },
});
var users = mongoose.model("users", usersSchema);
module.exports = users;
