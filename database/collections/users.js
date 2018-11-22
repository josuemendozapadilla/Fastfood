const mongoose = require("../connect");
var mon = require('mongoose');
var Schema = mon.Schema;
var usersSchema = new Schema({
    nombre: String,
    ci: String,
    email: String,
    password: String,
    telefono: Number,
    fechaRegistro: {
        type: Date,
        default: Date.now()
    },
});
var users = mongoose.model("users", usersSchema);
module.exports = users;
