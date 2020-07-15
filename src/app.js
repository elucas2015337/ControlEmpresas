'use strict'

//VARIABLES GLOBALES
const express = require("express")
const app = express()
const bodyparser = require("body-parser")

//CARGAR RUTAS
var empresaRoutes = require("./routes/empresaRoutes")
var empleadoRoutes = require("./routes/empleadoRoutes")
var sucursalRoutes = require("./routes/sucursalRoutes")
var productoRoutes = require("./routes/productoRoutes")

//MIDDLEWARES
app.use(bodyparser.urlencoded({extend: false}))
app.use(bodyparser.json());

//CABECERAS //CORS
app.use((req, res, next) =>{
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Authorization, X-API-KEY, Origin, X-Requested-whith, Content-Type, Accept, Access-Control-Allow-request-Method')
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE')
    res.header('Allow', 'GET, POST, OPTIONS, PUT, DELETE')

    next();
})

//RUTAS

app.use('/api', empresaRoutes, empleadoRoutes, sucursalRoutes, productoRoutes)


//EXPORTAR
module.exports = app;