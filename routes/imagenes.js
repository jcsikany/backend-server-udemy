
var express = require('express');

var app = express();

const path = require('path');//Este path ya viene con node, no necesita npm install.este path es para hacer mas facil el path de las imagenes.
const fs = require('fs');// el file sistem en este caso lo usamos para ver si ese path es valido.

app.get('/:tipo/:img', (req, res, next ) => {

    var tipo = req.params.tipo;
    var img = req.params.img;

    // resolve() no va a ayudar para q siempre quede correcto el path, dentro de resolve especificamos toda la ruta de la imagen.
    //'__dirname' obtiene toda la ruta de donde te encontras en este momento, luego viene la ruta para encontrar las imagens.
    var pathImagen = path.resolve(__dirname, `../uploads/${ tipo }/${ img }`);

    //Si 'fs.existsSync( pathImagen )' regresa un true quiere decir q la imagen existe y los parametros del path son correctos.
    if ( fs.existsSync( pathImagen )){
        res.sendFile( pathImagen );
    } else {
        
        var pathNoImagen = path.resolve( __dirname, '../assets/no-img.jpg' );
        res.sendFile(pathNoImagen);
    }

    

});


module.exports = app;