var express = require('express');
const multer = require('multer');
var router = express.Router();
var fs = require('fs');
var _ = require("underscore");

var Img = require("../../../database/collections/img");

var Menus = require("../../../database/collections/../../database/collections/menus");
var Orden = require("../../../database/collections/../../database/collections/orden");
var Restaurant = require("../../../database/collections/../../database/collections/restaurant");
var Cliente = require("../../../database/collections/../../database/collections/cliente");
var Users = require("../../../database/collections/../../database/collections/users");
var Detalle = require("../../../database/collections/../../database/collections/detalle");

var jwt = require("jsonwebtoken");


const storage = multer.diskStorage({
  destination: function (res, file, cb) {
      try {
          fs.statSync('./public/avatars');
      } catch (e) {
          fs.mkdirSync('./public/avatars');
      }

      cb(null, './public/avatars');
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
  //fileFilter: fileFilter,
  /*limits: {
      fileSize: 1024 * 1024 * 5
  }*/
})

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
    console.log(doc);
    if (doc) {
       console.log(result);
      //res.status(200).json(doc);
      jwt.sign({name: doc.email, password: doc.password}, "secretkey123", (err, token) => {
          console.log(result);
          res.status(200).json({
            resp:200,
            token : token,
            dato:doc
          });
      })
    } else {
      res.status(400).json({
        resp: 400,
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
router.get("/restaurant",  (req, res) => {
  var skip = 0;
  var limit = "";
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
    res.json({
      result : docs
    });
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

  res.json({
    result : docs
  
    });
  })
});
//elimina un restaurant
/*router.delete(/restaurant\/[a-z0-9]{1,}$/, verifytoken, (req, res) => {
  var url = req.url;
  var id = url.split("/")[2];
  Restaurant.find({_id : id}).remove().exec( (err, docs) => {
      res.status(200).json(docs);
  });
});*/
router.delete('/restaurant/:id',  (req, res, )=> {
  var idRestaurant = req.params.id;

  Restaurant.findByIdAndRemove(idRestaurant).exec()
      .then(() => {
        res.status(200).json({
          "resp": 200,
          "msn" :  "eliminado con exito"
        });
      }).catch(err => {
          res.status(500).json({
              error: err
          });
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
router.put(/restaurant\/[a-z0-9]{1,}$/, verifytoken,(req, res) => {
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
      res.status(200).json({
        "resp": 200,
        "dato": restaurant,
        "msn" :  "restaurant editado con exito"
      });
      return;
  });
});
/*RESTAURANT*/

router.post("/menus", (req, res) => {

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
    res.json({
      result : docs
    });
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

router.delete('/menus/:id', (req, res,) => {
  var idMenus = req.params.id;

  Menus.findByIdAndRemove(idMenus).exec()
      .then(() => {
         
      res.status(200).json({
        "resp": 200,
        "msn" :  "eliminado con exito"
      });
      }).catch(err => {
          res.status(500).json({
              error: err
         
            });

      });


});
//elimina un restaurant
/*router.delete(/menus\/[a-z0-9]{1,}$/, (req, res) => {
  var url = req.url;
  var id = url.split("/")[2];
  Menus.find({_id : id}).remove().exec( (err, docs) => {
    res.json({
        message: "Menu eliminado"
        });
  });
});*/
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
    res.status(200).json({
      "resp": 200,
      "dato": menus,
      "msn" :  "Menus  editado con exito"
    });
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
      res.status(200).json({
        "resp": 200,
        "dato": menus,
        "msn" :  "menus  editado con exito"
      });
      return;
  });
});

router.post("/cliente",  (req, res) => {

  
  var data = req.body;
  data ["registerdate"] = new Date();
  var newcliente = new Cliente(data);
  newcliente.save().then((rr) =>{
    res.status(200).json({
      "resp": 200,
      "dato": newcliente,
      "msn" :  "cliente  agregado con exito"
    });
  });
});
router.get("/cliente",(req, res) => {
  var skip = 0;
  var limit = 10;
  if (req.query.skip != null) {
    skip = req.query.skip;
  }

  if (req.query.limit != null) {
    limit = req.query.limit;
  }
  Cliente.find({}).skip(skip).limit(limit).exec((err, docs) => {
    if (err) {
      res.status(500).json({
        "msn" : "Error en la db"
      });
      return;
    }
    res.json({
      result : docs
    });
  });
});

/*router.get("/cliente", (req, res, ) =>{
  Cliente.find({}).exec((error, docs) => {
    
    res.status(200).json({
      "msn" : "No existe el pedido "
    });
  });
});*/

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

//elimina un cliente
router.delete(/cliente\/[a-z0-9]{1,}$/, (req, res) => {
  var url = req.url;
  var id = url.split("/")[2];
  Cliente.find({_id : id}).remove().exec( (err, docs) => {
    res.json({
        message: "cliente eliminado"
        });
  });
});
//Actualizar solo x elementos
router.patch(/cliente\/[a-z0-9]{1,}$/, (req, res) => {
  var url = req.url;
  var id = url.split( "/")[4];
  var keys = Object.keys(req.body);
  var cliente = {
    nombre : req.body.nombre,
    ci : req.body.ci,
    telefono : req.body.telefono,
    email : req.body.email,

  };
  console.log(cliente);
  Cliente.findOneAndUpdate({_id: id}, cliente, (err, params) => {
      if(err) {
        res.status(500).json({
          "msn": "Error no se pudo actualizar los datos"
        });
        return;
      }
      res.status(200).json({
        "resp": 200,
        "dato": cliente,
        "msn" :  "cliente  editado con exito"
      });
      return;
  });
});
//Actualiza los datos del cliente
router.put(/cliente\/[a-z0-9]{1,}$/, (req, res) => {
  var url = req.url;
  var id = url.split("/")[2];
  var keys  = Object.keys(req.body);
  var oficialkeys = ['nombre', 'ci', 'telefono', 'email',];
  var result = _.difference(oficialkeys, keys);
  if (result.length > 0) {
    res.status(400).json({
      "msn" : "erorr no se puede actualizar intenten con patch"
    });fmulter
    return;
  }
  var cliente = {
    nombre : req.body.nombre,
    ci : req.body.ci,
    telefono : req.body.telefono,
    email : req.body.email,

  };
  Cliente.findOneAndUpdate({_id: id}, cliente, (err, params) => {
      if(err) {
        res.status(500).json({
          "msn": "Error no se pudo actualizar los datos"
        });
        return;
      }
      res.status(200).json({
        "resp": 200,
        "dato": cliente,
        "msn" :  "cliente  editado con exito"
      });
      return;
  });
});

//insertar datos de orden
router.post("/orden",  (req, res) => {

  
  var data = req.body;
  data ["registerdate"] = new Date();
  var neworden = new Orden(data);
  neworden.save().then((rr) =>{
    res.status(200).json({
      "resp": 200,
      "dato": neworden,
      "msn" :  "orden  agregado con exito"
    });
  });
});
router.get("/orden", (req, res, next) =>{
  Orden.find({}).populate("menus").populate("cliente").populate("restaurant").exec((error, docs) => {
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
//elimina una orden
router.delete('/orden/:id', (req, res,) => {
  var idOrden = req.params.id;

  Orden.findByIdAndRemove(idOrden).exec()
      .then(() => {
          res.json({
              message: "orden eliminado"
          });
      }).catch(err => {
          res.status(500).json({
              error: err
          });
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
      res.status(200).json({
        "resp": 200,
        "dato": orden,
        "msn" :  "orden  editado con exito"
      });
      return;
  });
});
//Actualiza los datos dela ordem
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
    menu : req.body.idmenu,
    restaurant : req.body.idrestaurant,
    cliente : req.body.idcliente,
    lugar_envio : req.body.lugar_envio,
    cantidad : req.body.cantidad,
    precio : req.body.precio,
    pagototal : req.body.pagototal
  };
  Orden.findOneAndUpdate({_id: id}, orden, (err, params) => {
      if(err) {
        res.status(500).json({
          "msn": "Error no se pudo actualizar los datos de la orden"
        });
        return;
      }
      res.status(200).json({
        "resp": 200,
        "dato": orden,
        "msn" :  "orden  editado con exito"
      });
      return;
  });
});
//insertar un nuevo usuario en la  base de datos
/*router.post('/users', function(req, res, next) {//definimos el nombre en plural
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

*/


const PDFDocument = require('pdfkit');
//const fs = require('fs');
var nodemailer = require('nodemailer'); // email sender function
router.get('/facturas/:id', function (req, res, next) {


    Orden.findById(req.params.id).populate('restaurant').populate('menus').populate('cliente').exec()
        .then(doc => {

            // Create a document

            pdf = new PDFDocument

            let idOrden = req.params.id;
            let writeStream = fs.createWriteStream(idOrden + '.pdf');
            pdf.pipe(writeStream);
            // Add another page

            pdf
                .fontSize(20)
                .text('Id de Factura : ' + idOrden, 100, 100)
                .moveDown()

            pdf.fontSize(12).text('Nombre o Razon Social ' + doc.cliente.nombre, {
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
            //pdf.rect(pdf.x, 0, 410, pdf.y).stroke()


            pdf.text('telefono :  ' + doc.cliente.nombre, {
                width: 412,
                align: 'left'
            })
            pdf.moveDown()

            pdf.text('DETALLE DE PEDIDO', {
                width: 412,
                align: 'center'
            })
            pdf.moveDown()
            pdf.text('Restaurant : ' + doc.restaurant.nombre, {
                width: 412,
                align: 'left'
            })
            pdf.moveDown()
            pdf.text('nit : ' + doc.restaurant.nit, {
                width: 412,
                align: 'left'
            })
            pdf.moveDown()
            pdf.text('direccion : ' + doc.restaurant.calle, {
                width: 412,
                align: 'left'
            })
            pdf.moveDown()
            pdf.text('telefono : ' + doc.restaurant.telefono, {
                width: 412,
                align: 'left'
            })
            pdf.moveDown()
            //image
             pdf.image('out2.png', pdf.x, pdf.y, {
                width: 300
            })

            pdf.text('nombre \n precio \n cantidad', {
                width: 412,
                height: 15,
                columns: 3,
                align: 'left'
            })
            pdf.moveTo(95, pdf.y)
                .lineTo(510, pdf.y).stroke()

            pdf.moveDown()
            console.log(pdf.x, pdf.y);
            pdf.rect(pdf.x - 5, pdf.y, 410, doc.menus.length * 20).stroke()

            for (let index = 0; index < doc.menus.length; index++) {
                //pdf.rect(pdf.x, pdf.y, 410, 15).stroke()
                pdf.text(doc.menus[index].nombre + '\n' + doc.menus[index].precio + '\n' + doc.cantidad[index], {
                    width: 412,
                    align: 'left',
                    height: 15,
                    columns: 3
                })
                pdf.moveDown()
            }
            pdf.text('total :  ' + doc.pago_total, {
                width: 412,
                align: 'right'
            })
            pdf.moveDown()



            pdf.text('Fecha de venta : ' + doc.Fecha_Registro.toString(), {
                width: 412,
                align: 'center'
            })
            pdf.moveDown()



            // Finalize PDF file
            pdf.end()



            //pdf.pipe(res.status(201));

            //res.status(500).json();

            //enviar el pdf al correo del cliente .

            //let config = JSON.parse(fs.readFileSync("config.json"))
            //console.log(config.password);

            var transporter = nodemailer.createTransport({
                service: 'gmail',
                secure: false,
                port: 25,
                auth: {

                    user: 'padillajosuemendoza8540940@gmail.com', //su correo ,del que se enviara el email
                    pass: ' //aqui va la contraseña de su correo

                },
                tls: {
                    rejectUnauthorized: false
                }
            });
            var mailOptions = {
                from: 'Api Rest Store!',
                to: 'padillajosuemendoza8540940@gmail.com',
                subject: 'Factura por servicio',
                text: 'Adjuntamos la factura por servicio de comidas',
                attachments: [{
                    path: "./" + idOrden + ".pdf"
                }]
            };

            writeStream.on('finish', function () {
                transporter.sendMail(mailOptions, function (error, info) {
                    if (error) {
                        console.log(error);
                        res.status(500).json({
                            error: error
                        });
                    } else {


                        pdf = new PDFDocument;
                        let writeStreamG = fs.createWriteStream(idOrden + '.pdf');
                        pdfg.pipe(writeStreamG);

                        pdfg.fontSize(20)
                            .text('Id de  : ' + idOrden, 100, 100)
                            .moveDown()

                        pdfg.fontSize(12).text('Nombre o Razon Social ' + doc.cliente.nombre, {
                            width: 412,
                            align: 'left'
                        })
                        pdfg.image('out2.png', pdfg.x, pdfg.y, {
                            width: 300
                        })
                        pdfg.end()

                        writeStreamG.on('finish', function () {
                            res.status(200).download('./' + idOrden + '.pdf');
                        });
                        console.log('done...!');

                    }
                });

            });

        }).catch(err => {
            res.status(500).json({
                error: err || "error"
            });
        });


    //doc.pipe(res.status(201));
});


/*const staticmap = require("staticmap");

router.get('/maps', function (req, res, next) {


    /*staticmap.getMap(staticmap.png({
            width: 500,
            height: 500
        }), 45.4724, -73.4520, 12)
        .then((image) => {
            image.save('out1.png');
        })
        .catch((err) => {
            console.log(err);
        });

    staticmap.getBox(staticmap.png({
            width: 500,
            height: 500
        }), 48.436034, 10.684891, 48.295985, 11.042633)
        .then((image) => {
            image.save('out2.png');
        })
        .catch((err) => {
            console.log(err);
        });*/

    /*staticmap.getMap(staticmap.png({
            width: 700,
            height: 700,
        }), -19.56604, -65.76899, 17)
        .then((image) => {
            //drawLine(x1, y1, x2, y2, color)
            image.drawLine(340, 340, 360, 340, "#ffffff");
            image.drawLine(340, 360, 360, 360, "#ffffff");
            image.drawLine(340, 340, 340, 360, "#ffffff");
            image.drawLine(360, 340, 360, 360, "#ffffff");
            image.drawLine(340, 340, 360, 360, "#ffffff");
            image.drawLine(360, 340, 340, 360, "#ffffff");
            image.drawLine(0, 30, 350, 360, "#ffffff");

            image.save('out2.png');
        })
        .catch((err) => {
            console.log(err);
        });
});*/
//insertar datos de] menu
router.post("/detalle",  (req, res) => {

  //Ejemplo de validacion
  var data = req.body;
  data ["registerdate"] = new Date();
  var newdetalle = new Detalle(data);
  newdetalle.save().then((rr) =>{
    res.status(200).json({
      "resp": 200,
      "dato": newrestaurant,
      "id" : rr._id,
      "msn" :  "pedidos agregado con exito"
    });
  });
});
router.get("/pedidos",(req, res) => {
  var skip = 0;
  var limit = 10;
  if (req.query.skip != null) {
    skip = req.query.skip;
  }

  if (req.query.limit != null) {
    limit = req.query.limit;
  }
  Pedidos.find({}).skip(skip).limit(limit).exec((err, docs) => {
    if (err) {
      res.status(500).json({
        "msn" : "Error en la db"
      });
      return;
    }
    res.json({
      result : docs
  });
});



//mostrar  por id detalle
router.get(/pedidos\/[a-z0-9]{1,}$/, (req, res) => {
  var url = req.url;
  var id = url.split("/")[2];
  Pedidos.findOne({_id : id}).exec( (error, docs) => {
    if (docs != null) {
        res.status(200).json(docs);
        return;
    }

    res.json({
      result : docs    });
  })
});
//elimina un restaurant
router.delete('/detalle/:id',  (req, res, )=> {
  var idDetalle = req.params.id;

  Orden.findByIdAndRemove(idOrden).exec()
      .then(() => {
          res.json({
              message: "Orden eliminado"
          });
      }).catch(err => {
          res.status(500).json({
              error: err
          });
      });


});
//Actualizar solo x elementos
router.patch(/pedidos\/[a-z0-9]{1,}$/, (req, res) => {
  var url = req.url;
  var id = url.split("/")[2];
  var keys = Object.keys(req.body);
  var pedidos = {};
  for (var i = 0; i < keys.length; i++) {
    pedidos[keys[i]] = req.body[keys[i]];
  }
  console.log(restaurant);
  Pedidos.findOneAndUpdate({_id: id}, pedidos, (err, params) => {
      if(err) {
        res.status(500).json({
          "msn": "Error no se pudo actualizar los datos"
        });
        return;
      }
      
      res.status(200).json({
        "resp": 200,
        "dato": orden,
        "msn" :  "orden  editado con exito"
      });
      return;
    
      });
  });
});

module.exports = router;