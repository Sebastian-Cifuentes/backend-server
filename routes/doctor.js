var express = require('express');
var app = express();
var mdVerifyToken = require('../middlewares/autentication');

var Doctor = require('../models/doctor');

// Obtener doctores

app.get('/', (req, res) => {

    var since = req.query.since || 0;
    since = Number(since);

    Doctor.find({})
        .skip(since)
        .limit(5)
        .populate('user', 'name email')
        .populate('hospital')
        .exec((err, doctors) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    mensaje: 'Error al obtener los doctores',
                    errors: err
                });
            }

            Doctor.count({}, (err, cont) => {
                if (err) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Error al contar los doctores',
                        errors: err
                    });
                }

                res.status(200).json({
                    ok: true,
                    mensaje: 'Doctores actuales',
                    doctors: doctors,
                    totalDoctors: cont
                });
            });
        });
});

// Actualizar doctor

app.put('/:id', mdVerifyToken.verifyToken, (req, res) => {
    var id = req.params.id;
    var body = req.body;
    var user = req.user;

    Doctor.findById(id, (err, doctor) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar el doctor',
                errors: err
            });
        }

        if (!doctor) {
            return res.status(400).json({
                ok: false,
                mensake: 'El doctor con el id ' + id + ' no existe',
                errors: { error: err, message: 'No existe el doctor' }
            });
        }

        doctor.name = body.name;
        doctor.user = user._id;
        doctor.hospital = body.hospital;

        doctor.save((err, doctorSave) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error al actualizar el doctor',
                    error: err
                });
            }

            res.status(200).json({
                ok: true,
                mensaje: 'El doctor se actualizo con exito',
                doctor: doctorSave
            });
        });
    });

});

// Crear doctor

app.post('/', mdVerifyToken.verifyToken, (req, res) => {
    var body = req.body;
    var user = req.user;

    var doctor = new Doctor({
        name: body.name,
        user: user._id,
        hospital: body.hospital
    });

    doctor.save((err, doctorSave) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error al crear el doctor',
                errors: err,
                user: user
            });
        }

        res.status(200).json({
            ok: true,
            mensaje: 'El doctor se creo con éxito',
            doctorSave: doctorSave
        });
    });
});

// Eliminar doctor

app.delete('/:id', mdVerifyToken.verifyToken, (req, res) => {
    var id = req.params.id;

    Doctor.findOneAndRemove(id, (err, doctorDelete) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al borrar el doctor',
                errors: err
            });
        }

        if (!doctorDelete) {
            return res.status(400).json({
                ok: false,
                mensaje: 'El doctor con el usuario ' + id + ' no existe',
                errors: { error: err, message: 'El doctor no existe' }
            });
        }

        res.status(200).json({
            ok: true,
            mensaje: 'El doctor se elimino exitosamente!',
            doctor: doctorDelete
        });
    });
});

module.exports = app;