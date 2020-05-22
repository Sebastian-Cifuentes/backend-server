var jwt = require('jsonwebtoken');
var SEED = require('../config/config').SEED;

// Verificar token

exports.verifyToken = function(req, res, next) {

    var token = req.query.token;

    jwt.verify(token, SEED, (err, decoded) => {
        if (err) {
            return res.status(401).json({
                ok: false,
                mensaje: 'Token incorrecto',
                errors: err
            });
        }

        req.user = decoded.user;

        next();
    });

};

exports.verifyAdmin = function(req, res, next) {
    var user = req.user;

    if (user.role === 'ADMIN_ROLE') {
        next();
        return;
    } else {
        return res.status(401).json({
            ok: false,
            mensaje: 'El rol del usuario no es permitido para esta petición',
            errors: { message: 'El usuario no es un admin' }
        });
    }
}

exports.verifyAdmin_o_mismousuario = function(req, res, next) {
    var user = req.user;
    var id = req.params.id;

    if (user.role === 'ADMIN_ROLE' || user._id === id) {
        next();
        return;
    } else {
        return res.status(401).json({
            ok: false,
            mensaje: 'No es administrador ni es el mismo usuario',
            errors: { message: 'El usuario no es un admin' }
        });
    }
}