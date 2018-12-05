var express = require('express');
var multer = require('multer');
var router = express.Router();
var fs = require('fs');
var _ = require("underscore");

var Img = require("../../../database/collections/img");
var Menus = require("../../../database/collections/../../database/collections/menus");
const Orden = require("../../../database/collections/../../database/collections/orden");
var Restaurant = require("../../../database/collections/../../database/collections/restaurant");
var Cliente = require("../../../database/collections/../../database/collections/cliente");
var Users = require("../../../database/collections/../../database/collections/users");
var jwt = require("jsonwebtoken");


var storage = multer.diskStorage({
  destination: "./public/avatars",
  filename: function (req, file, cb) {
    console.log("-------------------------");
    console.log(file);
    cb(null, "IMG_" + Date.now() + ".jpg");
  }
});
var upload = multer({
  storage: storage
}).single("img");;

/*
Login USER
*/
router.post("/login", (req, res, next) => {
  var email = req.body.email;
  var password = req.body.password;
  var result = Cliente.findOne({email: email,password: password}).exec((err, doc) => {
    if (err) {
      res.status(300).json({
        msn : "No se puede concretar con la peticion "
      });
      return;
    }
    if (doc) {
      //res.status(200).json(doc);
      jwt.sign({name: doc.email, password: doc.password}, "secretkey123", (err, token) => {
          console.log(err);
          res.status(200).json({
            resp:200,
            token : token,
            dato:result
          });
      })
    } else {
      res.status(200).json({
        msn : "El usuario no existe ne la base de datos"
      });
    }
  });
});
//Middelware
function verifytoken (req, res, next) {
  //Recuperar el header
  const header = req.headers["authorization"];
  if (header  == undefined) {
      res.status(403).json({
        msn: "No autorizado"
      })
  } else {
      req.token = header.split(" ")[1];
      jwt.verify(req.token, "secretkey123", (err, authData) => {
        if (err) {
          res.status(403).json({
            msn: "No autorizado"
          })
        } else {
          next();
        }
      });
  }
}
//CRUD Create, Read, Update, Delete
//Creation of users
router.post(/restaurantimg\/[a-z0-9]{1,}$/, (req, res) => {
  var url = req.url;
  var id = url.split("/")[2];
  upload(req, res, (err) => {
    if (err) {
      res.status(500).json({
        "msn" : "No se ha podido subir la imagen"
      });
    } else {
      var ruta = req.file.path.substr(6, req.file.path.length);
      console.log(ruta);
      var img = {
        idrestaurant: req.body.idrestaurant,
        name : req.file.originalname,
        physicalpath: req.file.path,
        relativepath: "http://localhost:7777" + ruta
      };
      var imgData = new Img(img);
      imgData.save().then( (infoimg) => {
        //content-type
        //Update User IMG
        var restaurant = {
          fotolugar: new Array()
        }
        Restaurant.findOne({_id:id}).exec( (err, docs) =>{
          //console.log(docs);
          var data = docs.fotolugar;
          console.log('data ', data);

          var aux = new  Array();
          if (data.length == 1 && data[0] == "") {
            Restaurant.fotolugar.push("/api/v1.0/restaurantimg/" + infoimg._id)
          } else {
            aux.push("/api/v1.0/restaurantimg/" + infoimg._id);
            data = data.concat(aux);
            Restaurant.fotolugar = data;
          }
          Restaurant.findOneAndUpdate({_id : id}, restaurant, (err, params) => {
              if (err) {
                res.status(500).json({
                  "msn" : "error en la actualizacion del usuario"
                });
                return;
              }
              res.status(200).json(
                req.file
              );
              return;
          });
        });
      });
    }
  });
});
router.get(/restaurantimg\/[a-z0-9]{1,}$/, (req, res) => {
  var url = req.url;
  var id = url.split("/")[2];
  console.log(id)
  Img.findOne({_id: id}).exec((err, docs) => {
    if (err) {
      res.status(500).json({
        "msn": "Sucedio algun error en el servicio"
      });
      return;
    }
    //regresamos la imagen deseada
    var img = fs.readFileSync("./" + docs.physicalpath);
    //var img = fs.readFileSync("./public/avatars/img.jpg");
    res.contentType('image/jpeg');
    res.status(200).send(img);
  });
});

