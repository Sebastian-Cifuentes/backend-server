var express = require('express');
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');
var SEED = require('../config/config').SEED;

var app = express();

var User = require('../models/user');

// Autenticación de google
async function verify(token) {
    const ticket = await client.verifyIdToken({
        idToken: token,
        audience: CLIENT_ID, // Specify the CLIENT_ID of the app that accesses the backend
        // Or, if multiple clients access the backend:
        //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
    });
    const payload = ticket.getPayload();
    // const userid = payload['sub'];
    // If request specified a G Suite domain:
    //const domain = payload['hd'];
    return {
        name: payload.name,
        email: payload.email,
        img: payload.picture,
        google: true
    };
}
var CLIENT_ID = require('../config/config').CLIENT_ID;
const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(CLIENT_ID);

app.post('/google', async(req, res) => {

    var token = req.body.idtoken;
    var googleUser = await verify(token)
        .catch(err => {
            return res.status(403).json({
                ok: false,
                mensaje: 'Token invalido'
            });
        });

    User.findOne({ email: googleUser.email }, (err, userDB) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error autenticando al usuario',
                errors: err
            });
        }

        if (userDB) {

            if (userDB.google === false) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Debe de usar la autenticación normal'
                });
            }

            if (userDB.google === true) {
                var token = jwt.sign({ user: userDB }, SEED, { expiresIn: 14400 }); // Valido por 4 horas

                res.status(200).json({
                    ok: true,
                    user: userDB,
                    token: token,
                    id: userDB._id
                });
            }

        } else {
            var user = new User();

            user.name = googleUser.name;
            user.email = googleUser.email;
            user.img = googleUser.img;
            user.google = googleUser.google;
            user.password = ':)';

            user.save((err, userDB) => {
                var token = jwt.sign({ user: userDB }, SEED, { expiresIn: 14400 }); // Valido por 4 horas

                res.status(200).json({
                    ok: true,
                    user: userDB,
                    token: token,
                    id: userDB._id
                });
            })
        }

    });

    // res.status(200).json({
    //     ok: true,
    //     Solicitud: 'Solicitud correcta',
    //     googleUser: googleUser
    // });
});


// Autenticación normal
app.post('/', (req, res) => {

    var body = req.body;

    User.findOne({ email: body.email }, (err, userDB) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar el usuario',
                errors: err
            });
        }

        if (!userDB) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Credenciales incorrectas - email',
                errors: err
            });
        }

        if (!bcrypt.compareSync(body.password, userDB.password)) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Credenciales incorrectas - password',
                errors: err
            });
        }

        // Crear token!
        userDB.password = '';
        var token = jwt.sign({ user: userDB }, SEED, { expiresIn: 14400 }); // Valido por 4 horas

        res.status(200).json({
            ok: true,
            user: userDB,
            token: token,
            id: userDB._id
        });
    });


});



module.exports = app;