const mongoose = require("../connect");
var mon = require('mongoose');
var Schema = mon.Schema;
var restaurantSchema = new Schema({
  nombre : String,
  nit : Number,
  propiedad : String,
  calle : String,
  telefono : Number,
  lat : Number,
  lon : Number,
  fechaderegistro : String,
  fotolugar : Array
});
var restaurant = mongoose.model("restaurant", restaurantSchema);
module.exports = restaurant;
