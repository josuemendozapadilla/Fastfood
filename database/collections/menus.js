const mongoose = require("../connect");
var mon = require('mongoose');
var Schema = mon.Schema;
var menusSchema = new Schema({
  nombre : String,
  precio : Number,
  descripcion : String,
  fechaderegistro :  {
    type: Date, default: Date.now
  },
  fotodelproducto : Array
});
var menus = mongoose.model("menus", menusSchema);
module.exports = menus;
