var express = require("express")
var sucursalController = require("../controllers/sucursalController")
var md_auth = require('../middlewares/authenticated')

var api= express.Router();
api.post('/crearSucursal', md_auth.ensureAuth, sucursalController.crearSucursal)
api.delete('/eliminarSucursal/:id', md_auth.ensureAuth, sucursalController.eliminarSucursal)
api.put('/editarSucursal/:id', md_auth.ensureAuth, sucursalController.editarSucursal)
api.put('/agregarProductoSucursal/:id', md_auth.ensureAuth, sucursalController.agregarProductoSucursal)
api.put('/editarProductoSucursal/:id', md_auth.ensureAuth, sucursalController.editarProductoSucursal)
api.get('/obtenerSucursales', md_auth.ensureAuth, sucursalController.obtenerSucursales)

module.exports = api;