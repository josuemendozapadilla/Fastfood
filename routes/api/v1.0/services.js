var express = require('express');
var multer = require('multer');
var router = express.Router();
var fs = require('fs');
var _ = require("underscore");

var Img = require("../../../database/collections/img");
const Menus = require("../../../database/collections/menus");
const Orden = require("../../../database/collections/orden");
const Restaurant = require("../../../database/collections/restaurant");
var Cliente = require("../../../database/collections/cliente");
const Users = require("../../../database/collections/users");
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
  var Nombre = req.body.Nombre;
  var Password = req.body.Password;
  var result = Users.findOne({Nombre: Nombre,Password: Password}).exec((err, doc) => {
    if (err) {
      res.status(200).json({
        msn : "No se puede concretar con la peticion "
      });
      return;
    }
    if (doc) {
      //res.status(200).json(doc);
      jwt.sign({Nombre: doc.Nombre, Password: doc.Password}, "secretkey123", (err, token) => {
          console.log(err);
          res.status(200).json({
            token : token
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
router.post("/restaurant", (req, res) => {
  //Ejemplo de validacion
  if (req.body.Nombre == "" && req.body.Nit == "") {
    res.status(400).json({
      "msn" : "Fallo de registro"
    });
    return;
  }
  var restaurant = {
    Nombre : req.body.Nombre,
    Nit : req.body.Nit,
    Propiedad : req.body.Propiedad,
    Calle : req.body.Calle,
    Telefono : req.body.Telefono,
    Lat : req.body.Lat,
    Lon : req.body.Lon
  };
  var restaurantData = new Restaurant(restaurant);

  restaurantData.save().then( (rr) => {
    //content-type
    res.status(200).json({
      "id" : rr._id,
      "msn" : "restaurant Registrado con exito "
    });
  });
});
router.get("/restaurant", (req, res, next) => {
  var params = req.query;
  console.log(params);
  var Propiedad = params.Propiedad;
  var over = params.over;

  if (Propiedad == undefined && over == undefined) {
    // filtra los datos que tengan en sus atributos lat y lon null;
    Restaurant.find({Lat: {$ne: null}, Lon: {$ne: null}}).exec( (error, docs) => {
      res.status(200).json(
        {
          info: docs
        }
      );
    })
    return;
  }
  if (over == "equals") {
    console.log("--------->>>>>>>")
    Restaurant.find({Propiedad:Propiedad, Lat: {$ne: null}, Lon: {$ne: null}}).exec( (error, docs) => {
      res.status(200).json(
        {
          info: docs
        }
      );
    })
    return;
  } else if ( over == "true") {
    Restaurant.find({Propiedad: {$gt:Propiedad}, Lat: {$ne: null}, Lon: {$ne: null}}).exec( (error, docs) => {
      res.status(200).json(
        {
          info: docs
        }
      );
    })
  } else if (over == "false") {
    Restaurant.find({Propiedad: {$lt:Propiedad}, Lat: {$ne: null}, Lon: {$ne: null}}).exec( (error, docs) => {
      res.status(200).json(
        {
          info: docs
        }
      );
    })
  }
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
  var oficialkeys = ['Nombre', 'Nit', 'Propiedad', 'Calle', 'Telefono', 'Lat', 'Lon'];
  var result = _.difference(oficialkeys, keys);
  if (result.length > 0) {
    res.status(400).json({
      "msn" : "error nose puede  actualizar  utilice patch  para la actualizar"
    });
    return;
  }

  var restaurant = {
    Nombre : req.body.Nombre,
    Nit : req.body.Nit,
    Propiedad : req.body.Propiedad,
    Calle : req.body.Calle,
    Telefono : req.body.Telefono,
    Lat : req.body.Lat,
    Lon : req.body.Lon

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
router.post("/menus", function(req, res, next) {
  //Ejemplo de validacion
  /*if (req.body.nombre == "" && req.body.precio == "") {
    res.status(400).json({
      "msn" : " Error al registrar"
    });
    return;
  }*/
  const datos = {
    Nombre : req.body.Nombre,
    Telefono : req.body.Telefono,
    Ci  : req.body.Ci,
    Descripcion : req.body.Descripcion,
    Restaurant : req.body.Restaurant,
    Precio : req.body.Precio

  };
  var modelMenus = new Menus(datos);

  modelMenus.save().then( result => {
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
router.get("/menus", (req, res, next) =>{
  var me
  Menus.find({}).exec((error, docs) => {
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

    res.status(200).json({
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
router.patch(/menus\/[a-z0-9]{1,}$/, (req, res) => {
  var url = req.url;
  var id = url.split("/")[2];
  var keys = Object.keys(req.body);
  var menus = {};
  for (var i = 0; i < keys.length; i++) {
    menus[keys[i]] = req.body[keys[i]];
  }
  console.log(menus);
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
    nombre : req.body.nombre,
    precio : req.body.precio,
    descripcion : req.body.descripcion

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
    apellido : req.body.apellido,
    ci : req.body.ci,
    telefono : req.body.telefono,
    gmail : req.body.gmail
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
  var menus = {};
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
    apellido : req.body.apellido,
    ci : req.body.ci,
    telefono : req.body.telefono,
    gmail : req.body.gmail
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
        Cliente: req.body.Cliente,
        Lugar_Envio: req.body.Lugar_Envio,
        Restaurant: req.body.Restaurant,
        Menus: req.body.Menus,
    };

    let Precios = req.body.Precios;
    let Cantidad = req.body.Cantidad;
    let pagoTotal = 0;

    if (Array.isArray(Cantidad) && Array.isArray(Precios)) {
        for (let index = 0; index < Precios.length; index++) {
            Pago_Total += +Precios[index] * +Cantidad[index];
            console.log(Cantidad[index]);
        };
    } else {
        Pago_Total = +Cantidad * +Precios
    }
    //console.log(precios);
    datos.Cantidad = Cantidad;
    datos.Pago_Total = Pago_Total;
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
