var express = require('express');

var mdAutenticacion = require('../middlewares/autenticacion');

var app = express();

var Persona = require('../models/persona');

// ==========================================
// Obtener todos los personas
// ==========================================
app.get('/', (req, res, next) => {

    var desde = req.query.desde || 0;
    desde = Number(desde);

    Persona.find({})
        .skip(desde)
        .limit(5)
        .populate('usuario', 'nombre email')
        .populate('sede')
        .exec(
            (err, personas) => {

                if (err) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Error cargando persona',
                        errors: err
                    });
                }

                Persona.count({}, (err, conteo) => {
                    res.status(200).json({
                        ok: true,
                        personas: personas,
                        total: conteo
                    });

                })

            });
});

// ==========================================
// Obtener persona
// ==========================================
app.get('/:id', (req, res) => {

    var id = req.params.id;

    Persona.findById(id)
        .populate('usuario', 'nombre email img')
        .populate('sede')
        .exec((err, persona) => {

            if (err) {
                return res.status(500).json({
                    ok: false,
                    mensaje: 'Error al buscar persona',
                    errors: err
                });
            }

            if (!persona) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'El persona con el id ' + id + ' no existe',
                    errors: { message: 'No existe un persona con ese ID' }
                });
            }

            res.status(200).json({
                ok: true,
                persona: persona
            });

        })


});

// ==========================================
// Actualizar Persona
// ==========================================
app.put('/:id', mdAutenticacion.verificaToken, (req, res) => {

    var id = req.params.id;
    var body = req.body;

    Persona.findById(id, (err, persona) => {


        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar persona',
                errors: err
            });
        }

        if (!persona) {
            return res.status(400).json({
                ok: false,
                mensaje: 'El persona con el id ' + id + ' no existe',
                errors: { message: 'No existe un persona con ese ID' }
            });
        }


        persona.nombre = body.nombre;
        persona.usuario = req.usuario._id;
        persona.sede = body.sede;

        persona.save((err, personaGuardado) => {

            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error al actualizar persona',
                    errors: err
                });
            }

            res.status(200).json({
                ok: true,
                persona: personaGuardado
            });

        });

    });

});



// ==========================================
// Crear un nuevo persona
// ==========================================
app.post('/', mdAutenticacion.verificaToken, (req, res) => {

    var body = req.body;

    var persona = new Persona({
        nombre: body.nombre,
        usuario: req.usuario._id,
        sede: body.sede
    });

    persona.save((err, personaGuardado) => {

        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error al crear persona',
                errors: err
            });
        }

        res.status(201).json({
            ok: true,
            persona: personaGuardado
        });


    });

});


// ============================================
//   Borrar un persona por el id
// ============================================
app.delete('/:id', mdAutenticacion.verificaToken, (req, res) => {

    var id = req.params.id;

    Persona.findByIdAndRemove(id, (err, personaBorrado) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error borrar persona',
                errors: err
            });
        }

        if (!personaBorrado) {
            return res.status(400).json({
                ok: false,
                mensaje: 'No existe un persona con ese id',
                errors: { message: 'No existe un persona con ese id' }
            });
        }

        res.status(200).json({
            ok: true,
            persona: personaBorrado
        });

    });

});


module.exports = app;