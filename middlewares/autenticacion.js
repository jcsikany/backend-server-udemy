

var jwt = require('jsonwebtoken'); // "npm install jsonwebtoken" instalamos e importamos para usar el json web token

var SEED = require('../config/config').SEED; // importo el seed dsd el archivo config.js


// =========================
// Verificar token
// =========================
//Necesito de alguna manera exportar lo q se va a hacer aca, 
//estoy exportanto una funcion q se llama verificaToken y q recibe los parametros, req, res y next
exports.verificaToken = function(req, res, next) {

     // Para leer el toquen necesito hacerlo asi, recibir el token por la url
     var token = req.query.token;

     //Verifico si es valido
     //le paso el token q recibo de la peticion, luego el seed, y el tercero es un callback
     //tiene un erro(err)r y la informacion del usuario(decoded), esto es lo q colocamos en el payload.
     jwt.verify( token, SEED, (err, decoded) => {
 
         if( err ){
             return res.status(401).json({
                 ok:false,
                 mensaje:'Token incorrecto',
                 errors: err
             });
         }

         //para colocar la informacion del usuario(el q solicita una peticion, ejemplo el q intenta crear un usuario) q este disponible en cualquier peticion extraigo la informacion de decoded y se la paso al requests(req)
         req.usuario = decoded.usuario;
 
         // el next es el q le dice va todo bien, podes continuar. y sigue con el resto de funciones, sino se queda trancado aca.
          next();

         //si el token es valido imprime esto d aca, lo usamos solo para verificar q el decoded este bien         
         /*res.status(200).json({
            ok:false,
            decoded:decoded           
        });*/
 
     });

}




   


