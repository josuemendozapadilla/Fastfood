const mongoose = require("../connect");
//var mon = require('mongoose');
//var Schema = mon.Schema;
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
        required: 'Falta el Email',
        match: /^(([^<>()\[\]\.,;:\s @\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i,
    },
    Password: String,

    Fecha_Registro: {
        type: Date,
        default: Date.now()
    },
    Tipo_Usuario : String
});
const users = mongoose.model('Users', usersSchema);//aqui defines un modelo y el controlador tendria que tener un nombre parecido
module.exports = users;
