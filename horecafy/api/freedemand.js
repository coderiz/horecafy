var express = require('express');
var utils = require('./utils');
var constants = require('./constants');
var async = require('async');

module.exports = function () {

  var router = express.Router();

  // post free demand
  router.post('/', function (req, res, next) {

    if (!utils.validateParam({ 'name': 'customerId', 'value': req.body.customerId }, res)) return;
    if (!utils.validateParam({ 'name': 'demandText', 'value': req.body.demandText }, res)) return;

    var query = {
      sql: 'CreateFreeDemand @customerId, @demandText, @createdOn',
      parameters: [
        { name: 'customerId', value: req.body.customerId },
        { name: 'demandText', value: req.body.demandText },
        { name: 'createdOn', value: new Date() }
      ],
      multiple: true
    };

    var data = [];
    req.azureMobile.data.execute(query)
      .then(function (results) {
        if (results.length > 0) {
          if (results[0].errorCode) {
            data = utils.buildResponse(0, null, null, results[0].errorCode, '', []);
            res.status(200).json(data);
          } else {
            // console.log(results[1][0]);

            var customer = results[1][0];

            var fromName = constants.emailName;
            var fromEmail = constants.emailFrom;
            var toEmail = "restauradores@horecafy.com";
            var toName = "Horecafy";
            var subject = 'Lista personalizada';

            var demandText = req.body.demandText.replace("," , "<br />");
            demandText = demandText.replace('"', '');
            
            var body = `<p>Hola! El establecimiento ${customer.name} ${customer.hiddenId} con código postal ${customer.zipCode} en calle ${customer.address} ${customer.city} con email ${customer.email} y teléfono ${customer.contactMobile} necesita: ${demandText}</p>`;

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
              data = utils.buildResponse(results[0].length, null, null, '', '', results[0]);
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