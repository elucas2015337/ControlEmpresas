var express = require("express")
var empresaController = require("../controllers/empresaController")
var md_auth = require('../middlewares/authenticated')

//RUTAS
var api = express.Router();
api.post('/registrarEmpresa', empresaController.registrarEmpresa)
api.put('/editarEmpresa/:id',md_auth.ensureAuth, empresaController.editarEmpresa)
api.delete('/eliminarEmpresa/:id', md_auth.ensureAuth,empresaController.eliminarEmpresa)
api.post('/login', empresaController.login)


module.exports = api;