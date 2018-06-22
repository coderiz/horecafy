var express = require('express');
var utils = require('./utils');
var constants = require('./constants');
require('../mailin.js');

module.exports = function () {
    var router = express.Router();

    // Testing email sending with SendGrid  
    router.post('/testEmail', function (req, res, next) {
        var fromName = req.body.fromName;
        var fromEmail = req.body.fromEmail;
        var toEmail = req.body.toEmail;
        var toName = req.body.toName;
        var subject = req.body.subject;
        var body = req.body.body;
        var attachment = [];

        var emailTo = JSON.parse('{"' + toEmail + '":"' + toName + '"}');
        var emailFrom = [fromEmail, fromName];

        utils.sendEmail(emailFrom, emailTo, subject, body, attachment, function (emailReponse) {
            var jsonEmailResponse = JSON.parse(emailReponse);
            // console.log('emailReponse.code -> ', jsonEmailResponse.code);
            if (jsonEmailResponse.code !== 'success') {
                res.json({
                    error: jsonEmailResponse.error,
                    mensaje: "No se puedo enviar el email."
                });
            }
            res.json({
                error: '',
                mensaje: "Prueba de email realizada con éxito."
            });
        });
    });

    router.post('/', function (req, res, next) {

        if (!utils.validateParam({ 'name': 'email', 'value': req.body.email }, res)) return;
        if (!utils.validateParam({ 'name': 'password', 'value': req.body.password }, res)) return;
        if (!utils.validateParam({ 'name': 'typeUser', 'value': req.body.typeUser }, res)) return;

        var query = {
            sql: 'GetLogin @email, @password, @typeUser',
            parameters: [
                { name: 'email', value: req.body.email },
                { name: 'password', value: utils.md5(req.body.password) },
                { name: 'typeUser', value: req.body.typeUser }
            ]
        };

        req.azureMobile.data.execute(query)
            .then(function (results) {

                if (results.length > 0) {
                    if (results[0].errorCode) {
                        const data = utils.buildResponse(0, null, null, results.errorCode, '', []);
                        res.status(200).json(data);
                    } else {
                        const data = utils.buildResponse(results.length, null, null, '', '', results);
                        res.status(200).json(data);
                    }
                } else {
                    const data = utils.buildResponse(0, null, null, constants.messages.DATA_NOT_FOUND, 'Data not found', []);
                    res.status(200).json(data);
                }
            })
            .catch(function (err) {
                const data = utils.buildResponse(0, null, null, constants.messages.ERROR, err, []);
                res.status(200).json(data);
            });
    });

    router.post('/admin', function (req, res, next) {

        if (!utils.validateParam({ 'name': 'email', 'value': req.body.email }, res)) return;
        if (!utils.validateParam({ 'name': 'password', 'value': req.body.password }, res)) return;

        var query = {
            sql: 'GetLoginAdmin @email, @password',
            parameters: [
                { name: 'email', value: req.body.email },
                { name: 'password', value: utils.md5(req.body.password) }
            ]
        };

        req.azureMobile.data.execute(query)
            .then(function (results) {

                if (results.length > 0) {
                    if (results[0].errorCode) {
                        const data = utils.buildResponse(0, null, null, results.errorCode, '', []);
                        res.status(200).json(data);
                    } else {
                        const data = utils.buildResponse(results.length, null, null, '', '', results);
                        res.status(200).json(data);
                    }
                } else {
                    const data = utils.buildResponse(0, null, null, constants.messages.DATA_NOT_FOUND, 'Data not found', []);
                    res.status(200).json(data);
                }
            })
            .catch(function (err) {
                const data = utils.buildResponse(0, null, null, constants.messages.ERROR, err, []);
                res.status(200).json(data);
            });
    });

    return router;
};