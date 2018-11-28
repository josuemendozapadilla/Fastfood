var express = require('express');
var router = express.Router();

const Menu = require('../../database/models/menu');

/* GET Menue. */
router.get('/', function (req, res, next) {

    Menu
        .find()
        .exec()
        .then(docs => {
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
        telefono: req.body.telefono,
        ci: req.body.ci,
        descripcion: req.body.descripcion,
        restaurant: req.body.restaurant,
        precio: req.body.precio,

    };

    var modelMenu = new Menu(datos);
    modelMenu.save()
        .then(result => {
            res.json({
                message: "Menu insertado en la bd"
            })
        }).catch(err => {
            res.status(500).json({
                error: err
            })
        });

});

router.patch('/:id', function (req, res, next) {
    let idMenu = req.params.id;
    const datos = {};

    Object.keys(req.body).forEach((key) => {
        datos[key] = req.body[key];
    });
    console.log(datos);
    Menu.findByIdAndUpdate(idMenu, datos).exec()
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
    let idMenu = req.params.id;

    Menu.findByIdAndRemove(idMenu).exec()
        .then(() => {
            res.json({
                message: "Menu eliminado"
            });
        }).catch(err => {
            res.status(500).json({
                error: err
            });
        });


});

module.exports = router;