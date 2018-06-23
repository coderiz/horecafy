var express = require('express');
var utils = require('./utils');
var constants = require('./constants');
var randomstring = require('randomstring');
require('../mailin.js');

module.exports = function () {

    var router = express.Router();

    router.post('/', function (req, res, next) {

        if (!utils.validateParam({ 'name': 'email', 'value': req.body.email }, res)) return;
        if (!utils.validateParam({ 'name': 'typeUser', 'value': req.body.typeUser }, res)) return;

        var query = {
            sql: 'GetCustomerByEmail @email, @typeUser',
            parameters: [
                { name: 'email', value: req.body.email },
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
                        // const data = utils.buildResponse(results.length, null, null, '', '', results);
                        var customer = results[0];
                        var query = {
                            sql: 'CreatePasswordResetRequest @userId, @typeUser, @token, @createdOn',
                            parameters: [
                                { name: 'userId', value: customer.hiddenId },
                                { name: 'typeUser', value: req.body.typeUser },
                                { name: 'token', value: randomstring.generate({length: 6,charset: 'alphabetic'}) },
                                { name: 'createdOn', value: new Date() }
                            ]
                        };

                        var data = [];
                        req.azureMobile.data.execute(query)
                            .then(function (results) {
                                if (results.length > 0) {
                                    if (results[0].errorCode) {
                                        data = utils.buildResponse(0, null, null, results[0].errorCode, '', []);
                                        res.status(200).json(data);
                                    } else {
                                        var fromName = constants.emailName;
                                        var fromEmail = constants.emailFrom;
                                        var toEmail = "info@aipxperts.com";
                                        var toName = "testing";
                                        var subject = 'Horecafy - Registro de distribuidor';
                                        var body = `Hola, gracias por regístrate. Ahora crea tus listas con las familias de productos que comercializas para que podamos hacerte llegar las necesidades de los restauradores registrados.</p>

                                                    <p>Si tienes que incorporar muchas familias a tus listas ponte en contacto con nosotros en distribuidores@horecafy.com y te ayudaremos a subir tu catálogo en un excel en lugar de hacerlo una a una en la app.</p> 
                                                    
                                                    <p>Gracias por usar Horecafy</p>`;
                                        var attachment = [];

                                        var emailTo = JSON.parse('{"' + toEmail + '":"' + toName + '"}');
                                        var emailFrom = [fromEmail, fromName];
                                        
                                        utils.sendEmail(emailFrom, emailTo, subject, body, attachment, function (emailReponse) {
                                            var jsonEmailResponse = JSON.parse(emailReponse);
                                            // console.log('emailReponse.code -> ', jsonEmailResponse.code);
                                            if (jsonEmailResponse.code !== 'success') {
                                                console.log(`Error during email sending -> ${emailReponse}`);
                                                data = utils.buildResponse(0, null, null, constants.messages.SENDING_EMAIL_ERROR, jsonEmailResponse.message, []);
                                                res.status(200).json(data);
                                                return;
                                            }
                                            data = utils.buildResponse(results.length, null, null, '', '', results);
                                            res.status(200).json(data);
                                        });
                                    }
                                } else {
                                    data = utils.buildResponse(0, null, null, constants.messages.DATA_NOT_FOUND, 'Data not found', []);
                                    res.status(200).json(data);
                                }
                            })
                            .catch(function (err) {
                                console.log(err);
                                data = utils.buildResponse(0, null, null, constants.messages.ERROR, err, []);
                                res.status(200).json(data);
                            });
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

    router.put('/', function (req, res, next) {

        //console.log('req', req.body);
        if (!utils.validateParam({ 'name': 'email', 'value': req.body.email }, res)) return;
        if (!utils.validateParam({ 'name': 'typeUser', 'value': req.body.typeUser }, res)) return;
        if (!utils.validateParam({ 'name': 'token', 'value': req.body.token }, res)) return;
        if (!utils.validateParam({ 'name': 'password', 'value': req.body.password }, res)) return;

        var query = {
            sql: 'GetCustomerByEmail @email, @typeUser',
            parameters: [
                { name: 'email', value: req.body.email },
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
                        // const data = utils.buildResponse(results.length, null, null, '', '', results);
                        var customer = results[0];
                        var query = {
                            sql: 'UpdatePasswordResetRequest @userId, @typeUser, @token, @password',
                            parameters: [
                                { name: 'userId', value: customer.hiddenId },
                                { name: 'typeUser', value: req.body.typeUser },
                                { name: 'token', value: req.body.token },
                                { name: 'password', value: utils.md5(req.body.password) }
                            ]
                        };

                        var data = [];
                        req.azureMobile.data.execute(query)
                            .then(function (results) {
                                if (results.length > 0) {
                                    if (results[0].errorCode) {
                                        data = utils.buildResponse(0, null, null, results[0].errorCode, '', []);
                                        res.status(200).json(data);
                                    } else {
                                        var fromName = constants.emailName;
                                        var fromEmail = constants.emailFrom;
                                        var toEmail = "info@aipxperts.com";
                                        var toName = "testing";
                                        var subject = 'Horecafy - Registro de distribuidor';
                                        var body = `Hola, gracias por regístrate. Ahora crea tus listas con las familias de productos que comercializas para que podamos hacerte llegar las necesidades de los restauradores registrados.</p>

                                                    <p>Si tienes que incorporar muchas familias a tus listas ponte en contacto con nosotros en distribuidores@horecafy.com y te ayudaremos a subir tu catálogo en un excel en lugar de hacerlo una a una en la app.</p> 
                                                    
                                                    <p>Gracias por usar Horecafy</p>`;
                                        var attachment = [];

                                        var emailTo = JSON.parse('{"' + toEmail + '":"' + toName + '"}');
                                        var emailFrom = [fromEmail, fromName];

                                        utils.sendEmail(emailFrom, emailTo, subject, body, attachment, function (emailReponse) {
                                            var jsonEmailResponse = JSON.parse(emailReponse);
                                            // console.log('emailReponse.code -> ', jsonEmailResponse.code);
                                            if (jsonEmailResponse.code !== 'success') {
                                                console.log(`Error during email sending -> ${emailReponse}`);
                                                data = utils.buildResponse(0, null, null, constants.messages.SENDING_EMAIL_ERROR, jsonEmailResponse.message, []);
                                                res.status(200).json(data);
                                                return;
                                            }
                                            data = utils.buildResponse(results.length, null, null, '', '', results);
                                            res.status(200).json(data);
                                        });
                                    }
                                } else {
                                    data = utils.buildResponse(0, null, null, constants.messages.DATA_NOT_FOUND, 'Data not found', []);
                                    res.status(200).json(data);
                                }
                            })
                            .catch(function (err) {
                                console.log(err);
                                data = utils.buildResponse(0, null, null, constants.messages.ERROR, err, []);
                                res.status(200).json(data);
                            });
                    }
                } else {
                    const data = utils.buildResponse(0, null, null, constants.messages.DATA_NOT_FOUND, 'Data not found', []);
                    res.status(200).json(data);
                }
            })
            .catch(function (err) {
                console.log(err);
                const data = utils.buildResponse(0, null, null, constants.messages.ERROR, err, []);
                res.status(200).json(data);
            });
    });

    return router;
};