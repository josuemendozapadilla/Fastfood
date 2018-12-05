const mongoose = require("../connect");
var ObjectId = mongoose.Schema.Types.ObjectId;
const Schema = mongoose.Schema;

const ordenSchema = new Schema({

  //Idmenus : {type: Schema.ObjectId, ref: "menus"},
  //Idrestaurant: {type: Schema.ObjectId, ref: "restaurant"},
  //Idcliente : {type: Schema.ObjectId, ref: "cliente"},
cliente: {
  type: Schema.Types.ObjectId,
  ref: "Users"
},
  lugar_envio: [Number],
  restaurant:{
    type: Schema.Types.ObjectId,
    ref: "Restaurant"
  },
  menus : [{
    type: Schema.Types.ObjectId,
    ref: "Menus"
  }],
  precios : Number,
  cantidad : [Number],
  Fecha_Registro:
    {
      type:Date,
      default: Date.now()

    },

pago_total : Number,
});
const orden = mongoose.model("Orden", ordenSchema);
module.exports = orden;
