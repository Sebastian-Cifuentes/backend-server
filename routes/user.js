var express = require('express');
var app = express();
var bcrypt = require('bcryptjs');
var mdVerifyToken = require('../middlewares/autentication');

var User = require('../models/user');

// Obtener usuarios

app.get('/', (req, res, next) => {
    User.find({}, 'name email img role')
        .exec(
            (err, users) => {
                if (err) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Error cargando usuarios',
                        errors: err
                    });
                }

                res.status(200).json({
                    ok: true,
                    users: users
                });
            });
});

// Actualizar usuario

app.put('/:id', mdVerifyToken.verifyToken, (req, res) => {

    var id = req.params.id;
    var body = req.body;

    User.findById(id, (err, user) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar usuario',
                errors: err
            });
        }

        if (!user) {
            return res.status(400).json({
                ok: false,
                mensaje: 'El usuario con el id ' + id + ' no existe',
                errors: { message: 'No existe usuario con ese ID' }
            });
        }

        user.name = body.name;
        user.email = body.email;
        user.role = body.role;

        user.save((err, userSave) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error al actualizar usuario',
                    errors: err
                });
            }

            userSave.password = ':)';

            res.status(200).json({
                ok: true,
                user: userSave
            });
        });
    });

});

// Crear usuarios

app.post('/', mdVerifyToken.verifyToken, (req, res) => {

    var body = req.body;

    var user = new User({
        name: body.name,
        email: body.email,
        password: bcrypt.hashSync(body.password, 10),
        img: body.img,
        role: body.role
    });

    user.save((err, userSave) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error creando un usario',
                errors: err
            });
        }

        res.status(201).json({
            ok: true,
            userSave: userSave,
            userRequest: req.user
        });

    });

});

// Borrar un usuario por el id

app.delete('/:id', mdVerifyToken.verifyToken, (req, res) => {
    var id = req.params.id;

    User.findByIdAndRemove(id, (err, userDelete) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error borrando usario',
                errors: err
            });
        }

        if (!userDelete) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error borrando usuario',
                errors: { mensaje: 'No se encontro el id del usuario' }
            });
        }

        res.status(200).json({
            ok: true,
            user: userDelete
        });
    });

});

module.exports = app;