/*RESTAURANT*/
router.post("/restaurant", verifytoken, (req, res) => {

  //Ejemplo de validacion
  var data = req.body;
  data ["registerdate"] = new Date();
  var newrestaurant = new Restaurant(data);
  newrestaurant.save().then((rr) =>{
    res.status(200).json({
      "resp": 200,
      "dato": newrestaurant,
      "id" : rr._id,
      "msn" :  "restaurante agregado con exito"
    });
  });
});
router.get("/restaurant",(req, res) => {
  var skip = 0;
  var limit = 10;
  if (req.query.skip != null) {
    skip = req.query.skip;
  }

  if (req.query.limit != null) {
    limit = req.query.limit;
  }
  Restaurant.find({}).skip(skip).limit(limit).exec((err, docs) => {
    if (err) {
      res.status(500).json({
        "msn" : "Error en la db"
      });
      return;
    }
    res.status(200).json(docs);
  });
});



//mostrar  por id los restaurant
router.get(/restaurant\/[a-z0-9]{1,}$/, (req, res) => {
  var url = req.url;
  var id = url.split("/")[2];
  Restaurant.findOne({_id : id}).exec( (error, docs) => {
    if (docs != null) {
        res.status(200).json(docs);
        return;
    }

    res.status(200).json({
      "msn" : "No existe el pedido "
    });
  })
});
//elimina un restaurant
router.delete(/restaurant\/[a-z0-9]{1,}$/, (req, res) => {
  var url = req.url;
  var id = url.split("/")[2];
  Restaurant.find({_id : id}).remove().exec( (err, docs) => {
      res.status(200).json(docs);
  });
});
//Actualizar solo x elementos
router.patch(/restaurant\/[a-z0-9]{1,}$/, (req, res) => {
  var url = req.url;
  var id = url.split("/")[2];
  var keys = Object.keys(req.body);
  var restaurant = {};
  for (var i = 0; i < keys.length; i++) {
    restaurant[keys[i]] = req.body[keys[i]];
  }
  console.log(restaurant);
  Restaurant.findOneAndUpdate({_id: id}, restaurant, (err, params) => {
      if(err) {
        res.status(500).json({
          "msn": "Error no se pudo actualizar los datos"
        });
        return;
      }
      res.status(200).json(params);
      return;
  });
});
//Actualiza los datos del restaurant
router.put(/restaurant\/[a-z0-9]{1,}$/, (req, res) => {
  var url = req.url;
  var id = url.split("/")[2];
  var keys  = Object.keys(req.body);
  var oficialkeys = ['nombre', 'nit', 'propiedad', 'calle', 'telefono', 'lat', 'lon'];
  var result = _.difference(oficialkeys, keys);
  if (result.length > 0) {
    res.status(400).json({
      "msn" : "error nose puede  actualizar  utilice patch  para la actualizar"
    });
    return;
  }

  var restaurant = {
    nombre : req.body.Nombre,
    nit : req.body.Nit,
    propiedad : req.body.Propiedad,
    calle : req.body.Calle,
    telefono : req.body.Telefono,
    lat : req.body.Lat,
    lon : req.body.Lon

  };
  Restaurant.findOneAndUpdate({_id: id}, restaurant, (err, params) => {
      if(err) {
        res.status(500).json({
          "msn": "Error no se pudo actualizar los datos"
        });
        return;
      }
      res.status(200).json(params);
      return;
  });
});
/*RESTAURANT*/
router.post("/menus", verifytoken, (req, res) => {

  //Ejemplo de validacion
  var data = req.body;
  data ["registerdate"] = new Date();
  var newmenus = new Menus(data);
  newmenus.save().then((rr) =>{
    res.status(200).json({
      "resp": 200,
      "dato": newmenus,
      "id" : rr._id,
      "msn" :  "menu  agregado con exito"
    });
  });
});

router.get("/menus",(req, res) => {
  var skip = 0;
  var limit = 10;
  if (req.query.skip != null) {
    skip = req.query.skip;
  }

  if (req.query.limit != null) {
    limit = req.query.limit;
  }
  Menus.find({}).skip(skip).limit(limit).exec((err, docs) => {
    if (err) {
      res.status(500).json({
        "msn" : "Error en la db"
      });
      return;
    }
    res.status(200).json(docs);
  });
});

