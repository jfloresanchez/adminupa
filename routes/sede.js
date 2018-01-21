var express = require('express');

var mdAutenticacion = require('../middlewares/autenticacion');

var app = express();

var Sede = require('../models/sede');

// ==========================================
// Obtener todos las sedes
// ==========================================
app.get('/', (req, res, next) => {

    var desde = req.query.desde || 0;
    desde = Number(desde);

    Sede.find({})
        .skip(desde)
        .limit(5)
        .populate('usuario', 'nombre email')
        .exec(
            (err, sedes) => {

                if (err) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Error cargando sede',
                        errors: err
                    });
                }

                Sede.count({}, (err, conteo) => {

                    res.status(200).json({
                        ok: true,
                        sedes: sedes,
                        total: conteo
                    });
                })

            });
});

// ==========================================
//  Obtener Sede por ID
// ==========================================
app.get('/:id', (req, res) => {

    var id = req.params.id;

    Sede.findById(id)
        .populate('usuario', 'nombre img email')
        .exec((err, sede) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    mensaje: 'Error al buscar sede',
                    errors: err
                });
            }

            if (!sede) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'El sede con el id ' + id + 'no existe',
                    errors: { message: 'No existe un sede con ese ID' }
                });
            }
            res.status(200).json({
                ok: true,
                sede: sede
            });
        })
})





// ==========================================
// Actualizar Sede
// ==========================================
app.put('/:id', mdAutenticacion.verificaToken, (req, res) => {

    var id = req.params.id;
    var body = req.body;

    Sede.findById(id, (err, sede) => {


        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar sede',
                errors: err
            });
        }

        if (!sede) {
            return res.status(400).json({
                ok: false,
                mensaje: 'El sede con el id ' + id + ' no existe',
                errors: { message: 'No existe un sede con ese ID' }
            });
        }


        sede.nombre = body.nombre;
        sede.usuario = req.usuario._id;

        sede.save((err, sedeGuardado) => {

            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error al actualizar sede',
                    errors: err
                });
            }

            res.status(200).json({
                ok: true,
                sede: sedeGuardado
            });

        });

    });

});



// ==========================================
// Crear un nuevo sede
// ==========================================
app.post('/', mdAutenticacion.verificaToken, (req, res) => {

    var body = req.body;

    var sede = new Sede({
        nombre: body.nombre,
        usuario: req.usuario._id
    });

    sede.save((err, sedeGuardado) => {

        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error al crear sede',
                errors: err
            });
        }

        res.status(201).json({
            ok: true,
            sede: sedeGuardado
        });


    });

});


// ============================================
//   Borrar un sede por el id
// ============================================
app.delete('/:id', mdAutenticacion.verificaToken, (req, res) => {

    var id = req.params.id;

    Sede.findByIdAndRemove(id, (err, sedeBorrado) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error borrar sede',
                errors: err
            });
        }

        if (!sedeBorrado) {
            return res.status(400).json({
                ok: false,
                mensaje: 'No existe un sede con ese id',
                errors: { message: 'No existe un sede con ese id' }
            });
        }

        res.status(200).json({
            ok: true,
            sede: sedeBorrado
        });

    });

});


module.exports = app;