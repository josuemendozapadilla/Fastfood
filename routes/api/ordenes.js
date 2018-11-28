var express = require('express');
var router = express.Router();

const Orden = require('../../database/models/orden');

/* GET Ordene. */
router.get('/', function (req, res, next) {

    Orden.find().exec().then(docs => {
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
        cliente: req.body.cliente,
        lugarEnvio: req.body.lugarEnvio,
        restaurant: req.body.restaurant,
        menus: req.body.menus,
    };

    let precios = req.body.precios;
    let cantidad = req.body.cantidad;
    let pagoTotal = 0;

    if (Array.isArray(cantidad) && Array.isArray(precios)) {
        for (let index = 0; index < precios.length; index++) {
            pagoTotal += +precios[index] * +cantidad[index];
            console.log(cantidad[index]);
        };
    } else {
        pagoTotal = +cantidad * +precios
    }
    //console.log(precios);
    datos.cantidad = cantidad;
    datos.pagoTotal = pagoTotal;
    //console.log(pagoTotal);

    var modelOrden = new Orden(datos);
    modelOrden.save()
        .then(result => {
            res.json({
                message: "Orden insertado en la bd"
            })
        }).catch(err => {
            res.status(500).json({
                error: err
            })
        });

});
const PDFDocument = require('pdfkit');
const fs = require('fs');
router.get('/facturas/:id', function (req, res, next) {

    /*var html = '<div id="pageHeader">Default header</div>'+
    '<div id="pageHeader-first">Header on first page</div>'+
    '<div id="pageHeader-2">Header on second page</div>'+
    '<div id="pageHeader-3">Header on third page</div>'+
    '<div id="pageHeader-last">Header on last page</div>'+
    
    var footer = '<div id="pageFooter">Default footer</div>'+
    '<div id="pageFooter-first">Footer on first page</div>'+
    '<div id="pageFooter-2">Footer on second page</div>'+
    '<div id="pageFooter-last">Footer on last page</div>'*/

    Orden.findById(req.params.id).populate('restaurant').populate('menus').populate('cliente').exec()
        .then(doc => {

            // Create a document 

            pdf = new PDFDocument

            let idOrden = req.params.id
            pdf.pipe(fs.createWriteStream(idOrden + '.pdf'));



            // Add another page 
            pdf.addPage()
                .fontSize(25)
                .text('Id de Factura : ' + idOrden, 100, 100)

                .moveDown()
            pdf.text('Nombre o Razon Social ' + doc.cliente.nombre, {
                width: 412,
                align: 'left'
            })



            pdf.moveDown()
            pdf.text('Correo electronico : ' + doc.cliente.email, {
                width: 412,
                align: 'left'
            })
            pdf.moveDown()
            pdf.text('Cedula de Indentidad ' + doc.cliente.ci, {
                width: 412,
                align: 'left'
            })
            pdf.moveDown()
            pdf.text('Telefono :  ' + doc.cliente.nombre, {
                width: 412,
                align: 'left'
            })
            pdf.moveDown()



            pdf.text('DETALLE DE PEDIDO' + doc.cliente.nombre, {
                width: 412,
                align: 'center'
            })
            pdf.moveDown()
            pdf.text('Restaurant : ' + doc.restaurant.nombre, {
                width: 412,
                align: 'left'
            })
            pdf.moveDown()
            pdf.text('NIT : ' + doc.restaurant.nit, {
                width: 412,
                align: 'left'
            })
            pdf.moveDown()
            pdf.text('Direccion : ' + doc.restaurant.calle, {
                width: 412,
                align: 'left'
            })
            pdf.moveDown()
            pdf.text('Telefono : ' + doc.restaurant.telefono, {
                width: 412,
                align: 'left'
            })


            pdf.moveDown()
            pdf.text('Nombre ----------- Precio ', {
                width: 412,
                align: 'left'
            })
            pdf.moveDown()

            for (let index = 0; index < doc.menus.length; index++) {

                pdf.text(doc.menus[index].nombre + '-------' + doc.menus[index].precio + '------- ' + doc.cantidad[index], {
                    width: 412,
                    align: 'left'
                })
                pdf.moveDown()
            }

            pdf.text('Total :  ' + doc.pagoTotal, {
                width: 412,
                align: 'center'
            })
            pdf.moveDown()



            pdf.text('Fecha de venta : ' + doc.fechaRegistro.toString(), {
                width: 412,
                align: 'center'
            })
            pdf.moveDown()



            // Finalize PDF file 
            pdf.end()



            //pdf.pipe(res.status(201));

            res.status(500).json(doc);

            //enviar el pdf al correo del cliente .
        }).catch(err => {
            res.status(500).json({
                error: err
            });
        });


    //doc.pipe(res.status(201));
})

module.exports = router;

/*{
    "lugarEnvio": [
        1.2545121,
        1.2664656
    ],
    "menus": [
        {
            "fechaRegistro": "2018-11-22T19:50:04.654Z",
            "_id": "5bf70888eb5b111c9410649d",
            "precio": 5,
            "nombre": "hamburguesa",
            "__v": 0,
            "descripcion": "pan con carne y/o huevo y papas ",
            "restaurant": "5bf705dc9825331b589ab82a"
        },
        {
            "fechaRegistro": "2018-11-22T19:58:55.129Z",
            "_id": "5bf70aaa1252bc1d76e00d53",
            "nombre": "salchipapa",
            "descripcion": "salchichas y papas ",
            "restaurant": "5bf705dc9825331b589ab82a",
            "precio": 7,
            "__v": 0
        }
    ],
    "cantidad": [
        10,
        10
    ],
    "fechaRegistro": "2018-11-26T19:37:56.713Z",
    "_id": "5bfc4b97eed0e01af885f9c6",
    "cliente": {
        "fechaRegistro": "2018-11-22T20:03:07.024Z",
        "_id": "5bf70c66a2b3d21dab526277",
        "nombre": "Gilda Choque",
        "email": "gilda@gmail.com",
        "telefono": 72457891,
        "ci": "75941253",
        "__v": 0
    },
    "restaurant": {
        "fechaRegistro": "2018-11-22T19:37:05.507Z",
        "_id": "5bf705dc9825331b589ab82a",
        "nombre": "La cazona",
        "nit": "12456245",
        "propietario": "5bf705719825331b589ab829",
        "calle": "Bolivar # 100",
        "log": 1.454851545,
        "lat": 1.2545166,
        "__v": 0,
        "telefono": 6245785
    },
    "pagoTotal": 120,
    "__v": 0
} */