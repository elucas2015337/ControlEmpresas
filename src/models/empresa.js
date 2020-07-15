'use stric'

var mongoose = require("mongoose")
var Schema = mongoose.Schema;

var empresaSchema = Schema({
    nombreEmpresa: String,
    numeroTelefono: String,
    direccion: String,
    pais: String,
    usuario: String,
    password: String
})

module.exports = mongoose.model('empresa', empresaSchema);