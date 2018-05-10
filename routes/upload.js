var express = require('express');
var fileUpload = require('express-fileupload');
var fs = require('fs'); // importamos fs (file system)

var app = express();
app.use(fileUpload());

var Usuario = require('../models/usuario');
var Medico = require('../models/medico');
var Hospital = require('../models/hospital');


app.put('/:tipo/:id', (req, res, next ) => {

    // obtengo mediante variables los dos parametros q paso por url.
    var tipo = req.params.tipo;
    var id = req.params.id;

    // tipos d coleccion
    var tiposValidos = ['hospitales', 'medicos', 'usuarios'];
    //validamos q 'tipo' sea uno de los 'tiposValidos'
    if( tiposValidos.indexOf( tipo ) < 0 ){

        return res.status(400).json({
            ok: false,
            mensaje: 'Tipo de coleccion no es valida',
            error: { message: 'Tipo de coleccion no es valida' }
        });

    }

    if( !req.files ){

        return res.status(400).json({
            ok: false,
            mensaje: 'No selecciono nada',
            error: { message: 'Debe de seleccionar una imagen' }
        });
    }

    // Obtener nombre del archivo
    var archivo = req.files.imagen; //req.files.imagen es el nombre de la imagen q estamos subiendo
    var nombreCortado = archivo.name.split('.'); // d esta manera obtengo un arreglo de palabras separados por los puntos q contenga, hacemos esto para obtener la extension.
    var extensionArchivo = nombreCortado[ nombreCortado.length - 1 ]; // aca obtengo la extension.

    // Solo estas extensiones aceptamos
    var extensionesValidas = ['png', 'jpg', 'gif', 'jpeg'];

    //comprobamos q la extension exista en el arreglo, si esto regresa -1 quiere decir q no lo encuentra
    if( extensionesValidas.indexOf( extensionArchivo ) < 0 ){

        return res.status(400).json({
            ok: false,
            mensaje: 'Extension no valida',
            error: { message: 'Las extensiones validas son ' + extensionesValidas.join(', ') } // con join separamos las palabras del array y en este caso las separamos por una coma y un espacio.
        });
    }

    // Nombre de archivo personalizado, vamos a usar el id del usuario y un numero random(utilizamos los milisegundos actuales), para evitar nombres iguales.
    var nombreArchivo = `${ id }-${ new Date().getMilliseconds() }.${extensionArchivo}`;

    // Mover el archivo del temporal a un path
    var path = `./uploads/${ tipo }/${ nombreArchivo }`; //generamos la ruta del arhivo


    // movemos el archivo al path
    archivo.mv( path, err => {

        if( err ){
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al mover archivo',
                error: err
            });
        }

        subirPorTipo( tipo, id, nombreArchivo, res );

        

    })   

});



function subirPorTipo( tipo, id, nombreArchivo, res ){

    if (tipo === 'usuarios'){

        Usuario.findById( id, (err, usuario) => {

            if( !usuario ){

                if( err ){
                    return res.status(400).json({
                        ok: false,
                        mensaje: 'Usuario no existe',
                        error: { message: 'Usuario no existe'}
                    });
                }
            }

            var pathViejo = './uploads/usuarios/' + usuario.img;

            // lo primero q comprobamos es si ya existe una imagen de ese usuario y la elimina con fs.unlink
            if (fs.existsSync(pathViejo)) { 
                fs.unlinkSync( pathViejo ); 
            }

            usuario.img = nombreArchivo; // usuario.img es la propiedad de la base de datos de la coleccion q tenemos.

            usuario.save((err, usuarioActualizado) => {     
                
                usuarioActualizado.password = ':)';

                return res.status(200).json({
                        ok: true,
                        mensaje: 'Imagen de usuario actualizada',           
                        usuario: usuarioActualizado
                    });
            })

        });

    }
    if (tipo === 'medicos'){

        Medico.findById( id, (err, medico) => {

            if( !medico ){

                if( err ){
                    return res.status(400).json({
                        ok: false,
                        mensaje: 'Medico no existe',
                        error: { message: 'Medico no existe'}
                    });
                }
            }

            var pathViejo = './uploads/medicos/' + medico.img;

            // lo primero q comprobamos es si ya existe una imagen de ese usuario y la elimina con fs.unlink
            if( fs.existsSync(pathViejo)) { 
                fs.unlinkSync( pathViejo ); 
            }

            medico.img = nombreArchivo; // usuario.img es la propiedad de la base de datos de la coleccion q tenemos.

            medico.save((err, medicoActualizado) => {                 
               

                return res.status(200).json({
                        ok: true,
                        mensaje: 'Imagen de medico actualizada',           
                        medico: medicoActualizado
                    });
            })

        });

        
    }
    if (tipo === 'hospitales'){

        
        Hospital.findById( id, (err, hospital) => {

            if( !hospital ){

                if( err ){
                    return res.status(400).json({
                        ok: false,
                        mensaje: 'Hospital no existe',
                        error: { message: 'Hospital no existe'}
                    });
                }
            }

            var pathViejo = './uploads/hospitales/' + hospital.img;

            // lo primero q comprobamos es si ya existe una imagen de ese usuario y la elimina con fs.unlink
            if( fs.existsSync(pathViejo)) { 
                fs.unlinkSync( pathViejo ); 
            }

            hospital.img = nombreArchivo; // usuario.img es la propiedad de la base de datos de la coleccion q tenemos.

            hospital.save((err, hospitalActualizado) => {               

                return res.status(200).json({
                        ok: true,
                        mensaje: 'Imagen de hospital actualizada',           
                        hospital: hospitalActualizado
                    });
            })

        });
        
    }

}


module.exports = app;