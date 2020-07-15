'use strict'

//importar modelo
var Sucursal = require('../models/sucursal')
var Empleado = require('../models/empleado')
var Producto = require('../models/producto')

function crearSucursal(req, res) {
    var sucursal = new Sucursal();
    var params = req.body

    if(params.nombre && params.direccion){
        sucursal.nombre = params.nombre;
        sucursal.direccion = params.direccion;
        sucursal.empresa = req.empresa.sub;

        Sucursal.find({ $or: [
            {nombre: sucursal.nombre}
        ]}).exec((err, empresas) => {
            if(err) return res.status(500).send({message}).send({message: 'Error en la peticion de sucursales'})
            if(empresas && empresas.length >= 1){
                return res.status(500).send({message: 'El nombre de esta sucursal ya está registrado'})
            }else{
                    
                    sucursal.save((err, sucursalGuardada) => {
                        if(err) return res.status(500).send({message: 'error al guardar la sucursal'})
                        if(sucursalGuardada){
                            res.status(200).send({sucursal: sucursalGuardada})
                        }else{
                            res.status(404).send({message: 'no se ha podido registrar la sucursal'})
                        }
                        
                    })
                
            }
        })
    }else{
        res.status(200).send({
            message: 'Rellene todos los datos necesarios'
        })
    }
}

function eliminarSucursal(req, res){
    var sucursalId = req.params.id

    Sucursal.findById(sucursalId, (err, sucursalEncontrada)=>{
        if(err) return res.status(500).send({ message: "Error en la peticion" })
        if(!sucursalEncontrada) return res.status(404).send({ message: 'error al listar las sucursales' })

            if (sucursalEncontrada.empresa == req.empresa.sub) {

                 Sucursal.findByIdAndDelete(sucursalId, (err, sucursalEliminada) =>{
                        if(err) return res.status(500).send({ message: 'error en la peticion' })
                        if(!sucursalEliminada) return res.status(404).send({ message: 'no se ha podido eliminar la sucursal' })
                        Empleado.updateMany({"ubicacion.sucursal": sucursalEncontrada._id}, {"ubicacion.sucursal":[]}).exec();
                        return res.status(200).send({ message: 'sucursalEliminada' })
                 })

}else{
    return res.status(404).send({ message: 'usted no tiene los permisos para eliminar esta sucursal' })
}
})
}

function editarSucursal(req, res){
    var sucursalId = req.params.id
    var params = req.body


    Sucursal.findById(sucursalId, (err, sucursalEncontrada)=>{
        if(err) return res.status(500).send({ message: 'Error en la peticion se sucursales' })
        if(!sucursalEncontrada) return res.status(404).send({ message: 'error al listar las sucursales'})

        if (sucursalEncontrada.empresa == req.empresa.sub) {
            Sucursal.findByIdAndUpdate(sucursalId, params, {new: true}, (err, sucursalActualizada) =>{
                if(err) return res.status(500).send({ message: 'error en la peticion' })
                if(!sucursalActualizada) return res.status(404).send({ message: 'no se ha podido editar el usuario' })
                Empleado.updateMany({"ubicacion.sucursal": sucursalEncontrada._id}, {"ubicacion.sucursal": sucursalActualizada._id}).exec();
                return res.status(200).send({ sucursal: sucursalActualizada })
            })
        } else {
            return res.status(404).send({ message: 'Usted no tiene permisos para modificar esta sucursal'})
        }
    })
    
}

