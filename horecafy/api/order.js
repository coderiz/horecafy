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
                { name: 'deliveryTime', value: req.body.deliveryTime || "" },
                { name: 'comments', value: req.body.comments || "" },
                { name: 'wholeSalerConfirmation', value: 0 },
                { name: 'products', value: req.body.products }
            ],
            multiple: true
        };

        var data = [];
        req.azureMobile.data.execute(query)
            .then(function(results) {
                console.log(results);
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
                        var subject = 'Pedido a entregar';
                        
                        var deliveryTime = "";
                        if (order.deliveryTime != "" && order.deliveryTime != "1970-01-01T00:00:00.000Z") {
                            deliveryTime = `a la hora ${order.deliveryTime}`;
                        }

                        var body = `<p>El ${customer.contactName} ${customer.name} en ${customer.address}, ${customer.zipCode} ${customer.city} telf: ${customer.contactMobile} necesita que le entreguen el día ${moment(order.deliveryDate).format('MMM Do YYYY')} ${deliveryTime}  los siguientes productos:</p>`;
                        body = body + `<ul>`;
                        orderProducts.forEach(orderProduct => {
                            body = `<li>` + body + `${orderProduct.product} / ${orderProduct.quantity} </li>`;
                        });
                        body = body + `</ul>`;                        
                        body = body + `<p>Por favor confirma en este enlace que vas a entregar el pedido correctamente <a href="${confirmURL}">${confirmURL}</a>.</p>`;

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

                        var subject = 'Confirmación envio pedido';
                        var body = `El distribuidor ${wholesaler.contactName} ha confirmado la entrega a el ${customer.contactName} ${customer.name} el día ${moment(order.deliveryDate).format('MMM Do YYYY')} del siguiente producto:`;

                        body = body + `<ul>`;
                        orderProducts.forEach(orderProduct => {
                            body = `<li>` + body + `${orderProduct.product} ${orderProduct.quantity} </li>`;
                        });
                        body = body + `</ul>`;

                        body = body + `
                        <p>Ante cualquier duda puedes contactar directamente con el distribuidor.</p>
                        <p>Un saludo, equipo Horecafy.</p>`;

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

                        var customer = results[1][0];

                        var fromName = constants.emailName;
                        var fromEmail = constants.emailFrom;
                        var toEmail = req.body.email;
                        var toName = req.body.name;
                        var subject = `${customer.name} te quiere invitar a Horecafy.`;

                        var body = `<p>¡Hola!</p> 
                                    <p>El ${customer.contactName} ${customer.name} de ${customer.address}, ${customer.zipCode} de ${customer.city} te ha enviado una invitación para poder enviarte pedidos a través de  Horecafy.</p> 
                                    <p>Visita nuestra web y ,únete ya a nuestra familia! Esperamos recibir noticias tuyas pronto.</p> 
                                    <p>Un saludo, equipo Horecafy</p>`;

                                    console.log(body);

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
                            data = utils.buildResponse(results[0].length, null, null, '', '', results[0]);
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