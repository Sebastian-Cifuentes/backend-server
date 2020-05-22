var express = require('express');
var app = express();
var mdVerifyToken = require('../middlewares/autentication');

var Hospital = require('../models/hospital');

// Obtener hospital por id
app.get('/:id', (req, res) => {
    var id = req.params.id;

    Hospital.findById(id)
        .populate('usuario', 'nombre img email')
        .exec((err, hospital) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    mensaje: 'Error al buscar hospital',
                    errors: err
                });
            }
            if (!hospital) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'El hospital con el id ' + id + 'no existe ',
                    errors: {
                        message: 'No existe un hospital con ese ID '
                    }
                });
            }
            res.status(200).json({
                ok: true,
                hospital: hospital
            });
        })
})

// Obtener hospitales

app.get('/', (req, res, next) => {

    var since = req.query.since || 0;
    since = Number(since);

    Hospital.find({})
        .skip(since)
        .limit(5)
        .populate('user', 'name email')
        .exec(
            (err, hospitals) => {
                if (err) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Error cargando hospitales',
                        errors: err
                    });
                }

                Hospital.count({}, (err, cont) => {
                    if (err) {
                        return res.status(500).json({
                            ok: false,
                            mensaje: 'Error al contar los hospitales',
                            errors: err
                        });
                    }

                    res.status(200).json({
                        ok: true,
                        mensaje: 'Hospitales actuales',
                        hospitals: hospitals,
                        totalHospitals: cont
                    });
                });
            });
});

// Actualiza hospital

app.put('/:id', mdVerifyToken.verifyToken, (req, res, next) => {

    var id = req.params.id;
    var body = req.body;

    Hospital.findById(id, (err, hospital) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar el hospital',
                errors: err
            });
        }

        if (!hospital) {
            return res.status(400).json({
                ok: false,
                mensaje: 'El hospital con el id ' + id + ' no existe',
                errors: { error: err, message: 'No existe el hospital' }
            });
        }

        hospital.name = body.name;
        hospital.user = body.user;

        hospital.save((err, hospitalSave) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error al actualizar el hospital',
                    errors: err
                });
            }
            res.status(200).json({
                ok: true,
                hospital: hospitalSave,
                mensaje: 'Hospital actualizado correctamente'
            });
        });

    });
});

// Crear hospital

app.post('/', mdVerifyToken.verifyToken, (req, res) => {
    var body = req.body;
    var user = req.user;

    var hospital = new Hospital({
        name: body.name,
        user: user._id
    });

    hospital.save((err, hospitalSave) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error al crear el hospital',
                errors: err
            });
        }

        res.status(201).json({
            ok: true,
            mensaje: 'Hospital creado con exito!',
            hospital: hospitalSave,
            userRequest: user
        });
    });
});

// Borrar hospital

app.delete('/:id', mdVerifyToken.verifyToken, (req, res, next) => {
    var id = req.params.id;
    Hospital.findByIdAndRemove(id, (err, hospitalDelete) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al borrar el hospital',
                errors: err
            });
        }
        if (!hospitalDelete) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error al encontrar el hospital',
                errors: { error: err, message: 'El hospital con el id ' + id + ' no existe' }
            });
        }
        res.status(200).json({
            ok: true,
            mensaje: 'Hospital eliminado con exito!',
            hospital: hospitalDelete
        });
    });
});

module.exports = app;