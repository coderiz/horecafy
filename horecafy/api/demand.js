var express = require('express');
var utils = require('./utils');
var constants = require('./constants');
var async = require('async');

module.exports = function () {

  var router = express.Router();

  // Get demands
  router.get('/', function (req, res, next) {

    var query = {
      sql: 'GetDemands',
      parameters: []
    };
    req.azureMobile.data.execute(query)
      .then(function (results) {
        if (results.length > 0) {
          if (results[0].errorCode) {
            const data = utils.buildResponse(0, null, null, results[0].errorCode, '', []);
            res.status(200).json(data);
          } else {
            // console.log('JSON output -> ', JSON.parse(results[0]["Demands"]));
            let dataFromDB = JSON.parse(results[0]["Demands"]);
            const data = utils.buildResponse(dataFromDB.length, null, null, '', '', dataFromDB);
            res.status(200).json(data);
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

  // Get demand by id
  router.get('/:id', function (req, res, next) {
    var query = {
      sql: 'GetDemand @id',
      parameters: [
        { name: 'id', value: req.params.id }
      ]
    };
    req.azureMobile.data.execute(query)
      .then(function (results) {
        if (results.length > 0) {
          if (results[0].errorCode) {
            const data = utils.buildResponse(0, null, null, results[0].errorCode, '', []);
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

  // share demand
  router.get('/share/:id', function (req, res, next) {

    var query = {
      sql: 'ShareDemand @id',
      parameters: [
        { name: 'id', value: req.params.id }
      ],
      multiple: true
    };

    req.azureMobile.data.execute(query)
      .then(function (results) {
        
        if (results.length > 0) {
          if (results[0].errorCode) {
            const data = utils.buildResponse(0, null, null, results[0].errorCode, '', []);
            res.status(200).json(data);
          } else {
            let dataFromDB = JSON.parse(results[0][0].WholeSalersToSendNotifications);
            if (dataFromDB) {
              // Try to send email to WholeSalers
              var notificationsSent = [];
              async.each(dataFromDB,
                (notification, cb) => {

                  var fromName = constants.emailName;
                  var fromEmail = constants.emailFrom;
                  var toEmail = notification.email;
                  var toName = notification.name;

                  var subject = 'Propuesta de oferta';
                  var body = `<p>Hola, has recibido una propuesta de oferta de un restaurador del código postal ${notification.Customer.zipCode}. Realiza tu propuesta en la app y se la haremos llegar al restaurador.

                    Si tienes que realizar varias ofertas ponte en contacto con nosotros en distribuidores@horecafy y te ayudaremos a subir las ofertas en un excel en lugar de hacer una a una en la app.</p><p>Gracias por usar Horecafy</p>`;

                  var attachment = [];

                  var emailTo = JSON.parse('{"' + toEmail + '":"' + toName + '"}');
                  var emailFrom = [fromEmail, fromName];

                  utils.sendEmail(emailFrom, emailTo, subject, body, attachment, function (emailReponse) {
                    var jsonEmailResponse = JSON.parse(emailReponse);
                    // console.log('emailReponse.code -> ', jsonEmailResponse.code);
                    if (jsonEmailResponse.code !== 'success') {
                      cb(`Error during email sent to wholesaler -> ${notification.id}`);
                    }
                    else {
                      notificationsSent.push(notification);
                      cb();
                    }
                  });
                },
                (err) => {

                  if (err) {
                    console.log(err);
                    // data = utils.buildResponse(0, null, null, constants.messages.SENDING_EMAIL_ERROR, error, []);
                  }
                  else {
                    //data = utils.buildResponse(notificationsSent.length, null, null, constants.messages.SENDING_EMAIL_SUCCESS, 'Emails sent successfully', notificationsSent);
                    data = utils.buildResponse(0, null, null, '', '', []);
                  }
                  res.status(200).json(data);
                }
              );
            } else {
              data = utils.buildResponse(0, null, null, '', '', []);
              res.status(200).json(data);
            }
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

  // post demand
  router.post('/', function (req, res, next) {

    console.log(req.body);

    //console.log('req', req.body);
    if (!utils.validateParam({ 'name': 'customerId', 'value': req.body.customerId }, res)) return;
    if (!utils.validateParam({ 'name': 'familyId', 'value': req.body.familyId }, res)) return;
    if (!utils.validateParam({ 'name': 'typeOfFormatId', 'value': req.body.typeOfFormatId }, res)) return;

    var query = {
      sql: 'CreateDemand @customerId, @familyId, @quantyPerMonth, @typeOfFormatId, @targetPrice, @brand, @format, @comments, @createdOn, @borrado',
      parameters: [
        { name: 'customerId', value: req.body.customerId },
        { name: 'familyId', value: req.body.familyId },
        { name: 'quantyPerMonth', value: req.body.quantyPerMonth },
        { name: 'typeOfFormatId', value: req.body.typeOfFormatId },
        { name: 'targetPrice', value: req.body.targetPrice },
        { name: 'brand', value: req.body.brand },
        { name: 'format', value: req.body.format },
        { name: 'comments', value: req.body.comments },
        { name: 'createdOn', value: new Date() },
        { name: 'borrado', value: false }
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
            var fromName = constants.emailName;
            var fromEmail = constants.emailFrom;
            var toEmail = results[1][0].email;
            var toName = results[1][0].name;
            var subject = 'Horecafy - Lista creada por restaurador';
            var body = `<p>Hola, gracias por crear una lista con las familias de productos que consumes. Si compartes la lista con los distribuidores podrás recibir ofertas que podrás aprovechar.</p><p>Gracias por usar Horecafy</p>`;
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

    // req.azureMobile.data.execute(query)
    // .then(function (results) {
    //   if (results.length > 0) {
    //     if (results[0].errorCode) {
    //       const data = utils.buildResponse(0, null, null, results[0].errorCode, '', []);
    //       res.status(200).json(data);
    //     } else {
    //       const data = utils.buildResponse(results.length, null, null, '', '', results);
    //       res.status(200).json(data);
    //     }        
    //   } else {
    //     const data = utils.buildResponse(0, null, null, constants.messages.DATA_NOT_FOUND, 'Data not found', []);
    //     res.status(200).json(data);
    //   }
    // })
    // .catch(function (err) {
    //   const data = utils.buildResponse(0, null, null, constants.messages.ERROR, err, []);
    //   res.status(200).json(data);
    // });    

  });

  // put demand
  router.put('/', function (req, res, next) {

    //console.log('req', req.body);
    if (!utils.validateParam({ 'name': 'customerId', 'value': req.body.customerId }, res)) return;
    if (!utils.validateParam({ 'name': 'familyId', 'value': req.body.familyId }, res)) return;
    if (!utils.validateParam({ 'name': 'typeOfFormatId', 'value': req.body.typeOfFormatId }, res)) return;

    var query = {
      sql: 'UpdateDemand @id, @customerId, @familyId, @quantyPerMonth, @typeOfFormatId, @targetPrice, @brand, @format, @comments',
      parameters: [
        { name: 'id', value: req.body.id },
        { name: 'customerId', value: req.body.customerId },
        { name: 'familyId', value: req.body.familyId },
        { name: 'quantyPerMonth', value: req.body.quantyPerMonth },
        { name: 'typeOfFormatId', value: req.body.typeOfFormatId },
        { name: 'targetPrice', value: req.body.targetPrice },
        { name: 'brand', value: req.body.brand },
        { name: 'format', value: req.body.format },
        { name: 'comments', value: req.body.comments }
      ]
    };

    req.azureMobile.data.execute(query)
      .then(function (results) {
        if (results.length > 0) {
          if (results[0].errorCode) {
            const data = utils.buildResponse(0, null, null, results[0].errorCode, '', []);
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

  // delete demand
  router.delete('/:id', function (req, res, next) {

    var query = {
      sql: 'DeleteDemand @id',
      parameters: [
        { name: 'id', value: req.params.id }
      ]
    };

    req.azureMobile.data.execute(query)
      .then(function (results) {
        if (results.length > 0) {
          if (results[0].errorCode) {
            const data = utils.buildResponse(0, null, null, results[0].errorCode, '', []);
            res.status(200).json(data);
          } else {
            const data = utils.buildResponse(results[0].totalRows, null, null, '', '', []);
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
}