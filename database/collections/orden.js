const mongoose = require("../connect");
var mon = require('mongoose');
var Schema = mon.Schema;
var ordenSchema = new Schema({
  idmenu : String,
  idrestaurant: {type: Schema.ObjectId, ref: "restaurant"},
  cantidad : Number,
  idcliente : String,
  lat : Number,
  lon : Number,
  pagototal : Number

});
var orden = mongoose.model("orden", ordenSchema);
module.exports = orden;
