var express = require('express');
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken'); // "npm install jsonwebtoken" instalamos e importamos para usar el json web token

var SEED = require('../config/config').SEED; // importo el seed dsd el archivo config.js

var app = express();

var Usuario = require('../models/usuario');


app.post('/', (req, res )=>{

    var body = req.body;

    Usuario.findOne({ email: body.email }, (err, usuarioDB)=>{

       
        if ( err ){
            return res.status(500).json({
                ok:false,
                mensaje:'Error al buscar usuarios',
                errors: err
            });
        }

        if (!usuarioDB){
            return res.status(500).json({
                ok:false,
                mensaje:'Credenciales incorrectas - email',
                errors: err
            });
        }

        // con la funcion compareSync, nos permite tomar el string q queremos verificar contra otro string q ya fue pasado por el hash
        // body.password(es lo q esta escribiendo el usuario) y lo comparo con usuariodb.password(es el q ya esta en la base d datos)
        // nos regresa un booleanod, true si es correcto, false si no.
        //hacemos el caso contrario(!), o sea si no hacen match 
        if( !bcrypt.compareSync( body.password, usuarioDB.password ) ){

            return res.status(400).json({
                ok: false,
                mensaje: 'Credenciales incorrectas - password',
                errors: err
            });

        }

        // Crear un token!!!
        // sign recibe varios parametros, el primero es la data q quiero colocar en el token(payload)
        // luego viene algo q nos haga unico nuestro token(SEED o semilla)
        // y al final el tiempo en q va a expirar, son 4 horas en este caso(14400)
        usuarioDB.password = ':)';        
        var token = jwt.sign({ usuario: usuarioDB }, SEED, { expiresIn: 14400 });

       
        res.status(200).json({
            ok: true,
            usuario: usuarioDB,
            token: token,
            id: usuarioDB.id
        });

    });


    

})










module.exports = app;


