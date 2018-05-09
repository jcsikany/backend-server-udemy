// Requires : es una importancion de libreria q ocupamos para q funcione algo
var express = require('express');
var mongoose = require('mongoose'); // creo la referencia a la libreria mongoose
var bodyParser = require('body-parser'); // Esta libreria toma la informacion del post y nos crea un objeto de javascript que ya podemos utilizar sin hacer nada nosotros.



// Inicializar variables
var app = express();



//Body parser
// parse application/x-www-form-urlencoded // Cuando hacemos post en postman hay q poner en el body "x-www-form-urlencoded"
app.use(bodyParser.urlencoded({ extended: false })) 
// parse application/json
app.use(bodyParser.json())



//Importamos las rutas
var appRoutes = require('./routes/app');
var usuarioRoutes = require('./routes/usuario');
var loginRoutes = require('./routes/login');


// Conexion a la base de datos
//Ponemos el path de la base de datos, dsp un callback, error(en caso q suceda un error) y response
// en el codigo hacemos una validacion por si sucede un error, el throw en javascript detiene todo el proceso.
mongoose.connection.openUri('mongodb://localhost:27017/hospitalDB', ( err, res )=>{
    //
    if( err ) throw err;

    console.log('Base de datos: \x1b[32m%s\x1b[0m','online');

})


//Rutas
// Para q las rutas q importamos(ejemplo appRoutes) podamos utilizarlas
//tenemos q definirlas asi, utilizamos algo q se llama midlleware
app.use('/usuario' , usuarioRoutes);
app.use('/login' , loginRoutes);
app.use('/' , appRoutes); // cuando cualquier peticion haga match con esa pleca('/') usa el appRoutes



// Escuchar peticiones
app.listen(3000, ()=>{
    console.log('Express server puerto 3000: \x1b[32m%s\x1b[0m','online');
})
