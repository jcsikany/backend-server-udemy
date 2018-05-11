var express = require('express');
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken'); // "npm install jsonwebtoken" instalamos e importamos para usar el json web token

var SEED = require('../config/config').SEED; // importo el seed dsd el archivo config.js

var app = express();

var Usuario = require('../models/usuario');

// Google
var CLIENT_ID = require('../config/config').CLIENT_ID;
const {OAuth2Client} = require('google-auth-library');
const client = new OAuth2Client(CLIENT_ID); // El valor del CLIENT_ID lo tenemos en config.js

// ==================================
// Autenticacion de Google
// ==================================
//espera(await) hasta q verifyIdToken resuelva y cuando resuelve lo q sea q retorne lo graba en ticket
async function verify( token ) {
    const ticket = await client.verifyIdToken({
        idToken: token,
        audience: CLIENT_ID,    
    });
    //En el payload vamos a tener toda la informacion del usuario
    const payload = ticket.getPayload();
    // const userid = payload['sub'];
    // If request specified a G Suite domain:
    //const domain = payload['hd'];
    return {
        nombre: payload.name,
        email:payload.email,
        img: payload.picture,
        google: true        
    }
}

app.post('/google', async(req, res)=> {

    // obtenemos el token q viene en la peticion post
    let token = req.body.token;

    // googleUser espera(await) la respuesta de la funcion verify que es una promesa, le pasamos el token
    // esta funcion me va a regresar un usuario de google o me regresa un error en caso de q el token sea invalido.
    // el catch es el q recibe el error, 
    // si todo sale bien voy a tener en googleUser toda la informacion del return de verify, osea, nombre, email...
    // para poder usar el await es necesario q se ejecute en una funcion async
    let googleUser = await verify(token)
                        .catch( err => {
                            return res.status(403).json({
                                ok: false,
                                mensaje: 'Token no valido' 
                            });

                        })

    // Aca buscamos si el mail existe ya en la base de datos.
    Usuario.findOne( { email: googleUser.email }, (err, usuarioDB)=>{

        if ( err ){
            return res.status(500).json({
                ok:false,
                mensaje:'Error al buscar usuarios',
                errors: err
            });
        }

        if( usuarioDB ){
            // si el usuario existe y no se creo a traves de google entonces debe loguearse de forma normal, porq el mail d gmail lo uso
            // en la inscripcion normal.
            if (usuarioDB.google === false){
                return res.status(400).json({
                    ok:false,
                    mensaje:'Debe de usar su autenticacion normal'                    
                });

            } else{

                // si el usuario ya existe y anteriormente fue autenticado por google, tengo q generar un nuevo token y mandar la respuesta.
                var token = jwt.sign({ usuario: usuarioDB }, SEED, { expiresIn: 14400 });

                res.status(200).json({
                    ok: true,
                    usuario: usuarioDB,
                    token: token,
                    id: usuarioDB._id
                });
            }

        }else {
            // El usuario no existe, hay q crearlo
            var usuario = new Usuario();

            usuario.nombre = googleUser.nombre;
            usuario.email = googleUser.email;
            usuario.img = googleUser.img;
            usuario.google = true;
            usuario.password = ':)';


            usuario.save((err, usuarioDB) => {

                var token = jwt.sign({ usuario: usuarioDB }, SEED, { expiresIn: 14400 });

                res.status(200).json({
                    ok: true,
                    usuario: usuarioDB,
                    token: token,
                    id: usuarioDB._id
                });

            });


        }



    });

    
    

    // return res.status(200).json({
    //     ok: true,
    //     mensaje: 'OK!!!',
    //     googleUser: googleUser       
    // });

})





// ==================================
// Autenticacion normal
// ==================================
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
            id: usuarioDB._id
        });

    });   

})

module.exports = app;


