'use strict'

//IMPORTS
var Empleado =  require('../models/empleado')
var Empresa = require('../models/empresa')
var Sucursal = require('../models/sucursal')

function crearEmpleado(req, res){
    var empleado = new Empleado();
    var params = req.body

    if(params.nombre && params.puesto && params.departamento){
        empleado.nombre = params.nombre
        empleado.puesto = params.puesto
        empleado.departamento = params.departamento;

                    empleado.ubicacion.empresa.push(req.empresa.sub)
                    empleado.ubicacion.empresa.push(req.empresa.nombreEmpresa)
                    empleado.save((err, empleadoCrado) => {
                        if(err) return res.status(500).send({message: 'error al crear el empleado'})
                        if(empleadoCrado){
                            res.status(200).send({empleado: empleadoCrado})
                        }else{
                            res.status(404).send({message: 'no se ha podido crear el empleado'})
                        }
                    })
                
           
        
    }else{
        res.status(200).send({
            message: 'Rellene todos los datos necesarios'
        })
    }
}

function editarEmpleado(req, res){
    var empleadoId = req.params.id
    var params = req.body
    
    Empleado.findById(empleadoId, (err, empleadoEncontrado)=>{
        if(err) return res.status(500).send({ message: "Error en la peticion" })
        if(!empleadoEncontrado) return res.status(404).send({ message: 'error al listar los empleados' })

        if (empleadoEncontrado.ubicacion.empresa[0] === req.empresa.sub) {

            Empleado.findByIdAndUpdate(empleadoId, params, {new: true}, (err, empleadoActualizado) =>{
                if(err) return res.status(500).send({ message: 'error en la peticion' })
                if(!empleadoActualizado) return res.status(404).send({ message: 'no se ha podido modificar la empresa' })
                return res.status(200).send({ empleado: empleadoActualizado })
            })
        }else{
            return res.status(404).send({ message: 'usted no tiene los permisos para modificar a este empleado' })
        }
    })
}

function eliminarEmpleado(req, res){
    var empleadoId = req.params.id

    Empleado.findById(empleadoId, (err, empleadoEncontrado)=>{
        if(err) return res.status(500).send({ message: "Error en la peticion" })
        if(!empleadoEncontrado) return res.status(404).send({ message: 'error al listar los empleados' })

            if (empleadoEncontrado.ubicacion.empresa[0] === req.empresa.sub) {

                 Empleado.findByIdAndDelete(empleadoId, (err, empleadoEliminado) =>{
                        if(err) return res.status(500).send({ message: 'error en la peticion' })
                        if(!empleadoEliminado) return res.status(404).send({ message: 'no se ha podido eliminar el empleado' })
                        return res.status(200).send({ message: 'empleado eliminado' })
                 })

}else{
    return res.status(404).send({ message: 'usted no tiene los permisos para eliminar a este empleado' })
}
})
}

function asignarSucursal(req, res) {
    var sucursalId = req.params.sucursalId
    var empresaId = req.empresa.sub
    var empleadoId = req.params.empleadoId

    Empleado.findById(empleadoId, (err, empleadoEncontrado)=>{
        if(err) return res.status(500).send({ message: 'error en la peticion de empleados' })
        if(!empleadoEncontrado) return res.status(404).send({ message: 'error al listar los empleados' })

        if (empleadoEncontrado.ubicacion.empresa[0] === empresaId) {
            Sucursal.findById(sucursalId, (err, sucursalEncontrada)=>{
                if(err) return res.status(500).send({ message: 'error en la peticion de sucursales' })
                if(!sucursalEncontrada) return res.status(404).send({ message: 'error al listar las sucursales' })

                if (sucursalEncontrada.empresa == empleadoEncontrado.ubicacion.empresa[0]) {
                    if(empleadoEncontrado.ubicacion.sucursal.length == 0){
                        Empleado.findByIdAndUpdate(empleadoId, {new: true}, (err, empleadoRegistrado)=>{
                            if(err) return res.status(500).send({ message: 'error en la peticion del empleado' })
                            if(!empleadoRegistrado) return res.status(404).send({ message: 'error al registrar el empleado en la sucursal' })
                            empleadoRegistrado.ubicacion.sucursal.push(sucursalEncontrada._id)
                            empleadoRegistrado.save()
                            return res.status(200).send({ message: (empleadoEncontrado.nombre + " ha sigo agregado a la sucursal: " + sucursalEncontrada.nombre) })
                        })
                    }else{
                        return res.status(404).send({ message: 'este empleado ya está asignado a una sucursal' })
                    }
                } else {
                    return res.status(404).send({ message: 'La sucursal solicitada no coincide con ninguna de las sucursales de la empresa a la que pertenece el empleado' })
                }
            })
            
        }else{
            return res.status(404).send({ message: 'No tienes los permisos necesarios para asignar este empleado' })
        }
    })
}


function buscarEmpleado(req, res) {
    var params = req.body;
    var parametro = params.parametro;
    
    if (parametro == null) {
        Empleado.countDocuments({}, (err, cantidadDeEmpleados)=>{
            if(err) res.status(500).send({ message: 'error en la peticion' })

        
        Empleado.find({}, (err, empleados) =>{
                if(err) return res.status(500).send({ message: 'error en la peticion' })
                return res.status(200).send({message: "Cantidad total de empleados: " + cantidadDeEmpleados , todosLosEmpleados: empleados })
            })

        })
    }else{
        Empleado.find({$or:
                [{nombre: {$regex: parametro, $options: "i"}},
                 {puesto: {$regex: parametro, $options: "i"}},
                {departamento:{$regex: parametro, $options: "i"}},
                {"ubicacion.empresa":{$regex: parametro, $options: "i"}},
                {"ubicacion.sucursal":{$regex: parametro, $options: "i"}}
                ]}, (err, empleadosEncontrados)=>{
                if(err) return res.status(500).send({ message: 'error en la peticion de empleados' })
                if(!empleadosEncontrados) return res.status(404).send({ message: 'no se han podido listar los empleados' })
                    Empleado.findById(parametro, (err, empleadosID)=>{
                        
                        if(empleadosID) return res.status(200).send({ empleado: empleadosID })
                        return res.status(200).send({empleados: empleadosEncontrados})
                    })
        
            })
        
    }
}


module.exports = {
    crearEmpleado,
    editarEmpleado,
    eliminarEmpleado,
    buscarEmpleado,
    asignarSucursal
}