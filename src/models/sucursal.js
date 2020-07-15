'use stric'

var mongoose = require("mongoose")
var Schema = mongoose.Schema;

var sucursalSchema = Schema({
    nombre: String,
    direccion: String,
    listaProductos: [{
        nombreProducto: String,
        stock: Number,
        codigoProducto: { type: Schema.ObjectId, ref: 'producto' }
    }],
    empresa: { type: Schema.ObjectId, ref: 'empresa' }
})

module.exports = mongoose.model('sucursal', sucursalSchema);