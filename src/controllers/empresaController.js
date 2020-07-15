'use strict'

//IMPORTS
var bcrypt = require('bcrypt-nodejs')
var Empresa =  require('../models/empresa')
var Empleado = require('../models/empleado')
var Sucursal = require('../models/sucursal')
var jwt  = require("../services/jwt")
var path = require('path')
var fs = require('fs')


function registrarEmpresa(req, res){
    var empresa = new Empresa();
    var params = req.body

    if(params.nombreEmpresa && params.password){
        empresa.nombreEmpresa = params.nombreEmpresa
        empresa.numeroTelefono = params.numeroTelefono
        empresa.direccion = params.direccion
        empresa.pais    = params.pais
        empresa.usuario = params.usuario
        empresa.password = params.password


        Empresa.find({ $or: [
            {usuario: empresa.usuario},
            {nombreEmpresa: empresa.nombreEmpresa},
            {numeroTelefono: empresa.numeroTelefono}
        ]}).exec((err, users) => {
            if(err) return res.status(500).send({message}).send({message: 'Error en la peticion de empresas'})
            if(users && users.length >= 1){
                return res.status(500).send({message: 'el usuario de empresa ya existe'})
            }else{
                bcrypt.hash(params.password, null, null, (err, hash) => {
                    empresa.password = hash;

                    empresa.save((err, empresaGuardada) => {
                        if(err) return res.status(500).send({message: 'error al guardar la empresa'})
                        if(empresaGuardada){
                            res.status(200).send({empresa: empresaGuardada})
                        }else{
                            res.status(404).send({message: 'no se ha podido registrar la empresa'})
                        }
                        
                    })
                })
            }
        })
    }else{
        res.status(200).send({
            message: 'Rellene todos los datos necesarios'
        })
    }
}


function login(req, res){
    var params = req.body
    

    Empresa.findOne({ usuario: params.usuario }, (err, empresa)=>{
        
    if(empresa){
        bcrypt.compare(params.password, empresa.password, (err, check)=>{
            if(check){
                if(params.gettoken){
                        Empresa.findOne({usuario: params.usuario}, {nombreEmpresa: 1, _id: 0} ,(err, empresaEncontrada)=>{
                            var nombreEmpresa = empresaEncontrada;
                            return res.status(200).send({ token: jwt.createToken(empresa), nombreEmpresa})
                        })
                        
                }else{
                    empresa.password = undefined;
                    return res.status(200).send({ user: empresa })
                }

            }else{
                return res.status(404).send({ message: 'El usuario no se ha podido identificar' })
            }
        })
    }else{
        return res.status(404).send({ message: 'El usuario no se ha podido logear' })
    }
    })
}

function editarEmpresa(req, res){
    var empresaId = req.params.id
    var params = req.body

    delete params.password

     if(req.empresa.sub != empresaId){
        return res.status(500).send({ message: 'no tiene los permisos para actualizar esta empresa' })

    }
    Empresa.findByIdAndUpdate(empresaId, params, {new: true}, (err, empresaActualizada) =>{
        if(err) return res.status(500).send({ message: 'error en la peticion' })
        if(!empresaActualizada) return res.status(404).send({ message: 'no se ha podido modificar la empresa' })
       return res.status(200).send({ empresa: empresaActualizada })
    })
}



function eliminarEmpresa(req, res){
    var empresaId = req.params.id


    if(req.empresa.sub != empresaId){
        return res.status(500).send({ message: 'no tiene los permisos para eliminar esta empresa' })

    }

    Empresa.findByIdAndDelete(empresaId, (err, empresaEliminada) =>{
        if(err) return res.status(500).send({ message: 'error en la peticion' })
        if(!empresaEliminada) return res.status(404).send({ message: 'no se ha podido eliminar la empresa' })
        Empleado.deleteMany({"ubicacion.empresa": empresaId}).exec();
        Sucursal.deleteMany({empresa: empresaId}).exec();
        return res.status(200).send({ message: 'empresaEliminada' })
    })
}

function asignarSucursales(req,res) {
    var sucursalId = req.params.sucursalId
    var empresaId = req.empresa.sub
    var asignado = false;


}





module.exports = {
    registrarEmpresa,
    editarEmpresa,
    eliminarEmpresa,
    login
}