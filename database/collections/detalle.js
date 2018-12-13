const mongoose = require("../connect");
var mon = require('mongoose');
var Schema = mon.Schema;
var detalleSchema = new Schema({
  menus: {
    type: Schema.Types.ObjectId,
    ref: "Menus"
    },
    orden: {
      type: Schema.Types.ObjectId,
      ref: "Orden"
      },
  cantidad: Number,
  precio : Number 
});
var detalle = mongoose.model("Detalle", detalleSchema);
module.exports = detalle;
