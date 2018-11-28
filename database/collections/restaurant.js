const mongoose = require("../connect");
var mon = require('mongoose');
var Schema = mon.Schema;
var restaurantSchema = new Schema({
  Nombre : String,
  Nit : Number,
  Propiedad : String,
  Calle : String,
  Telefono : Number,
  Lat : Number,
  Lon : Number,
  Fecha_Registro: {
    type: Date, default: Date.now
  },
  Foto_Lugar : Array
});
var restaurant = mongoose.model("restaurant", restaurantSchema);
module.exports = restaurant;
