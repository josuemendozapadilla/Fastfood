const mongoose = require("../connect");
var mon = require('mongoose');
var Schema = mon.Schema;
var ordenSchema = new Schema({
  idmenu : String,
  idrestaurant : String,
  cantidad : Number,
  idcliente : Number,
  pagototal : Number
});
var orden = mongoose.model("orden", ordenSchema);
module.exports = orden;
