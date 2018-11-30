const mongoose = require("../connect");
//var mon = require('mongoose');
const Schema = mongoose.Schema;
const menusSchema = new Schema({
  restaurant:{
    type: Schema.Types.ObjectId,
    ref: "Restaurant"
  },
  Nombre : String,
  Telefono : Number,
  Ci : String,

  Descripcion : String,
  Fechade_Registro :  {
    type: Date, default: Date.now
  },
  Precio : {
    type: Number
  },
  Foto_Producto : Array
});
const menus = mongoose.model("Menus", menusSchema);
module.exports = menus;
