var express = require("express")
var productoController = require("../controllers/productoController")
var md_auth = require('../middlewares/authenticated')

//RUTAS
var api = express.Router();
api.post('/crearProducto',md_auth.ensureAuth, productoController.crearProducto)
api.put('/editarProducto/:id', md_auth.ensureAuth, productoController.editarProducto)
api.delete('/eliminarProducto/:id', md_auth.ensureAuth, productoController.eliminarProducto)
api.get('/busquedaStock', md_auth.ensureAuth, productoController.busquedaStock)
api.get('/busquedaNombre', md_auth.ensureAuth, productoController.busquedaNombre)


module.exports = api;