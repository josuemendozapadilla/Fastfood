const mongoose = require("../connect");
var mon = require('mongoose');
var ObjectId = mongoose.Schema.Types.ObjectId;
var Schema = mon.Schema;
var ordenSchema = new Schema({

  Idmenus : {type: Schema.ObjectId, ref: "menus"},
  Idrestaurant: {type: Schema.ObjectId, ref: "restaurant"},
  Idcliente : {type: Schema.ObjectId, ref: "cliente"},

  ShippinAddress:{
    lon:String,
    lat:String
  },

  Orden:[
    {
      id:ObjectId,
      cantidad:Number,
      precio:Number

    }
  ],
Pago_Total : Number,
});
var orden = mongoose.model("orden", ordenSchema);
module.exports = orden;
