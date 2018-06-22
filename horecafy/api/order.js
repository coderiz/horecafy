var express = require('express');
var utils = require('./utils');
var constants = require('./constants');

module.exports = function () {

  var router = express.Router();

  // post order
  router.post('/', function (req, res, next) {

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
            // var toEmail = req.body.email;
            // var toName = req.body.name;
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
        data = utils.buildResponse(0, null, null, constants.messages.ERROR, err, []);
        res.status(200).json(data);
      });
  });

  // post order
  router.post('/invite', function (req, res, next) {

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
      .then(function (results) {
        if (results.length > 0) {
          if (results[0].errorCode) {
            data = utils.buildResponse(0, null, null, results[0].errorCode, '', []);
            res.status(200).json(data);
          } else {
            var fromName = constants.emailName;
            var fromEmail = constants.emailFrom;
            // var toEmail = req.body.email;
            // var toName = req.body.name;
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
        data = utils.buildResponse(0, null, null, constants.messages.ERROR, err, []);
        res.status(200).json(data);
      });
  });

  return router;
}