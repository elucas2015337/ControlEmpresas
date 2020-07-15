'use strict'

var jwt = require('jwt-simple')
var moment = require('moment')
var secret = 'clave_secreta_2015337';

exports.createToken = function (empresa){
    var payload = {
        sub: empresa._id,
        nombreEmpresa: empresa.nombreEmpresa,
        numeroTelefono: empresa.numeroTelefono,
        direccion: empresa.direccion,
        pais: empresa.pais,
        usuario: empresa.usuario,
        iat: moment().unix(),
        exp: moment().day(30, 'days').unix() 
     }
     return jwt.encode(payload, secret)

}