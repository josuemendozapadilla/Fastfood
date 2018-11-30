const mongoose = require("../connect");
//var ObjectId = mongoose.Schema.Types.ObjectId;
//var Schema = mon.Schema;
const Schema = mongoose.Schema;
const ordenSchema = new Schema({

  //Idmenus : {type: Schema.ObjectId, ref: "menus"},
  //Idrestaurant: {type: Schema.ObjectId, ref: "restaurant"},
  //Idcliente : {type: Schema.ObjectId, ref: "cliente"},
Cliente: {
  type: Schema.Types.ObjectId,
  ref: "Users"
},
  Lugar_Envio: [Number],
  Restaurant:{
    type: Schema.Types.ObjectId,
    ref: "Restaurant"
  },
  Menus : [{
    type: Schema.Types.ObjectId,
    ref: "Menus"
  }],
  Precios : Number,
  Cantidad : [Number],
  Fecha_Registro:
    {
      type:Date,
      default: Date.now()

    },

Pago_Total : Number,
});
const orden = mongoose.model("Orden", ordenSchema);
module.exports = orden;
