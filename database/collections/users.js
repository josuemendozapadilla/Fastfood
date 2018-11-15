const mongoose = require("../connect");
var mon = require('mongoose');
var Schema = mon.Schema;
var usersSchema = new Schema({
  nombre : String,
  telefono : Number,
  gmail : String,
  password : String

});
var users = mongoose.model("users", usersSchema);
module.exports = users;
