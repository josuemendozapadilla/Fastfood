const mongoose = require("../connect");
var mon = require('mongoose');
var Schema = mon.Schema;
var clienteSchema = new Schema({
  nombre : String,
  ci : String,
  telefono : Number,
  email : String,
  password : String,
  Fecha_Registro: {
      type: Date,
      default: Date.now()
  },
});
var cliente = mongoose.model("cliente", clienteSchema);
module.exports = cliente;
