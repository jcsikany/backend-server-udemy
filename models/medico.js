var mongoose = require("mongoose");
var Schema = mongoose.Schema;


var medicoSchema = new Schema({
    nombre: { type: String, required: [true, 'El nombre es necesario'] },
    img: { type: String, required: false },    
    usuario: { type: Schema.Types.ObjectId, ref:'Usuario', required:true },
    hospital: { type: Schema.Types.ObjectId, ref:'Hospital', required:[true, 'El id hospital es un campo obligatorio]']},
}, { collection:'medicos' });
//"coleccion: 'medicos'" esto es para indicarle en caso q en mongodb no este creada la coleccion, q se cree con ese nombre, sino lo genera como "Hospital"


module.exports = mongoose.model('Medico', medicoSchema);