router.get(/menus\/[a-z0-9]{1,}$/, (req, res) => {
  var url = req.url;
  var id = url.split("/")[2];
  Menus.findOne({_id : id}).exec( (error, docs) => {
    if (docs != null) {
        res.status(200).json(docs);
        return;
    }

    res.status(400).json({
      "respuesta":400,
      "msn" : "No existe el recurso seleccionado "
    });
  })
});

//elimina un restaurant
router.delete(/menus\/[a-z0-9]{1,}$/, (req, res) => {
  var url = req.url;
  var id = url.split("/")[2];
  Menus.find({_id : id}).remove().exec( (err, docs) => {
      res.status(200).json(docs);
  });
});
//Actualizar solo x elementos

router.patch("/menus",(req, res) => {
  var params = req.body;
  var id = req.query.id;
  //Collection of data
  var keys = Object.keys(params);
  var updatekeys = ["nombre", "precio", "descripcion", "foto"];
  var newkeys = [];
  var values = [];
  //seguridad
  for (var i  = 0; i < updatekeys.length; i++) {
    var index = keys.indexOf(updatekeys[i]);
    if (index != -1) {
        newkeys.push(keys[index]);
        values.push(params[keys[index]]);
    }
  }
  var objupdate = {}
  for (var i  = 0; i < newkeys.length; i++) {
      objupdate[newkeys[i]] = values[i];
  }
  console.log(objupdate);
  Menus.findOneAndUpdate({_id: id}, objupdate ,(err, docs) => {
    if (err) {
      res.status(500).json({
          msn: "Existe un error en la base de datos"
      });
      return;
    }
    var id = docs._id
    res.status(200).json({
      msn: id
    })
  });
});
//Actualiza los datos del restaurant
router.put(/menus\/[a-z0-9]{1,}$/, (req, res) => {
  var url = req.url;
  var id = url.split("/")[2];
  var keys  = Object.keys(req.body);
  var oficialkeys = ['nombre', 'precio', 'descripcion'];
  var result = _.difference(oficialkeys, keys);
  if (result.length > 0) {
    res.status(400).json({
      "msn" : "nose puede actualizar error  utilice el formato patch"
    });
    return;
  }

  var menus = {
    restaurant : req.body.restaurant,
    nombre : req.body.nombre,
    precio : req.body.precio,
    descripcion : req.body.descripcion,
    foto : req.body.foto

  };
  Menus.findOneAndUpdate({_id: id}, menus, (err, params) => {
      if(err) {
        res.status(500).json({
          "msn": "No se pudo actualizar los datos"
        });
        return;
      }
      res.status(200).json(params);
      return;
  });
});

router.post("/cliente", (req, res) => {
  //Ejemplo de validacion
  if (req.body.nombre == "" && req.body.ci == "") {
    res.status(400).json({
      "msn" : "Formato incorrecto"
    });
    return;
  }
  var cliente = {
    nombre : req.body.nombre,
    ci : req.body.ci,
    telefono : req.body.telefono,
    email : req.body.email,
    password : req.body.password
  };
  var clienteData = new Cliente(cliente);

  clienteData.save().then( (rr) => {
    //content-type
    res.status(200).json({
      "id" : rr._id,
      "msn" : "Mostrando menus con exito "
    });
  });
});
router.get("/cliente", (req, res, next) =>{
  Cliente.find({}).exec((error, docs) => {
    res.status(200).json(docs);
  });
});
router.get("/restaurant", (req, res, next) =>{
  Restaurant.find({}).exec((error, docs) => {
    res.status(200).json(docs);
  });
});

router.get(/cliente\/[a-z0-9]{1,}$/, (req, res) => {
  var url = req.url;
  var id = url.split("/")[2];
  Cliente.findOne({_id : id}).exec( (error, docs) => {
    if (docs != null) {
        res.status(200).json(docs);
        return;
    }

    res.status(200).json({
      "msn" : "No existe el pedido "
    });
  })
});

