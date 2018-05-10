
var express = require('express');
var app = express();

var Hospital = require('../models/hospital');
var Medico = require('../models/medico');
var Usuario = require('../models/usuario');

// ============================
// Busqueda por coleccion
// ============================ 

app.get('/coleccion/:tabla/:busqueda', (req,res,next)=> {

    var busqueda = req.params.busqueda;
    var regex = new RegExp( busqueda, 'i');
    var tabla = req.params.tabla;

    var promesa;

    switch (tabla) {
        case 'medicos': promesa = buscarMedicos(busqueda, regex);                                  
                        break;
        case 'hospitales': promesa = buscarHospitales(busqueda, regex);
                          break;
        case 'usuarios': promesa = buscarUsuarios(busqueda, regex);
                         break;
        default:
            return res.status(400).json({
                ok: false,
                mensaje: 'Los tipos de busqueda solo son: usuarios, medicos y hospitales',
                error: { message: 'Tipo de tabla/coleccion no valido' }
            });

    }

    promesa.then( resultado => {

        // para saber cual d los tres casos esos usamos la variable tabla q nos trae ese dato dsd la url,
        // pero para q nos muestre su valor y no aparezca la palabra 'tabla' tenemos q ponerlo entre parentesis cuadrados. 
        res.status(200).json({
            ok: true,
            [tabla]: resultado
        }); 
        
    });

})


// ============================
// Busqueda general
// ============================ 
app.get('/todo/:busqueda', (req, res, next ) => {

    var busqueda = req.params.busqueda; // esta busqueda es lo q la persona esta escribiendo en este segmento de la busqueda ':busqueda'
    var regex = new RegExp( busqueda, 'i');// necesito generar una expresion regular con la variable busqueda porq no la puedo pasar directo y la 'i' es para q sea insensible a mayus y minusculas. 

    //Esta funcion nueva en el ES6 nos permite mandar un arreglo de promesas, ejecutarlas y si todas responden correctamente
    //podemos disparar un then y si una falla tenemos q manejar el catch
    //el .then aca ya no va a recibir el valor unico de cada una d las promesas, vamos a recibir un arreglo con las respuestas.
    //cada una de las respuestas de esas promesas va a venir dentro del arreglo en la misma posicion en la q se encuentran
    // hospitales esta en la posicion 0 del arreglo 'respuestas', medicos en la [1]
    Promise.all([ 
                   buscarHospitales(busqueda, regex),
                   buscarMedicos(busqueda, regex) ,
                   buscarUsuarios(busqueda, regex)
                ])
             .then( respuestas => {

                res.status(200).json({
                    ok: true,
                    hospitales: respuestas[0],
                    medicos: respuestas[1],
                    usuarios: respuestas[2]
                }); 

             })        
    
});

//hacemos una funcion q tiene una promesa, si se cumple(resolve) devuelve los hospitales sino (reject) nos
//devuelve un mensaje. esta funcion la ejecutamos en el app.get(), cuando hacemos .then estamos esperando a q resolve se cuampla y ejecuta el codigo.
function buscarHospitales( busqueda, regex){

    return new Promise( (resolve, reject)=>{

        Hospital.find({ nombre: regex })
                .populate( 'usuario','nombre email' )
                .exec((err, hospitales)=>{

            if( err ){
                 reject('Error al cargar hospitales', err);
            }else{
                resolve(hospitales);
            }    
    
        });

    });

}


//hacemos una funcion q tiene una promesa, si se cumple(resolve) devuelve los hospitales sino (reject) nos
//devuelve un mensaje. esta funcion la ejecutamos en el app.get()
function buscarMedicos( busqueda, regex){

    return new Promise( (resolve, reject)=>{

        Medico.find({ nombre: regex })
              .populate( 'usuario' , 'nombre email')
              .populate( 'hospital')
              .exec((err, medicos)=>{

            if( err ){
                 reject('Error al cargar medicos', err);
            }else{
                resolve(medicos);
            }    
    
        });

    });

}



//hacemos una funcion q tiene una promesa, si se cumple(resolve) devuelve los hospitales sino (reject) nos
//devuelve un mensaje. esta funcion la ejecutamos en el app.get()
function buscarUsuarios( busqueda, regex){

    return new Promise((resolve, reject)=>{

        //.or es una funcion de mongoose q nos permite mandar un arreglo de condiciones, es como hacer varios find juntos
        //con el '-password le digo q no quiero q me muestre el password'
        Usuario.find({}, '-password')
               .or([ { nombre: regex }, { email: regex } ])
               .exec((err, usuarios)=>{

                if(err ){
                    reject('Error al cargar usuarios', err);
                }else{
                    resolve( usuarios );
                }

            }) 

});

}

module.exports = app;