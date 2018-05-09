//En este archivo estoy separando las peticiones para q no queden todas amontonadas en app.js de la raiz

//necesito importar express.
var express = require('express');

var app = express();

// Rutas.
// app dsp viene q tipo de peticion voy a escuchar, en este caso get
// luego definimos dos cosas, primero el path '/' y dsp el segundo parametros es una funcion de callback
//recibe tres parametros, request, response y next(cuando se ejecute continue con la siguiente instruccion, eso dice el next.)
app.get('/', (req, res, next ) => {

    //mandamos las respuestas a las solicitudes q estamos realizando
    //en status pasamos el codigo d la peticion
    res.status(200).json({
        ok: true,
        mensaje: 'Peticion realizada correctamente'
    });

});

// para poder ver esto desde otros archivos necesito exportarlo
module.exports = app;