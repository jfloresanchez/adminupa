var express = require('express');

var app = express();

var Sede = require('../models/sede');
var Persona = require('../models/persona');
var Usuario = require('../models/usuario');

// ==============================
// Busqueda por colección
// ==============================
app.get('/coleccion/:tabla/:busqueda', (req, res) => {

    var busqueda = req.params.busqueda;
    var tabla = req.params.tabla;
    var regex = new RegExp(busqueda, 'i');

    var promesa;

    switch (tabla) {

        case 'usuarios':
            promesa = buscarUsuarios(busqueda, regex);
            break;

        case 'personas':
            promesa = buscarPersonas(busqueda, regex);
            break;

        case 'sedes':
            promesa = buscarSedes(busqueda, regex);
            break;

        default:
            return res.status(400).json({
                ok: false,
                mensaje: 'Los tipos de busqueda sólo son: usuarios, personas y sedes',
                error: { message: 'Tipo de tabla/coleccion no válido' }
            });

    }

    promesa.then(data => {

        res.status(200).json({
            ok: true,
            [tabla]: data
        });

    })

});


// ==============================
// Busqueda general
// ==============================
app.get('/todo/:busqueda', (req, res, next) => {

    var busqueda = req.params.busqueda;
    var regex = new RegExp(busqueda, 'i');


    Promise.all([
            buscarSedes(busqueda, regex),
            buscarPersonas(busqueda, regex),
            buscarUsuarios(busqueda, regex)
        ])
        .then(respuestas => {

            res.status(200).json({
                ok: true,
                sedes: respuestas[0],
                personas: respuestas[1],
                usuarios: respuestas[2]
            });
        })


});


function buscarSedes(busqueda, regex) {

    return new Promise((resolve, reject) => {

        Sede.find({ nombre: regex })
            .populate('usuario', 'nombre email img')
            .exec((err, sedes) => {

                if (err) {
                    reject('Error al cargar sedes', err);
                } else {
                    resolve(sedes)
                }
            });
    });
}

function buscarPersonas(busqueda, regex) {

    return new Promise((resolve, reject) => {

        Persona.find({ nombre: regex })
            .populate('usuario', 'nombre email img')
            .populate('sede')
            .exec((err, personas) => {

                if (err) {
                    reject('Error al cargar personas', err);
                } else {
                    resolve(personas)
                }
            });
    });
}

function buscarUsuarios(busqueda, regex) {

    return new Promise((resolve, reject) => {

        Usuario.find({}, 'nombre email role img')
            .or([{ 'nombre': regex }, { 'email': regex }])
            .exec((err, usuarios) => {

                if (err) {
                    reject('Erro al cargar usuarios', err);
                } else {
                    resolve(usuarios);
                }


            })


    });
}



module.exports = app;