const mongoose = require("../connect");
var mon = require('mongoose');
var Schema = mon.Schema;
var menusSchema = new Schema({
  nombre : String,
  precio : Number,
  descripcion : String,
  fechaderegistro : Date,
  fotodelproducto : Array
});
var menus = mongoose.model("menus", menusSchema);
module.exports = menus;
