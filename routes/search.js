var express = require('express');
var app = express();

var Hospital = require('../models/hospital');
var Doctor = require('../models/doctor');
var User = require('../models/user');

// Busqueda por colección
app.get('/collection/:collection/:search', (req, res) => {
    var since = req.query.since || 0;
    since = Number(since);

    var search = req.params.search;
    var collection = req.params.collection;
    var regex = new RegExp(search, 'i');

    var promise;

    switch (collection) {
        case 'users':
            promise = searchUsers(since, search, regex);
            break;
        case 'hospitals':
            promise = searchHospitals(since, search, regex);
            break;
        case 'doctors':
            promise = searchDoctors(since, search, regex);
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
            [collection]: data.resp1,
            totalRegisters: data.resp2
        });
    });

});

// Busqueda en todas las colecciones
app.get('/all/:search', (req, res, next) => {
    var since = req.query.since || 0;
    since = Number(since);

    var search = req.params.search;
    var regex = new RegExp(search, 'i');

    Promise.all([
            searchUsers(since, search, regex, ),
            searchHospitals(since, search, regex),
            searchDoctors(since, search, regex)
        ])
        .then(resp => {
            res.status(200).json({
                ok: true,
                users: resp[0].resp1,
                hospitals: resp[1].resp1,
                doctors: resp[2].resp1
            });
        });
});

function searchUsers(since, search, regex) {
    return new Promise((resolve, reject) => {
        const resp = { resp1: {}, resp2: 0 }
        User.find({}, 'name email img role google')
            .skip(since)
            .limit(5)
            .or([{ 'name': regex }, { 'email': regex }])
            .exec((err, users) => {
                if (err) {
                    reject('Error al buscar usuarios', err);
                }
                resp.resp1 = users;
                User.count({}, (err, count) => {
                    resp.resp2 = count;
                    resolve(resp);
                })
            });
    });
}


function searchHospitals(since, search, regex) {
    const resp = { resp1: {}, resp2: 0 }
    return new Promise((resolve, reject) => {
        Hospital.find({ name: regex })
            .skip(since)
            .limit(5)
            .populate('user', 'name email role')
            .exec(
                (err, hospitals) => {
                    if (err) {
                        reject('Error al buscar hospitales', err);
                    }
                    resp.resp1 = hospitals;
                    Hospital.count({}, (err, count) => {
                        resp.resp2 = count;
                        resolve(resp);
                    });
                });
    });
}

function searchDoctors(since, search, regex) {
    const resp = { resp1: {}, resp2: 0 }
    return new Promise((resolve, reject) => {
        Doctor.find({ name: regex })
            .skip(since)
            .limit(5)
            .populate('user', 'name email role')
            .populate('hospital')
            .exec((err, doctors) => {
                if (err) {
                    reject('Error al buscar doctores', err);
                }
                resp.resp1 = doctors;
                Doctor.count({}, (err, count) => {
                    resp.resp2 = count;
                    resolve(resp);
                });
            });
    });
}

module.exports = app;