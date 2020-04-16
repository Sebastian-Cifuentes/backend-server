var express = require('express');
var app = express();

var Hospital = require('../models/hospital');
var Doctor = require('../models/doctor');
var User = require('../models/user');

// Busqueda por colección
app.get('/collection/:collection/:search', (req, res) => {
    var search = req.params.search;
    var collection = req.params.collection;
    var regex = new RegExp(search, 'i');

    var promise;

    switch (collection) {
        case 'users':
            promise = searchUsers(search, regex);
            break;
        case 'hospitals':
            promise = searchHospitals(search, regex);
            break;
        case 'doctors':
            promise = searchDoctors(search, regex);
            break;
        default:
            return res.status(400).json({
                ok: false,
                mensaje: 'Los tipos de busqueda son: users, hospitals, doctors',
                error: { message: 'Solicitud no valida' }
            });
    }

    promise.then(data => {
        res.status(200).json({
            ok: true,
            [collection]: data
        });
    });

});

// Busqueda en todas las colecciones
app.get('/all/:search', (req, res, next) => {

    var search = req.params.search;
    var regex = new RegExp(search, 'i');

    Promise.all([
            searchUsers(search, regex),
            searchHospitals(search, regex),
            searchDoctors(search, regex)

        ])
        .then(resp => {
            res.status(200).json({
                ok: true,
                users: resp[2],
                hospitals: resp[0],
                doctors: resp[1],
            });
        });
});


function searchUsers(search, regex) {
    return new Promise((resolve, reject) => {
        User.find({}, 'name email img role')
            .or([{ 'name': regex }, { 'email': regex }])
            .exec((err, users) => {
                if (err) {
                    reject('Error al buscar usuarios', err);
                }
                resolve(users);
            });
    });
}


function searchHospitals(search, regex) {
    return new Promise((resolve, reject) => {
        Hospital.find({ name: regex })
            .populate('user', 'name email role')
            .exec(
                (err, hospitals) => {
                    if (err) {
                        reject('Error al buscar hospitales', err);
                    }
                    resolve(hospitals);
                });
    });
}

function searchDoctors(search, regex) {
    return new Promise((resolve, reject) => {
        Doctor.find({ name: regex })
            .populate('user', 'name email role')
            .populate('hospital')
            .exec((err, doctors) => {
                if (err) {
                    reject('Error al buscar doctores', err);
                }
                resolve(doctors);
            });
    });
}

module.exports = app;