var express = require('express');
var router = express.Router();

const Usuario = require('../../database/models/usuario');
/* 

const multer = require('multer');
const path = require('path');
const fs = require('fs');

const storage = multer.diskStorage({
    destination: function (res, file, cb) {
        try {
            fs.statSync('./uploads/');
        } catch (e) {
            fs.mkdirSync('./uploads/');
        }
        cb(null, './uploads/');
    },
    filename: (res, file, cb) => {
        cb(null, 'IMG-' + Date.now() + path.extname(file.originalname))
    }
})

const fileFilter = (req, file, cb) => {
    if (file.mimetype === 'image/png' || file.mimetype === 'image/jpeg') {
        return cb(null, true);
    }
    return cb(new Error('Solo se admiten imagenes png y jpg jpeg'));
} 

const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 1024 * 1024 * 5
    }
})*/

/* GET Usuarioe. */
router.get('/', function (req, res, next) {

    Usuario.find().exec().then(docs => {
        if (docs.length == 0) {
            res.json({
                message: "No existen usuarios en la base de datos"
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
        email: req.body.email,
        telefono: req.body.telefono,
        ci: req.body.ci,
        avatar: req.body.avatar,
    };

    var modelUsuario = new Usuario(datos);
    modelUsuario.save().then(result => {
            res.json({
                message: "Usuario insertado en la bd"
            });
        })
        .catch(err => {
            res.status(500).json({
                error: err
            })
        });
});

router.patch('/:id', function (req, res, next) {
    let idUsuario = req.params.id;
    const datos = {};

    Object.keys(req.body).forEach((key) => {
        datos[key] = req.body[key];
    });
    console.log(datos);
    Usuario.findByIdAndUpdate(idUsuario, datos).exec()
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
    let idUsuario = req.params.id;

    Usuario.findByIdAndRemove(idUsuario).exec()
        .then(() => {
            res.json({
                message: "Usuario eliminado"
            });
        }).catch(err => {
            res.status(500).json({
                error: err
            });
        });


});


module.exports = router;