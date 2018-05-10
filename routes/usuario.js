//En este archivo estoy separando las peticiones para q no queden todas amontonadas en app.js de la raiz

//necesito importar express.
var express = require('express');
var bcrypt = require('bcryptjs');// "npm install bcryptjs" instalo e importo donde necesito hacer una encriptacion d algun campo. En este caso la contraseña.
var jwt = require('jsonwebtoken'); // "npm install jsonwebtoken" instalamos e importamos para usar el json web token

var mdAutenticacion = require('../middlewares/autenticacion');

var app = express();

// Esto me permite poder utilizar todas las funciones y metodos que el modelo de usuario tiene en 'models/usuario.js'
var Usuario = require('../models/usuario');


// =========================
//OBTENER USUARIOS
// =========================
// app dsp viene q tipo de peticion voy a escuchar, en este caso get
// luego definimos dos cosas, primero el path '/' y dsp el segundo parametros es una funcion de callback
// recibe tres parametros, request, response y next(cuando se ejecute continue con la siguiente instruccion, eso dice el next.)
app.get('/', (req, res, next ) => {

    var desde = req.query.desde || 0;
    desde = Number(desde);// con esto me aseguro q sea un numero, a fuerza.

    // usamos el modelo de usuario y hacemos un find(funcion de mongoose) y dentro de llaves defino el query para la busqueda
    // En este caso buscamos todo por eso no pongo nada entre {}, dsp indicamos q campos queremos q muestre, ademas en el find agregamos otro arguemento
    // que es el resultado de esa busqueda, eso viene como un callback, recibimos dos parametros, un error y si todo funciona bien, en este caso tengo los usuarios
    // con limit() estamos diciendo q nos muestre la cantidad de registros q esta entre parentesis, 5 en este caso.
    // usamos skip() q es una funcion d mongoose, para decirle q me salte el numero de la variable 'desde' si en desde enviamos 5, se salta los primeros 5
    // en postamos lo pasoms asi "localhost:3000/usuario?desde=5" 
    Usuario.find({}, 'nombre email img role')
        .skip(desde)
        .limit(5)
        .exec((err, usuarios) => {

    // si existe un error va a hacer un return con status 500(internal server error) y nos muestra el mensaje en formato json.
        if( err ){
            return res.status(500).json({
                ok:false,
                mensaje:'Error cargando usuario',
                errors: err
            });
        }

        //Aca usamos otra funcion para hacer el conteo de registros q tenemos en usuarios.
        Usuario.count({}, (err, conteo)=> {
            
            // Si no sucede ningun error
            // mandamos las respuestas a las solicitudes q estamos realizando
            // en status pasamos el codigo d la peticion y regreso un arreglo d usuarios.
            res.status(200).json({
                ok: true,
                usuarios: usuarios, // como usamos los standares de ES6 no hace falta poner usarios: usuarios, solo con usuarios ya alcanza.
                total: conteo
            });          

        })
    
    });

})




// =========================
// Actualizar un usuario
// =========================
//Para actualizar podemos usar put o patch, para hacer esto en la ruta le pasamos el id quedaria, usuario/id por eso ponemos '/:id'
//Es necesario mandar un id para este recurso sino no va a funcionar.
app.put('/:id',mdAutenticacion.verificaToken, (req, res)=> {

    var id = req.params.id;
    var body = req.body;

    Usuario.findById( id, (err, usuario) => {

        
        //si retorna un error hacemos el return con el status 500, porq si el usuario no existe retorna un usuario null.
        if( err ){
            return res.status(500).json({
                ok:false,
                mensaje:'Error al buscar usuario',
                errors: err
            });
        }

        //aca controlamos si el usuario no existe, o sea es null.
        if( !usuario ){
            return res.status(400).json({
                ok:false,
                mensaje:'El usuario con el id' + id + 'no existe',
                errors: { message: 'No existe un usuario con ese ID'}
            });
        }

        usuario.nombre = body.nombre;
        usuario.email = body.email;
        usuario.role = body.role;

        usuario.save( (err, usuarioGuardado) =>{

            if( err ){
                return res.status(400).json({
                    ok:false,
                    mensaje:'Error al actualizar usuario',
                    errors: err
                });
            }

            usuarioGuardado.password = ':)';
    
            res.status(200).json({
                ok: true,
                usuario: usuarioGuardado
            });

        });      

    });

});



// =========================
// Crear un usuario nuevo
// =========================
//cuando intentamos crear un usuario va a pasar por el verificador.
app.post('/', mdAutenticacion.verificaToken, (req, res)=>{

    var body = req.body; //Extraemos el body, esto funciona solo si tenemos el body parser, esta importado en app.js y configurado ahi tmb.

    //Creamos un nuevo objeto de tipo Usuario
    var usuario = new Usuario({
        nombre: body.nombre,
        email: body.email,
        password: bcrypt.hashSync(body.password, 10), //encripto la contraseña con bcrypt.hashSync
        img: body.img,
        role: body.role
    });

    //Guardamos el usuario, si sucede error lo manejamos con err sino guardamos usuarioGuardado.
    usuario.save( (err, usuarioGuardado ) => {

        if( err ){
            return res.status(400).json({
                ok:false,
                mensaje:'Error al crear usuario',
                errors: err
            });
        }

        res.status(201).json({
            ok: true,
            usuario: usuarioGuardado,
            usuariotoken: req.usuario // en este usuario estamos pasando la info del usuario q hizo la peticion de agregar usuario.
        });

    });
    

});


// =========================
// Borrar un usuario por el id
// =========================

app.delete('/:id',mdAutenticacion.verificaToken, (req, res)=>{

    var id = req.params.id;

    Usuario.findByIdAndRemove(id, ( err, usuarioBorrado )=>{

        if( err ){
            return res.status(500).json({
                ok:false,
                mensaje:'Error al borrar usuario',
                errors: err
            });
        }

        if( !usuarioBorrado ){
            return res.status(400).json({
                ok:false,
                mensaje:'No se encontro un usuario con ese id.',
                errors: { message: 'No existe ningun usuario con ese id.' }
            });
        }

        res.status(200).json({
            ok: true,
            usuario: usuarioBorrado
        });

    })

});


// para poder ver esto desde otros archivos necesito exportarlo
module.exports = app;