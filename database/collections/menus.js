const mongoose = require("../connect");
var mon = require('mongoose');
var Schema = mon.Schema;
var menusSchema = new Schema({
  Nombre : String,
  Precio : Number,
  Descripcion : String,
  Fechade_Registro :  {
    type: Date, default: Date.now
  },
  Foto_Producto : Array
});
var menus = mongoose.model("menus", menusSchema);
module.exports = menus;
