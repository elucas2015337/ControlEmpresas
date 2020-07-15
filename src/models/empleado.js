'use stric'

var mongoose = require("mongoose")
var Schema = mongoose.Schema;

var empleadoSchema = Schema({
    nombre: String,
    puesto: String,
    departamento: String,
    ubicacion: {
        empresa: [],
        sucursal: []
    },
})

module.exports = mongoose.model('empleado', empleadoSchema);