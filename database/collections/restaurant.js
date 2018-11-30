const mongoose = require("../connect");
var mon = require('mongoose');
var Schema = mon.Schema;
var restaurantSchema = new Schema({
  Nombre : String,
  Nit : String,
  Propiedad : {
    type: Schema.Types.ObjectId,
    ref: "Users"
  },
  Calle : String,
  Telefono : Number,
  Lat : Number,
  Lon : Number,
  Fecha_Registro: {
    type: Date, default: Date.now
  },
  Foto_Lugar : String
});
var restaurant = mongoose.model("Restaurant", restaurantSchema);
module.exports = restaurant;
