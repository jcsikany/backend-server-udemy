// Requires : es una importancion de libreria q ocupamos para q funcione algo
var express = require('express');
var mongoose = require('mongoose'); // creo la referencia a la libreria mongoose



// Inicializar variables
var app = express();


// Conexion a la base de datos
//Ponemos el path de la base de datos, dsp un callback, error(en caso q suceda un error) y response
// en el codigo hacemos una validacion por si sucede un error, el throw en javascript detiene todo el proceso.
mongoose.connection.openUri('mongodb://localhost:27017/hospitalDB', ( err, res )=>{
    //
    if( err ) throw err;

    console.log('Base de datos: \x1b[32m%s\x1b[0m','online');

})



// Rutas app dsp viene q tipo de peticion voy a escuchar, en este caso get
// luego definimos dos cosas, primero el path '/' y dsp el segundo parametros es una funcion de callback
//recibe tres parametros, request, response y next(cuando se ejecute continue con la siguiente instruccion, eso dice el next.)
app.get('/', (req, res, next ) => {

    //mandamos las respuestas a las solicitudes q estamos realizando
    //en status pasamos el codigo d la peticion
    res.status(200).json({
        ok: true,
        mensaje: 'Peticion realizada correctamente'
    })

});



// Escuchar peticiones
app.listen(3000, ()=>{
    console.log('Express server puerto 3000: \x1b[32m%s\x1b[0m','online');
})
