var express = require('express');
var utils = require('./utils');
var constants = require('./constants');
var async = require('async');
var multer = require('multer');

module.exports = function () {

  var router = express.Router();

  // Get demands
  router.get('/:typeUser(wholesaler|customer)/:id', function (req, res, next) {

    var query = {
      sql: 'GetBusinessVisits @id, @typeUser',
      parameters: [
        { name: 'id', value: req.params.id },
        { name: 'typeUser', value: req.params.typeUser },
      ]
    };
    req.azureMobile.data.execute(query)
      .then(function (results) {
        if (results.length > 0) {
          if (results[0].errorCode) {
            const data = utils.buildResponse(0, null, null, results[0].errorCode, '', []);
            res.status(200).json(data);
          } else {
            let dataFromDB = JSON.parse(results[0]["notifications"]);
            const data = utils.buildResponse(results.length, null, null, '', '', dataFromDB);
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

  // post business visit
  router.post('/', function (req, res, next) {

    // console.log('req', req.body);
    if (!utils.validateParam({ 'name': 'wholesalerId', 'value': req.body.wholesalerId }, res)) return;

    var query = {
      sql: 'CreateBusinessVisit @wholesalerId, @zipcode, @typeOfBusinessId, @comments, @createdOn, @borrado, @images, @video',
      parameters: [
        { name: 'wholesalerId', value: req.body.wholesalerId },
        { name: 'zipcode', value: req.body.zipcode },
        { name: 'typeOfBusinessId', value: req.body.typeOfBusinessId },
        { name: 'comments', value: req.body.comments },
        { name: 'createdOn', value: new Date() },
        { name: 'borrado', value: false }
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
            data = utils.buildResponse(results.length, null, null, '', '', results);
            res.status(200).json(data);
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

  // Accept business visit
  router.get('/accept/:id', function (req, res, next) {

    var query = {
      sql: 'AcceptBusinessVisit @id',
      parameters: [
        { name: 'id', value: req.params.id }
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
            var businessVisit = results[0][0];
            var wholesaler = results[1][0];
            var customer = results[2][0];

            var fromName = constants.emailName;
            var fromEmail = constants.emailFrom;

            var toEmail = wholesaler.email;
            var toName = wholesaler.name;

            var subject = "Visita comercial confirmada";
            var body = `<p>Hola,</p> 
                        <p>El establecimiento ${customer.name} con código postal ${customer.zipCode} en calle ${customer.address} ha aceptado tu propuesta de visita.</p> 
                        <p>Entra en la aplicación en la zona de “visitas comerciales” y selecciona el dia y hora que mejor te vengan entre las propuestas por el restaurador.</p> 
                        <p>Muchas gracias. El Equipo de Horecafy.</p>`;

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
          const data = utils.buildResponse(0, null, null, constants.messages.DATA_NOT_FOUND, 'Data not found', []);
          res.status(200).json(data);
        }
      })
      .catch(function (err) {
        console.log(err);
        data = utils.buildResponse(0, null, null, constants.messages.ERROR, err, []);
        res.status(200).json(data);
      });

  });

  // Reject business visit
  router.get('/reject/:id', function (req, res, next) {

    var query = {
      sql: 'RejectBusinessVisit @id',
      parameters: [
        { name: 'id', value: req.params.id }
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
            data = utils.buildResponse(results.length, null, null, '', '', results[0]);
            res.status(200).json(data);
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

  // put business visit
  router.put('/:id', function (req, res, next) {

    //console.log('req', req.body);
    if (!utils.validateParam({ 'name': 'visitDate', 'value': req.body.visitDate }, res)) return;
    if (!utils.validateParam({ 'name': 'timeslot', 'value': req.body.timeslot }, res)) return;

    var query = {
      sql: 'UpdateBusinessVisit @id, @visitDate, @timeslot',
      parameters: [
        { name: 'id', value: req.params.id },
        { name: 'visitDate', value: new Date(req.body.visitDate) },
        { name: 'timeslot', value: req.body.timeslot }
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

            var businessVisit = results[0][0];
            var wholesaler = results[1][0];
            var customer = results[2][0];

            var fromName = constants.emailName;
            var fromEmail = constants.emailFrom;

            var toEmail = customer.email;
            var toName = customer.name;

            var ccEmail = wholesaler.email;
            var ccName = wholesaler.name;

            var subject = "Visita comercial confirmada";
            var body = `<p>Hola,</p> 
                        <p>El distribuidor ${wholesaler.name} ha confirmado la reunión para el día ${businessVisit.timeslot}  sobre: "${businessVisit.comments}".</p>
                        <p>Sus datos de contacto son: contacto: ${wholesaler.contactName}, Teléfono:${wholesaler.contactMobile}.</p>`;

            var attachment = [];

            var emailTo = JSON.parse('{"' + toEmail + '":"' + toName + '"}');
            var emailCC = JSON.parse('{"' + ccEmail + '":"' + ccName + '"}');
            var emailFrom = [fromEmail, fromName];

            utils.sendCCEmail(emailFrom, emailTo, emailCC, subject, body, attachment, function (emailReponse) {
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
          const data = utils.buildResponse(0, null, null, constants.messages.DATA_NOT_FOUND, 'Data not found', []);
          res.status(200).json(data);
        }
      })
      .catch(function (err) {
        const data = utils.buildResponse(0, null, null, constants.messages.ERROR, err, []);
        res.status(200).json(data);
      });
  });

  // delete business visit
  router.delete('/:id', function (req, res, next) {

    var query = {
      sql: 'DeleteBusinessVisit @id',
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

  // post offer images
  router.put('/:wholesalerId/:id', function (req, res, next) {

    var storage = multer.diskStorage({
      destination: function (req, file, cb) {
        cb(null, 'api/public/uploads/')
      },
      filename: function (req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + "-" + file.originalname)
      }
    });

    var upload = multer({ storage: storage })
    var cpUpload = upload.fields([{ name: 'images', maxCount: 3 }, { name: 'video', maxCount: 1 }]);

    cpUpload(req, res, function (err) {

      if (err) {
        console.log(err);
      }

      var arrImages = Array();
      if (req.files['images'] !== undefined) {
        req.files['images'].forEach(file => {
          arrImages.push(file.filename);
        });
      }

      var arrVideos = Array();
      if (req.files['video'] !== undefined) {
        req.files['video'].forEach(file => {
          arrVideos.push(file.filename);
        });
      }

      var images = arrImages.join(",");
      var video = arrVideos.join(",");

      var query = {
        sql: 'UpdateBusinessVisitAssets @id, @images, @video',
        parameters: [
          { name: 'id', value: req.params.id },
          { name: 'images', value: images },
          { name: 'video', value: video }
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
              data = utils.buildResponse(results[0].length, null, null, '', '', results[0]);
              res.status(200).json(data);
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
  });

  return router;
}