function agregarProductoSucursal(req, res) {
    var datos = req.body;
    var productoId = datos.productoId;
    var cantidad = datos.cantidad;
    var sucursalId = req.params.id;
    var empresaId = req.empresa.sub;

    Sucursal.findOne({_id: sucursalId}, (err, sucursalEncontrada)=>{
        if(err) return res.status(500).send({ message: 'error en la peticion de sucursales' })
        if(!sucursalEncontrada) return res.status(404).send({ message: 'error al listar las sucursales'})
        
        Producto.findOne({_id: productoId}, (err, productoEcontrado)=>{
            if(err) return res.status(500).send({ message: 'error en la peticion de productos' })
            if(!productoEcontrado) return res.status(404).send({ message: 'error al listar los productos' })
            if(sucursalEncontrada.empresa[0] == productoEcontrado.empresa[0] && productoEcontrado.empresa == empresaId) {
                Sucursal.countDocuments({"listaProductos.codigoProducto": productoEcontrado._id, empresa: sucursalEncontrada.empresa, _id: sucursalEncontrada._id}, (err, productosYaRegistrados)=>{
                    if(productosYaRegistrados == 0) {
                        if(productoEcontrado.stock < cantidad) return res.status(500).send({ message: 'es posible que ya no hayan existencia de este producto o no haya suficientes' })
                        var stockTotal = productoEcontrado.stock - cantidad;
                        Sucursal.findByIdAndUpdate(sucursalId, { $push: { listaProductos: { nombreProducto: productoEcontrado.nombreProducto, stock: cantidad, codigoProducto: productoEcontrado._id } } }, {new: true}, (err, sucursalActualizada) =>{
                            if(err) return res.status(500).send({ message: 'Error en la peticion de sucursal' })
                            if(!sucursalActualizada) return res.status(404).send({ message: 'error al asignar las unidades' })
                            Producto.update({ _id: productoEcontrado._id}, {stock: stockTotal}).exec();
                            return res.status(200).send({sucursalActualizada, resultado: (" quedan: " + stockTotal + " unidades de " + productoEcontrado.nombreProducto) })
                        })

                    }else{
                        return res.status(500).send({ message: 'este producto ya está registrado en esta sucursal' })
                    }
                })
            } else {
                return res.status(500).send({ message: 'la sucursal, el producto o la empresa no coninciden' })
            }
        })
    })
}


function editarProductoSucursal(req, res) {
    var sucursalId = req.params.id;
    var datos = req.body;
    var productoId = datos.productoId;
    var cantidad = datos.cantidadAdicional;
    
    Sucursal.findById(sucursalId, (err, sucursalEncontrada)=>{
        if(err) return res.status(500).send({ message: 'error en la peticion de sucursales' })
        if(!sucursalEncontrada) return res.status(404).send({ message: 'error al listar las sucursales' })
      

        if(sucursalEncontrada.empresa == req.empresa.sub) {
            Producto.findById(productoId, (err, productoEcontrado)=>{
                if(err) return res.status(500).send({ message: 'error en la peticion de productos' })
                if(!productoEcontrado) return res.status(404).send({ message: 'error al listar los productos' })
                //return res.send({ productoEcontrado })
                Sucursal.findOneAndUpdate({_id: sucursalId, "listaProductos.codigoProducto": productoId}, {$inc:{"listaProductos.$.stock": cantidad}}, {new: true}, (err, sucursalActualizada)=>{
                    if(err) return res.status(500).send({ message: 'Error en la peticion de Comentarios' })
                    if(!sucursalActualizada) return res.status(404).send({ message: 'error al editar el comentario' })
                    Producto.update({_id: productoEcontrado._id}, { $inc: { stock : -cantidad} }).exec();
                    var cantidadRestante = productoEcontrado.stock - cantidad;
                    return res.status(200).send({sucursalActualizada, resultado:("quedan: " + cantidadRestante + " unidades de " + productoEcontrado.nombreProducto) })
                })
            
            })
        }else{
            return res.status(500).send({ message: 'no tiene permiso para modificar esta sucursal' })
        }
    })
}

function obtenerSucursales(req, res) {
    var empresaId = req.empresa.sub;

    Sucursal.find({empresa: empresaId}, (err, sucursalesEcontradas)=>{
        if(err) return res.status(500).send({message: 'Error en la´peticion se sucursales'})
        if(!sucursalesEcontradas) return res.status(404).send({ message: 'error al listar las sucursales' })
        if(sucursalesEcontradas.length == 0) return res.send({ message: 'Esta empresa no tiene sucursales' })
        return res.status(200).send({ "sus sucursales": sucursalesEcontradas })
    })
}

module.exports = {
    crearSucursal,
    eliminarSucursal,
    editarSucursal,
    agregarProductoSucursal,
    editarProductoSucursal,
    obtenerSucursales
}