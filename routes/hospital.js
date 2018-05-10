var express = require('express');

var mdAutenticacion = require('../middlewares/autenticacion');

var app = express();


var Hospital = require('../models/hospital');


// =========================
//OBTENER HOSPITALES
// =========================
app.get('/', (req, res, next ) => {

    var desde = req.query.desde || 0;
    desde = Number(desde);// con esto me aseguro q sea un numero, a fuerza.
    
    //populate es una funcion de mongoose, vamos a especificar que tabla y q campos queremos de la otra tabla o coleccion,
    //en este caso quiero q busque usuario y q muestre solo nombre y email.
    Hospital.find({}).skip(desde)
                     .limit(5)
                     .populate('usuario', 'nombre email')
                     .exec((err, hospitales) => {
    
        if( err ){
            return res.status(500).json({
                ok:false,
                mensaje:'Error cargando hospital',
                errors: err
            });
        }

        Hospital.count({}, (err, conteo)=>{
            
            res.status(200).json({
                ok: true,
                hospitales: hospitales,
                total: conteo
            });
        })       

    })  
      
});


// =========================
// Actualizar un Hospital
// =========================
app.put('/:id',mdAutenticacion.verificaToken, (req, res)=> {

    var id = req.params.id;
    var body = req.body;

    Hospital.findById( id, (err, hospital) => {
       
        if( err ){
            return res.status(500).json({
                ok:false,
                mensaje:'Error al buscar el hospital',
                errors: err
            });
        }
     
        if( !hospital ){
            return res.status(400).json({
                ok:false,
                mensaje:'El hospital con el id' + id + 'no existe',
                errors: { message: 'No existe un hospital con ese ID'}
            });
        }

        hospital.nombre = body.nombre;
        hospital.usuario = req.usuario._id; //_id porq en la base de datos el id se genera asi '_id'
                

        hospital.save( (err, hospitalGuardado) =>{

            if( err ){
                return res.status(400).json({
                    ok:false,
                    mensaje:'Error al actualizar hospital',
                    errors: err
                });
            }            
    
            res.status(200).json({
                ok: true,
                hospital: hospitalGuardado
            });

        });      

    });

});


// =========================
// Crear un hospital nuevo
// =========================
app.post('/', mdAutenticacion.verificaToken, (req, res)=>{

    var body = req.body; 

    var hospital = new Hospital({
        nombre: body.nombre,  
        usuario: req.usuario._id
    });
    
    hospital.save( (err, hospitalGuardado ) => {

        if( err ){
            return res.status(400).json({
                ok:false,
                mensaje:'Error al crear hospital',
                errors: err
            });
        }

        res.status(201).json({
            ok: true,
            hospital: hospitalGuardado           
        });

    });
    

});


// =========================
// Borrar un hospital por el id
// =========================

app.delete('/:id',mdAutenticacion.verificaToken, (req, res)=>{

    var id = req.params.id;

    Hospital.findByIdAndRemove(id, ( err, hospitalBorrado )=>{

        if( err ){
            return res.status(500).json({
                ok:false,
                mensaje:'Error al borrar hospital',
                errors: err
            });
        }

        if( !hospitalBorrado ){
            return res.status(400).json({
                ok:false,
                mensaje:'No se encontro un hospital con ese id.',
                errors: { message: 'No existe ningun hospital con ese id.' }
            });
        }

        res.status(200).json({
            ok: true,
            hospital: hospitalBorrado
        });

    })

});


// para poder ver esto desde otros archivos necesito exportarlo
module.exports = app;