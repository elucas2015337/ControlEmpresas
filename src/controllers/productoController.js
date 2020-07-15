'use strict'

//importar modelo
var Sucursal = require('../models/sucursal')
var Empleado = require('../models/empleado')
var Producto = require('../models/producto')

function crearProducto(req, res) {
    var producto = new Producto();
    var params = req.body

    if(params.nombreProducto && params.stock){
        producto.nombreProducto = params.nombreProducto;
        producto.descripcion = params.descripcion;
        producto.stock = params.stock;
        producto.empresa  = req.empresa.sub

        Producto.find({ $and: [
            {descripcion: producto.descripcion,
            empresa: producto.empresa}
        ]}).exec((err, productos) => {
            if(err) return res.status(500).send({message}).send({message: 'Error en la peticion de productos'})
            if(productos && productos.length >= 1){
                return res.status(500).send({message: 'Este producto ya existe'})
            }else{
                    
                    producto.save((err, productoGuardado) => {
                        if(err) return res.status(500).send({message: 'error al guardar el producto'})
                        if(productoGuardado){
                            res.status(200).send({producto: productoGuardado})
                        }else{
                            res.status(404).send({message: 'no se ha podido registrar el producto'})
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

function editarProducto(req, res) {
   var productoId = req.params.id;
   var params = req.body;
   var empresaId = req.empresa.sub;

   Producto.findById(productoId, (err, productoEcontrado)=>{
       if(err) return res.status(500).send({ message: 'error en la peticion de productos' })
       if(!productoEcontrado) return res.status(404).send({ message: 'Error al listar los productos' })

       if(productoEcontrado.empresa == empresaId) {
           Producto.findByIdAndUpdate(productoId, {nombreProducto: params.nombreProducto, $inc:{stock:params.stock}}, {new: true}, (err, productoActualizado)=>{
            if(err) return res.status(500).send({ message: 'error en la peticion' })
            if(!productoActualizado) return res.status(404).send({ message: 'no se ha podido modificar el producto' })
                Sucursal.updateMany({empresa: empresaId, listaProductos: {$elemMatch: {codigoProducto: productoId}}}, {"listaProductos.$.nombreProducto": productoActualizado.nombreProducto}, (err, sucursalActualizada)=>{
                    return res.status(200).send({ producto: productoActualizado,
                    sucursalActualizada })
                })
            
           })
       }else{
           return res.status(404).send({ message: 'no tienes permiso de modificar o eliminar este producto' })
       }
   })

}

function eliminarProducto(req, res) {
    var productoId = req.params.id;
    var empresaId = req.empresa.sub;

    Producto.findById(productoId, (err, productoEcontrado)=>{
        if(err) return res.status(500).send({ message: 'error en la peticion de productos' })
        if(!productoEcontrado) return res.status(404).send({ message: 'Error al listar los productos' })
 
        if(productoEcontrado.empresa == empresaId) {
            Producto.findByIdAndDelete(productoId, (err, productoActualizado)=>{
             if(err) return res.status(500).send({ message: 'error en la peticion' })
             if(!productoActualizado) return res.status(404).send({ message: 'no se ha podido eliminar el producto' })
                 Sucursal.updateMany({empresa: empresaId, listaProductos: {$elemMatch: {codigoProducto: productoId}}}, {$pull:{listaProductos:{codigoProducto: productoId}}}, (err, sucursalActualizada)=>{
                     return res.status(200).send({ producto: "Producto Eliminado",
                     sucursalActualizada })
                 })
             
            })
        }else{
            return res.status(404).send({ message: 'no tienes permiso de modificar o eliminar este producto' })
        }
    })

}

function busquedaStock(req, res) {
    var empresaId = req.empresa.sub;
    var params = req.body;
    var parametro  = params.parametro;
    var sucursalId = params.sucursalId;

    if(sucursalId){
        Sucursal.findById(sucursalId, (err, sucursalEncontrada)=>{
            if(err) return res.status(200).send({ message: 'error en la peticion de sucursales' })
            if(!sucursalEncontrada) return res.status(404).send({ message: 'errr al listar las sucursales' })
            if(sucursalEncontrada.empresa == empresaId){
                Sucursal.find({"listaProductos.stock": parametro}, {$eq:{"listaProductos.nombreProducto": parametro}}, (err, sucursalBuscada)=>{
                        if(err) //{ console.log(err)
                        //return err}
                        return res.status(500).send({ message: 'no se ha encontrado este producto' })
                        if(!sucursalBuscada) return res.status(404).send({ message: 'no se ha encontrado este producto' })
                    return res.status(200).send({ stock: sucursalBuscada })
                })
            }else{
                return res.status(404).send({ message: 'No se puede buscar tu producto en esta sucursal' })
            }

        })
    }else{
        Producto.find({empresa: empresaId, stock: parametro}, (err, productosEncontrados)=>{
            if (err) return res.status
        })
    }

}

function busquedaNombre(req, res) {
    var empresaId = req.empresa.sub;
    var params = req.body;
    var parametro  = params.parametro;
    var sucursalId = params.sucursalId;

    if(sucursalId == null && parametro == null){
        Sucursal.find({empresa: req.empresa.sub}, (err, sucursalesEncontradas)=>{
            if(err) return res.status(500).send({ message: 'error en la peticion de sucursales' })
            if(!sucursalesEncontradas) return res.status(404).send({ message: 'errr al listar las sucursales' })

            if(sucursalesEncontradas.length == 0){
                return res.send({ message: 'no hay sucursales' })
            }else{
                return res.status(200).send({ sucursales: sucursalesEncontradas })
            }
        })

    }

    if(sucursalId){
        Sucursal.findById(sucursalId, (err, sucursalEncontrada)=>{
            if(err) return res.status(200).send({ message: 'error en la peticion de sucursales' })
            if(!sucursalEncontrada) return res.status(404).send({ message: 'errr al listar las sucursales' })

            if(sucursalEncontrada.empresa == empresaId){

                Sucursal.find({empresa: empresaId ,"listaProductos.nombreProducto": {$regex: parametro, $options: "i"}}, {"listaProductos.$.stock": 1, _id: 0}, (err, sucursalBuscada)=>{
                    if(err) //{ console.log(err)
                    //return err}
                    return res.status(500).send({ message: 'no se ha encontrado este producto' })
                    if(!sucursalBuscada) return res.status(404).send({ message: 'no se ha encontrado este producto' })
                return res.status(200).send({ Producto: sucursalBuscada })
            })

            }else{
                return res.status(404).send({ message: 'No se puede buscar tu producto en esta sucursal' })
            }

            
        })

    }else{
        Producto.find(
            {nombreProducto: {$regex: parametro, $options: "i"}, empresa: empresaId}
            , (err, productosEncontrados)=>{
            if(err) return res.status(500).send({ message: 'error en la peticion de Productos' })
            if(!productosEncontrados) return res.status(404).send({ message: 'no se han podido listar los productos' })
              
                    
                    return res.status(200).send({productos: productosEncontrados})
                
    
        })
    }
}

module.exports = {
    crearProducto,
    editarProducto,
    eliminarProducto,
    busquedaStock,
    busquedaNombre
}