//elimina un restaurant
router.delete(/cliente\/[a-z0-9]{1,}$/, (req, res) => {
  var url = req.url;
  var id = url.split("/")[2];
  cliente.find({_id : id}).remove().exec( (err, docs) => {
      res.status(200).json(docs);
  });
});
//Actualizar solo x elementos
router.patch(/cliente\/[a-z0-9]{1,}$/, (req, res) => {
  var url = req.url;
  var id = url.split( "/")[2];
  var keys = Object.keys(req.body);
  var cliente = {};
  for (var i = 0; i < keys.length; i++) {
    cliente[keys[i]] = req.body[keys[i]];
  }
  console.log(cliente);
  Cliente.findOneAndUpdate({_id: id}, cliente, (err, params) => {
      if(err) {
        res.status(500).json({
          "msn": "Error no se pudo actualizar los datos"
        });
        return;
      }
      res.status(200).json(params);
      return;
  });
});
//Actualiza los datos del restaurant
router.put(/cliente\/[a-z0-9]{1,}$/, (req, res) => {
  var url = req.url;
  var id = url.split("/")[2];
  var keys  = Object.keys(req.body);
  var oficialkeys = ['nombre', 'apellido', 'ci', 'telefono', 'gmail'];
  var result = _.difference(oficialkeys, keys);
  if (result.length > 0) {
    res.status(400).json({
      "msn" : "erorr no se puede actualizar intenten con patch"
    });
    return;
  }
  var cliente = {
    nombre : req.body.nombre,
    ci : req.body.ci,
    telefono : req.body.telefono,
    email : req.body.email,
    password : req.body.password
  };
  Cliente.findOneAndUpdate({_id: id}, cliente, (err, params) => {
      if(err) {
        res.status(500).json({
          "msn": "Error no se pudo actualizar los datos"
        });
        return;
      }
      res.status(200).json(params);
      return;
  });
});
router.post('/orden', function (req, res, next) {
const datos = {
        cliente: req.body.cliente,
        restaurant: req.body.restaurant,
        menus: req.body.Menus,
        lugar_envio: req.body.lugar_envio,
    };

    let precios = req.body.Precios;
    let cantidad = req.body.Cantidad;
    let pagoTotal = 0;

    if (Array.isArray(cantidad) && Array.isArray(precios)) {
        for (let index = 0; index < precios.length; index++) {
            pago_total += +precios[index] * +cantidad[index];
            console.log(cantidad[index]);
        };
    } else {
        pago_total = +cantidad * +precios
    }
    //console.log(precios);
    datos.cantidad = cantidad;
    datos.pago_=total = pago_total;
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
router.get("/orden", (req, res, next) =>{
  Orden.find({}).exec((error, docs) => {
    res.status(200).json(docs);
  });
});

// Read only one user
router.get(/orden\/[a-z0-9]{1,}$/, (req, res) => {
  var url = req.url;
  var id = url.split("/")[2];
  Orden.findOne({_id : id}).exec( (error, docs) => {
    if (docs != null) {
        res.status(200).json(docs);
        return;
    }

    res.status(200).json({

        "array_texto":
          {
            "texto":"<b>orden</b>",
            "texto":"registrado con exito"
          }


    });
  })
});
//elimina un restaurant
router.delete(/orden\/[a-z0-9]{1,}$/, (req, res) => {
  var url = req.url;
  var id = url.split("/")[2];
  Orden.find({_id : id}).remove().exec( (err, docs) => {
      res.status(200).json(docs);
  });
});
//Actualizar solo x elementos
router.patch(/orden\/[a-z0-9]{1,}$/, (req, res) => {
  var url = req.url;
  var id = url.split("/")[2];
  var keys = Object.keys(req.body);
  var orden = {};
  for (var i = 0; i < keys.length; i++) {
    orden[keys[i]] = req.body[keys[i]];
  }
  console.log(orden);
  Orden.findOneAndUpdate({_id: id}, orden, (err, params) => {
      if(err) {
        res.status(500).json({
          "msn": "Error no se pudo actualizar los datos"
        });
        return;
      }
      res.status(200).json(params);
      return;
  });
});
//Actualiza los datos del restaurant
router.put(/orden\/[a-z0-9]{1,}$/, (req, res) => {
  var url = req.url;
  var id = url.split("/")[2];
  var keys  = Object.keys(req.body);
  var oficialkeys = ['idmenu', 'idrestaurant', 'cantidad', 'idcliente', 'lat', 'lon', 'pagototal'];
  var result = _.difference(oficialkeys, keys);
  if (result.length > 0) {
    res.status(400).json({
      "msn" : "Existe un error en el formato de envio puede hacer uso del metodo patch si desea editar solo un fragmentode la informacion"
    });
    return;
  }

  var orden = {
    idmenu : req.body.idmenu,
    idrestaurant : req.body.idrestaurant,
    cantidad : req.body.cantidad,
    idcliente : req.body.idcliente,
    lat : req.body.lat,
    lon : req.body.lon,
    pagototal : req.body.pagototal
  };
  Orden.findOneAndUpdate({_id: id}, orden, (err, params) => {
      if(err) {
        res.status(500).json({
          "msn": "Error no se pudo actualizar los datos de la orden"
        });
        return;
      }
      res.status(200).json(params);
      return;
  });
});
//insertar un nuevo usuario en la  base de datos
router.post('/users', function(req, res, next) {//definimos el nombre en plural
//el detalles era que no definiste la ruta como tal...osea ya esta ahora  no tengo problkemas para tabajar
//che man  solucionalo esta lo mismo que  isiste no  hay errror
//que parte?
  const datos = {
    Nombre: req.body.Nombre,
    Ci: req.body.Ci,
    Telefono: req.body.Telefono,
    Email: req.body.Email,
    Password: req.body.Password,
    Tipo_Usuario : req.body.Tipo_Usuario
  };
  var modelUsers = new Users(datos);

  modelUsers.save().then( result => {
    res.json({
      message: "usuario registrado  con exito "
    });
  })
  .catch(err => {
    res.status(500).json({
        erroikr: err
    })
  });
});
//muestra todos los usuarios existente de la tabla
router.get("/users", (req, res, next) =>{
  Users.find({}).exec((error, docs) => {
    res.status(200).json(docs);
  });
});
//muestra los usuarios por su id
router.get(/users\/[a-z0-9]{1,}$/, (req, res) => {
  var url = req.url;
  var id = url.split("/")[2];
  Users.findOne({_id : id}).exec( (error, docs) => {
    if (docs != null) {
        res.status(200).json(docs);
        return;
    }

    res.status(200).json({
      "msn" : "No existe el usuario "
    });
  });
});

//elimina  usuario
router.delete(/users\/[a-z0-9]{1,}$/, (req, res) => {
  var url = req.url;
  var id = url.split("/")[2];
  Users.find({_id : id}).remove().exec( (err, docs) => {
      res.status(200).json(docs);
  });
});
//Actualizar solo x elementos
router.patch(/users\/[a-z0-9]{1,}$/, (req, res) => {
  var url = req.url;
  var id = url.split("/")[2];
  var keys = Object.keys(req.body);
  var users = {};
  for (var i = 0; i < keys.length; i++) {
    users[keys[i]] = req.body[keys[i]];
  }
  console.log(users);
  Users.findOneAndUpdate({_id: id}, users, (err, params) => {
      if(err) {
        res.status(500).json({
          "msn": "Error no se pudo actualizar los datos"
        });
        return;
      }
      res.status(200).json(params);
      return;
  });
});
//Actualiza los datos del Usuario
router.put(/users\/[a-z0-9]{1,}$/, (req, res) => {
  var url = req.url;
  var id = url.split("/")[2];
  var keys  = Object.keys(req.body);
  var oficialkeys = ['Nombre', 'Ci', 'Telefono', 'Email', 'Password', 'Tipo_Usuario'];
  var result = _.difference(oficialkeys, keys);
  if (result.length > 0) {
    res.status(400).json({
      "msn" : "Existe el usuario"
    });
    return;
  }

  var users = {
    Nombre: req.body.Nombre,
    Ci: req.body.Ci,
    Telefono: req.body.Telefono,
    Email: req.body.Email,
    Password: req.body.Password,
    Tipo_Usuario : req.body.Tipo_Usuario,
  };
  Users.findOneAndUpdate({_id: id}, users, (err, params) => {
      if(err) {
        res.status(500).json({
          "msn": "Error no se pudo actualizar los datos del usuario"
        });
        return;
      }
      res.status(200).json(params);
      return;
  });
});




/*const PDFDocument = require('pdfkit');
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
    '<div id="pageFooter-last">Footer on last page</div>'

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

*/
module.exports = router;
