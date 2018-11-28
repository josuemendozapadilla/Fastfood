const mongoose = require('../connect');
const Schema = mongoose.Schema;

const restaurantSchema = Schema({
    nombre: String,
    nit: String,
    propietario: {
        type: Schema.Types.ObjectId,
        ref: "Usuario"
    },
    calle: String,
    telefono: Number,
    log: Number,
    lat: Number,
    logo: String,
    fechaRegistro: {
        type: Date,
        default: Date.now()
    },
    fotoLugar: String
})

const Restaurant = mongoose.model('Restaurant', restaurantSchema);

module.exports = Restaurant;