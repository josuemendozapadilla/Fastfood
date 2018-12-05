const mongoose = require("../connect");
var mon = require('mongoose');
var Schema = mon.Schema;
var restaurantSchema = new Schema({
  nombre : String,
  nit : String,
  propietario : String,
  calle : String,
  telefono : Number,
  lat : String,
  lon : String,
  Fecha_Registro: {
    type: Date, default: Date.now
  },
  fotolugar : String
});
var restaurant = mongoose.model("Restaurant", restaurantSchema);
module.exports = restaurant;
