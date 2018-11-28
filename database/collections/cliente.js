const mongoose = require("../connect");
var mon = require('mongoose');
var Schema = mon.Schema;
var clienteSchema = new Schema({
  Nombre : String,
  Apellido : String,
  Ci : String,
  Fecha_Registro: {
      type: Date,
      default: Date.now()
  },
  Telefono : Number,
  Gmail : String
});
var cliente = mongoose.model("cliente", clienteSchema);
module.exports = cliente;
