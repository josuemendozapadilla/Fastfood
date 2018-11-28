const mongoose = require("mongoose");
mongoose.connect("mongodb://localhost:27017/Fastfood");
module.exports = mongoose;
