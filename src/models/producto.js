'use strict'

var mongoose = require("mongoose")
var Schema = mongoose.Schema;

var productoSchema = Schema({
    nombreProducto: String,
    descripcion: String,
    stock: Number,
    empresa: { type: Schema.ObjectId, ref: 'empresa' }
})

module.exports = mongoose.model('producto', productoSchema);