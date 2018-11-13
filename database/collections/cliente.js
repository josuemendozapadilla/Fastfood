const mongoose = require("../connect");
var mon = require('mongoose');
var Schema = mon.Schema;
var clienteSchema = new Schema({
  nombre : String,
  apellido : String,
  ci : String,
  fechaderegistro : Date,
  telefono : Number,
  gmail : String
});
var cliente = mongoose.model("cliente", clienteSchema);
module.exports = cliente;
