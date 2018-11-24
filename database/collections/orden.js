const mongoose = require("../connect");
var mon = require('mongoose');
var ObjectId = mongoose.Schema.Types.ObjectId;
var Schema = mon.Schema;
var ordenSchema = new Schema({

  idmenus : {type: Schema.ObjectId, ref: "users"},
  idrestaurant: {type: Schema.ObjectId, ref: "restaurant"},
  idcliente : {type: Schema.ObjectId, ref: "cliente"},
  shippinAddress:{
    lon:String,
    lat:String
  },
  pagototal : Number,
  orden:[
    {
      id:ObjectId,
      cantidad:Number,
      precio:Number

    }
  ],

});
var orden = mongoose.model("orden", ordenSchema);
module.exports = orden;
