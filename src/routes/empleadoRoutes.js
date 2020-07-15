var express = require("express")
var empleadoController = require("../controllers/empleadoController")
var md_auth = require('../middlewares/authenticated')

//RUTAS
var api = express.Router();
api.post('/crearEmpleado', md_auth.ensureAuth, empleadoController.crearEmpleado)
api.put('/editarEmpleado/:id', md_auth.ensureAuth, empleadoController.editarEmpleado)
api.delete('/eliminarEmpleado/:id', md_auth.ensureAuth, empleadoController.eliminarEmpleado)
api.get('/buscarEmpleados', empleadoController.buscarEmpleado)
api.put('/asignarSucursal/:sucursalId/:empleadoId', md_auth.ensureAuth, empleadoController.asignarSucursal)

module.exports = api;