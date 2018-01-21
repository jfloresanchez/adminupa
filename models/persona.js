var mongoose = require('mongoose');
var Schema = mongoose.Schema;


var personaSchema = new Schema({
    nombre: { type: String, required: [true, 'El nombre es necesario'] },
    img: { type: String, required: false },
    usuario: { type: Schema.Types.ObjectId, ref: 'Usuario', required: true },
    sede: {
        type: Schema.Types.ObjectId,
        ref: 'Sede',
        required: [true, 'El id sede es un campo obligatorio ']
    }
}, { collection: 'personas' });


module.exports = mongoose.model('Persona', personaSchema);