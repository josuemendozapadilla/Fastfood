const mongoose = require("../connect");
const Schema = mongoose.Schema;

const usersSchema =  Schema({
    Nombre:  {
        type: String,
        required: [true, 'debe poner un nombre']
    },
    Ci: {
        type: String,
        required: [true, 'Falta el CI']
    },
    Telefono: Number,
    Email:{
        type: String,
        required: 'Falta el email',
        match: /^(([^<>()\[\]\.,;:\s @\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i,
    },
    Password: String,
    Tipo_Usuario : String,
    Fecha_Registro: {
        type: Date,
        default: Date.now()
    },
});
var users = mongoose.model("Users", usersSchema);
module.exports = users;
