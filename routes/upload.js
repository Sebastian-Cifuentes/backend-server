var express = require('express');
var fileUpload = require('express-fileupload');
var fs = require('fs');
var app = express();
var User = require('../models/user');
var Hospital = require('../models/hospital');
var Doctor = require('../models/doctor');

// default options
app.use(fileUpload());

// Ruta
app.put('/:type/:id', (req, res, next) => {

    var type = req.params.type;
    var id = req.params.id;

    // Validar tipo de coleccion

    var validTypes = ['doctors', 'hospitals', 'users'];
    if (validTypes.indexOf(type) < 0) {
        return res.status(400).json({
            ok: false,
            mensaje: 'Tipo de coleccion no es valida',
            errors: { message: 'Tipo de coleccion no es valida' }
        });
    }

    if (!req.files) {
        return res.status(400).json({
            ok: false,
            mensaje: 'Debe de seleccionar una imagen',
            errors: { message: 'No se subio ningun archivo' }
        });
    }

    // Obtener nombre del archivo

    var file = req.files.img;
    var cutName = file.name.split('.');
    var fileExtension = cutName[cutName.length - 1];

    // Extensiones validas

    var validExtensions = ['png', 'jpg', 'gif', 'jpeg'];

    if (validExtensions.indexOf(fileExtension) < 0) {
        return res.status(400).json({
            ok: false,
            mensaje: 'Extensión del archivo no valido',
            errors: { message: 'Las extensiones permitidas son: ' + validExtensions.join(', ') }
        });
    }

    // Nombre de archivo personalizado

    var fileName = `${ id }-${ new Date().getMilliseconds()}.${fileExtension}`;

    // Mover el archivo de temp a un path

    var path = `./uploads/${type}/${fileName}`;

    file.mv(path, err => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'El archivo no se movio',
                errors: err
            });
        }

        upForType(type, id, fileName, res);


    });

});

function upForType(type, id, fileName, res) {

    if (type === 'users') {

        User.findById(id, (err, user) => {

            if (!user) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Usuario no existe',
                    errors: { message: 'El id del usuario no existe' }
                });
            }

            var oldPath = './uploads/users/' + user.img;

            // Remover imagen antigua

            if (fs.existsSync(oldPath)) {
                fs.unlink(oldPath, () => {});
            }

            user.img = fileName;

            user.save((err, userUpdate) => {
                user.password = ':)';
                return res.status(200).json({
                    ok: true,
                    mensaje: 'La imagen se actualizo correctamente',
                    user: userUpdate
                });
            });

        });

    }

    if (type === 'hospitals') {

        Hospital.findById(id, (err, hospital) => {

            if (!hospital) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Hospital no existe',
                    errors: { message: 'El id del hospital no existe' }
                });
            }

            var oldPath = './uploads/hospitals/' + hospital.img;

            // Remover imagen antigua

            if (fs.existsSync(oldPath)) {
                fs.unlink(oldPath, () => {});
            }

            hospital.img = fileName;

            hospital.save((err, hospitalUpdate) => {
                return res.status(200).json({
                    ok: true,
                    mensaje: 'La imagen se actualizo correctamente',
                    hospital: hospitalUpdate
                });
            });

        });

    }

    if (type === 'doctors') {

        Doctor.findById(id, (err, doctor) => {

            if (!doctor) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Doctor no existe',
                    errors: { message: 'El id del doctor no existe' }
                });
            }

            var oldPath = './uploads/doctors/' + doctor.img;

            // Remover imagen antigua

            if (fs.existsSync(oldPath)) {
                fs.unlink(oldPath, () => {});
            }

            doctor.img = fileName;

            doctor.save((err, doctorUpdate) => {
                return res.status(200).json({
                    ok: true,
                    mensaje: 'La imagen se actualizo correctamente',
                    doctor: doctorUpdate
                });
            });

        });

    }

}

module.exports = app;