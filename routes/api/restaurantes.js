var express = require('express');
var router = express.Router();

const Restaurant = require('../../database/models/restaurant');

/* GET restaurante. */
router.get('/', function (req, res, next) {

    Restaurant.find().populate('propietario', '-__v').exec().then(docs => {
        if (docs.length == 0) {
            res.json({
                message: "No se encontro en la base de datos"
            })
        } else {
            res.json(docs);
        }
    }).catch(err => {
        res.json({
            error: err
        });
    })

});

router.post('/', function (req, res, next) {
    const datos = {
        nombre: req.body.nombre,
        nit: req.body.nit,
        propietario: req.body.propietario,
        calle: req.body.calle,
        log: req.body.log,
        lat: req.body.lat,
        logo: req.body.logo,
        fotoLugar: req.body.fotoLugar
    }

    var data = new Restaurant(datos);
    data.save()
        .then(result => {
            res.json({
                message: "Restaurant inseertado en la bd"
            })
        }).catch(err => {
            res.status(500).json({
                error: err
            })
        });

});


router.patch('/:id', function (req, res, next) {
    let idRestaurant = req.params.id;
    const datos = {};

    Object.keys(req.body).forEach((key) => {
        datos[key] = req.body[key];
    });
    console.log(datos);
    Restaurant.findByIdAndUpdate(idRestaurant, datos).exec()
        .then(result => {
            res.json({
                message: "Datos actualizados"
            });
        }).catch(err => {
            res.status(500).json({
                error: err
            })
        });
});

router.delete('/:id', function (req, res, next) {
    let idRestaurant = req.params.id;

    Restaurant.findByIdAndRemove(idRestaurant).exec()
        .then(() => {
            res.json({
                message: "Restaurant eliminado"
            });
        }).catch(err => {
            res.status(500).json({
                error: err
            });
        });


});


module.exports = router;