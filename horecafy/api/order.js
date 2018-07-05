var express = require('express');
var utils = require('./utils');
var constants = require('./constants');
var moment = require('moment');

module.exports = function() {

    var router = express.Router();
    moment.locale('es');

    // post order
    router.post('/', function(req, res, next) {

        console.log('req', req.body);
        if (!utils.validateParam({ 'name': 'customerId', 'value': req.body.customerId }, res)) return;
        if (!utils.validateParam({ 'name': 'wholesalerId', 'value': req.body.wholesalerId }, res)) return;
        if (!utils.validateParam({ 'name': 'deliveryDate', 'value': req.body.deliveryDate }, res)) return;
        if (!utils.validateParam({ 'name': 'products', 'value': req.body.products }, res)) return;

        var query = {
            sql: 'CreateOrder @customerId, @createdOn, @wholesalerId, @deliveryDate, @deliveryTime, @comments, @wholeSalerConfirmation, @products',
            parameters: [
                { name: 'customerId', value: req.body.customerId },
                { name: 'createdOn', value: new Date() },
                { name: 'wholesalerId', value: req.body.wholesalerId },
                { name: 'deliveryDate', value: req.body.deliveryDate },
                { name: 'deliveryTime', value: req.body.deliveryTime },
                { name: 'comments', value: req.body.comments },
                { name: 'wholeSalerConfirmation', value: 0 },
                { name: 'products', value: req.body.products }
            ],
            multiple: true
        };

        var data = [];
        req.azureMobile.data.execute(query)
            .then(function(results) {
                if (results.length > 0) {
                    if (results[0].errorCode) {
                        data = utils.buildResponse(0, null, null, results[0].errorCode, '', []);
                        res.status(200).json(data);
                    } else {

                        var order = results[0][0];
                        var orderProducts = results[1];
                        var wholesaler = results[2][0];
                        var customer = results[3][0];

                        var confirmURL = req.protocol + '://' + req.get('host') + "/api/v1/order/" + order.id + "/confirm";

                        var fromName = constants.emailName;
                        var fromEmail = constants.emailFrom;
                        var toEmail = wholesaler.email;
                        var toName = wholesaler.name;
                        var subject = 'Horecafy - Pedido a entregar';
                        var body = `<p>El ${customer.contactName} RESTAURANTE ${customer.name} en ${customer.address} necesita que le entregue el dia x a la hora ${moment(order.deliveryDate).format('MMM Do YYYY')}:`;

                        body = body + `<p>`;
                        orderProducts.forEach(orderProduct => {
                            body = body + `${orderProduct.product} ${orderProduct.quantity} <br />`;
                        });
                        body = body + `</p>`;

                        body = body + `
                        <p><a href="${confirmURL}">Confirmar pedido</a></p>

                        
                        <p>Por favor confirma en este enlace que vas a entregar el pedido correctamente. Cualquier duda puedes contactar con el restaurador directamente.
                            </p>`;

                        var attachment = [];

                        var emailTo = JSON.parse('{"' + toEmail + '":"' + toName + '"}');
                        var emailFrom = [fromEmail, fromName];

                        utils.sendEmail(emailFrom, emailTo, subject, body, attachment, function(emailReponse) {
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
            .catch(function(err) {
                data = utils.buildResponse(0, null, null, constants.messages.ERROR, err, []);
                res.status(200).json(data);
            });
    });

    // confirm order by wholesaler
    router.get('/:orderId/confirm', function(req, res, next) {

        console.log(req.params.orderId);
        var query = {
            sql: 'AcceptOrder @orderId',
            parameters: [
                { name: 'orderId', value: req.params.orderId }
            ],
            multiple: true
        };

        var data = [];
        req.azureMobile.data.execute(query)
            .then(function(results) {

                if (results.length > 0) {
                    if (results[0].errorCode) {
                        data = utils.buildResponse(0, null, null, results[0].errorCode, '', []);
                        res.status(200).json(data);
                    } else {

                        var order = results[0][0];
                        var orderProducts = results[1];
                        var wholesaler = results[2][0];
                        var customer = results[3][0];

                        var fromName = constants.emailName;
                        var fromEmail = constants.emailFrom;
                        var toEmail = customer.email;
                        var toName = customer.name;

                        var subject = 'Horecafy - Pedido a entregar';
                        var body = `<p>El distribuidor ${wholesaler.contactName} ha confirmado la entrega al ${customer.contactName} RESTAURANTE ${customer.name} en ${customer.address} necesita que le entregue el dia x a la hora ${moment(order.deliveryDate).format('MMM Do YYYY')} de los siguientes productos:`;

                        body = body + `<p>`;
                        orderProducts.forEach(orderProduct => {
                            body = body + `${orderProduct.product} ${orderProduct.quantity} <br />`;
                        });
                        body = body + `</p>`;

                        body = body + `
                        <p>Ante cualquier duda puedes contactar directamente con el distribuidor.</p>
                        <p>Gracias.</p>`;
                        var attachment = [];

                        var emailTo = JSON.parse('{"' + toEmail + '":"' + toName + '"}');
                        var emailFrom = [fromEmail, fromName];

                        utils.sendEmail(emailFrom, emailTo, subject, body, attachment, function(emailReponse) {
                            return res.redirect("http://horecafy.com/gracias/");
                        });
                    }
                } else {
                    return res.redirect("http://horecafy.com/");
                }
            })
            .catch(function(err) {
                return res.redirect("http://horecafy.com/");
            });
    })

    // post order
    router.post('/invite', function(req, res, next) {

        console.log('req', req.body);
        if (!utils.validateParam({ 'name': 'customerId', 'value': req.body.customerId }, res)) return;
        if (!utils.validateParam({ 'name': 'name', 'value': req.body.name }, res)) return;

        var query = {
            sql: 'InviteWholesaler @customerId, @createdOn, @name, @email, @phone, @contact',
            parameters: [
                { name: 'customerId', value: req.body.customerId },
                { name: 'createdOn', value: new Date() },
                { name: 'name', value: req.body.name },
                { name: 'email', value: req.body.email },
                { name: 'phone', value: req.body.phone },
                { name: 'contact', value: req.body.contact }
            ]
        };

        var data = [];
        req.azureMobile.data.execute(query)
            .then(function(results) {
                if (results.length > 0) {
                    if (results[0].errorCode) {
                        data = utils.buildResponse(0, null, null, results[0].errorCode, '', []);
                        res.status(200).json(data);
                    } else {
                        var fromName = constants.emailName;
                        var fromEmail = constants.emailFrom;
                        var toEmail = req.body.email;
                        var toName = req.body.name;
                        var subject = 'Horecafy - Registro de distribuidor';
                        var body = `Hola, gracias por regístrate. Ahora crea tus listas con las familias de productos que comercializas para que podamos hacerte llegar las necesidades de los restauradores registrados.</p>

          <p>Si tienes que incorporar muchas familias a tus listas ponte en contacto con nosotros en distribuidores@horecafy.com y te ayudaremos a subir tu catálogo en un excel en lugar de hacerlo una a una en la app.</p> 
          
          <p>Gracias por usar Horecafy</p>`;
                        var attachment = [];

                        var emailTo = JSON.parse('{"' + toEmail + '":"' + toName + '"}');
                        var emailFrom = [fromEmail, fromName];

                        utils.sendEmail(emailFrom, emailTo, subject, body, attachment, function(emailReponse) {
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
            .catch(function(err) {
                data = utils.buildResponse(0, null, null, constants.messages.ERROR, err, []);
                res.status(200).json(data);
            });
    });

    return router;
}