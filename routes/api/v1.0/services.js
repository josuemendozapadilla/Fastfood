var express = require('express');
var multer = require('multer');
var router = express.Router();
var fs = require('fs');
var _ = require("underscore");

var Img = require("../../../database/collections/img");
var Menus = require("../../../database/collections/menus");
var Orden = require("../../../database/collections/orden");
var Restaurant = require("../../../database/collections/restaurant");
var Cliente = require("../../../database/collections/cliente");
var Users = require("../../../database/collections/users");
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
  var nombre = req.body.nombre;
  var password = req.body.password;
  var result = Users.findOne({nombre: nombre,password: password}).exec((err, doc) => {
    if (err) {
      res.status(200).json({
        msn : "No se puede concretar con la peticion "
      });
      return;
    }
    if (doc) {
      //res.status(200).json(doc);
      jwt.sign({nombre: doc.nombre, password: doc.password}, "secretkey123", (err, token) => {
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
  if (req.body.nombre == "" && req.body.nit == "") {
    res.status(400).json({
      "msn" : "Fallo de registro"
    });
    return;
  }
  var restaurant = {
    nombre : req.body.nombre,
    nit : req.body.nit,
    propiedad : req.body.propiedad,
    calle : req.body.calle,
    telefono : req.body.telefono,
    lat : req.body.lat,
    lon : req.body.lon,
    fotolugar : req.body.foto
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
  var propiedad = params.propiedad;
  var over = params.over;

  if (propiedad == undefined && over == undefined) {
    // filtra los datos que tengan en sus atributos lat y lon null;
    Restaurant.find({lat: {$ne: null}, lon: {$ne: null}}).exec( (error, docs) => {
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
    Restaurant.find({propiedad:propiedad, lat: {$ne: null}, lon: {$ne: null}}).exec( (error, docs) => {
      res.status(200).json(
        {
          info: docs
        }
      );
    })
    return;
  } else if ( over == "true") {
    Restaurant.find({propiedad: {$gt:propiedad}, lat: {$ne: null}, lon: {$ne: null}}).exec( (error, docs) => {
      res.status(200).json(
        {
          info: docs
        }
      );
    })
  } else if (over == "false") {
    Restaurant.find({propiedad: {$lt:propiedad}, lat: {$ne: null}, lon: {$ne: null}}).exec( (error, docs) => {
      res.status(200).json(
        {
          info: docs
        }
      );
    })
  }
});
// Read only one user
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
      "msn" : "Existe un error en el formato de envio puede hacer uso del metodo patch si desea editar solo un fragmentode la informacion"
    });
    return;
  }

  var restaurant = {
    nombre : req.body.nombre,
    nit : req.body.nit,
    propiedad : req.body.propiedad,
    calle : req.body.calle,
    telefono : req.body.telefono,
    lat : req.body.lat,
    lon : req.body.lon

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
router.post("/menus", (req, res) => {
  //Ejemplo de validacion
  if (req.body.nombre == "" && req.body.precio == "") {
    res.status(400).json({
      "msn" : " Error al registrar"
    });
    return;
  }
  var menus = {
    nombre : req.body.nombre,
    precio : req.body.precio,
    descripcion : req.body.descripcion,
    fotodelproducto : req.body.fotodelproducto
  };
  var menusData = new Menus(menus);

  menusData.save().then( (rr) => {
    //content-type
    res.status(200).json({
      "id" : rr._id,
      "msn" : "Mostrando menus con exito "
    });
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
      "msn" : "Existe un error en el formato de envio puede hacer uso del metodo patch si desea editar solo un fragmentode la informacion"
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
  var id = url.split("/")[2];
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
      "msn" : "Existe un error en el formato de envio puede hacer uso del metodo patch si desea editar solo un fragmentode la informacion"
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
router.post("/orden",(req, res) => {
  //Ejemplo de validacion
  console.log(req.body);
  if (req.body.Idmenus == "" && req.body.Idcliente== "") {
    res.status(400).json({
      "msn" : "formato incorrecto"
    });
    return;
  }

  var orden = {
    Idmenus : req.body.Idmenus,
    Idrestaurant: req.body.Idrestaurant,
    Idcliente : req.body.Idcliente,

    ShippinAddress:{
      lon:req.body.lon,
      lat:req.body.lat
    },

    Orden:[
      {
        id: req.body.id,
        cantidad:req.body.cantidad,
        precio:req.body.precio

      }
    ],
  Pago_Total : req.body.Pago_Total,

  };
  var ordenData = new Orden(orden);

  ordenData.save().then( (rr) => {
    //content-type
    res.status(200).json({
      "id" : rr._id,
      "msn" : "Mostrando con exito la orden"
    });
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
          "msn": "Error no se pudo actualizar los datos"
        });
        return;
      }
      res.status(200).json(params);
      return;
  });
});

router.post("/users", (req, res) => {
  //Ejemplo de validacion
  if (req.body.nombre == "" && req.body.ci == "") {
    res.status(400).json({
      "msn" : "formato incorrecto"
    });
    return;
  }
  var users = {
    Nombre : req.body.Nombre,
    Ci : req.body.Ci,
    Email : req.body.Email,
    Password: req.body.Password,
    Telefono : req.body.Telefono
  };
  var usersData = new Users(users);

  usersData.save().then( (rr) => {
    //content-type
    res.status(200).json({
      "msn" : "uregistro exitoso con exito "
    });
  });
});
router.get("/users", (req, res, next) =>{
  Users.find({}).exec((error, docs) => {
    res.status(200).json(docs);
  });
});

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
  })
});

//elimina un restaurant
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
//Actualiza los datos del restaurant
router.put(/users\/[a-z0-9]{1,}$/, (req, res) => {
  var url = req.url;
  var id = url.split("/")[2];
  var keys  = Object.keys(req.body);
  var oficialkeys = ['nombre', 'ci', 'email', 'password', 'telefono'];
  var result = _.difference(oficialkeys, keys);
  if (result.length > 0) {
    res.status(400).json({
      "msn" : "Exiiste el usuario"
    });
    return;
  }

  var users = {
    nombre : req.body.nombre,
    ci : req.body.ci,
    email : req.body.gmail,
    password: req.body.password,
    telefono : req.body.telefono
  };
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

module.exports = router;
