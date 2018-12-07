const mongoose = require("../connect");
var mon = require('mongoose');
var Schema = mon.Schema;
var pedidosSchema = new Schema({
  idmenus: String,
  idorders: String,
  cantidad: Number
});
var pedidos = mongoose.model("Pedidos", pedidosSchema);
module.exports = pedidos;
