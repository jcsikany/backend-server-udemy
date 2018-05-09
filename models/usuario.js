var mongoose = require('mongoose');//importamos mongoose para trabajar con sus funciones
var uniqueValidator = require('mongoose-unique-validator'); // importamos este plugin de mongoose para ver mejor las validaciones, primero instalamos esto "npm install mongoose-unique-validator --save" 

var Schema = mongoose.Schema; // creamos una schema de moongose. Para utilizarlo luego

//hacemos este objeto para indicar cuales son las posibles opciones de roles
var rolesValidos = {
    values: ['ADMIN_ROLE', 'USER_ROLE'],
    message: '{VALUE} no es un rol permitido'
}


//Aca definimos lo q va a contener un usuario, como no tenemos typescript le indicamos de q tipo es de esa manera "type: String"
// luego le decimos q es requerido y el texto q le pasamos es por si falla, o sea no escribieron nada.
var usuarioSchema = new Schema({

    nombre: { type: String, required: [true, 'El nombre es necesario'] },
    email: { type: String, unique:true, required: [true, 'El correo es necesario'] },
    password: { type: String, required: [true, 'La constraseña es necesaria'] },
    img: { type: String, required:false },
    role: { type: String, required: true, default: 'USER_ROLE', enum: rolesValidos } // con enum: le pasamos rolesValidos para q valide.

});

usuarioSchema.plugin( uniqueValidator, { message: '{PATH} debe de ser unico.' } )// Aca mandamos el mensaje a los unique, cuando sale el error de repetido. con {PATH} le pasa el nombre del atributo del objeto.

// Para poder usar este schema fuera d este archivo lo exportamos,
// le indicamos el nombre con el q se va a ver ('Usuario') y el objeto que queremos q relacion q es el usuarioSchema.
module.exports = mongoose.model('Usuario', usuarioSchema);