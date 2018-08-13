var express = require('express');
var utils = require('./utils');
var constants = require('./constants');

module.exports = function () {

  var router = express.Router();

  // Get demand by id
  router.get('/:id', function (req, res, next) {
    var query = {
      sql: 'GetWholeSalerListById @id',
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

  // post wholesaler list
  router.post('/', function (req, res, next) {

    if (!utils.validateParam({ 'name': 'wholesalerId', 'value': req.body.wholesalerId }, res)) return;
    if (!utils.validateParam({ 'name': 'familyId', 'value': req.body.familyId }, res)) return;
    if (!utils.validateParam({ 'name': 'brand', 'value': req.body.brand }, res)) return;

    var query = {
      sql: 'CreateWholeSalerList @wholesalerId, @familyId, @brand, @comments, @createdOn, @borrado',
      parameters: [
        { name: 'wholesalerId', value: req.body.wholesalerId },
        { name: 'familyId', value: req.body.familyId },
        { name: 'brand', value: req.body.brand },
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

            data = utils.buildResponse(results[0].length, null, null, '', '', results[0]);
            res.status(200).json(data);

            // console.log(results[1][0]);
            // var fromName = constants.emailName;
            // var fromEmail = constants.emailFrom;
            // var toEmail = results[1][0].email;
            // var toName = results[1][0].name;
            // var subject = 'Horecafy - Lista creada por distribuidor';
            // var body = `<p>Hola, gracias por crear una lista con las familias de productos que comercializas. Esperamos que muy pronto te lleguen solicitudes de oferta por parte de los restauradores.</p>
            //             <p>Gracias por usar Horecafy</p>`;
            // var attachment = [];

            // var emailTo = JSON.parse('{"' + toEmail + '":"' + toName + '"}');
            // var emailFrom = [fromEmail, fromName];  

            // utils.sendEmail(emailFrom, emailTo, subject, body, attachment, function(emailReponse) {
            //     var jsonEmailResponse = JSON.parse(emailReponse);
            //     // console.log('emailReponse.code -> ', jsonEmailResponse.code);
            //     if (jsonEmailResponse.code !== 'success') {
            //       console.log(`Error during email sending -> ${emailReponse}`);
            //       data = utils.buildResponse(0, null, null, constants.messages.SENDING_EMAIL_ERROR , jsonEmailResponse.message , []);
            //       res.status(200).json(data);
            //       return;
            //     }
            //     data = utils.buildResponse(results[0].length, null, null, '', '', results[0]);
            //     res.status(200).json(data);
            // });
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
    //   console.log('ERROR', err)
    //   const data = utils.buildResponse(0, null, null, constants.messages.ERROR, err, []);
    //   res.status(200).json(data);
    // });    

  });

  // post wholesaler list by category
  router.post('/category', function (req, res, next) {

    if (!utils.validateParam({ 'name': 'wholesalerId', 'value': req.body.wholesalerId }, res)) return;
    if (!utils.validateParam({ 'name': 'categoryId', 'value': req.body.categoryIds }, res)) return;
    // if (!utils.validateParam({ 'name': 'brand', 'value': req.body.brand }, res)) return;

    var query = {
      sql: 'CreateWholeSalerListByCategory @wholesalerId, @categoryIds, @brand, @comments, @createdOn, @borrado',
      parameters: [
        { name: 'wholesalerId', value: req.body.wholesalerId },
        { name: 'categoryIds', value: req.body.categoryIds },
        { name: 'brand', value: req.body.brand || "" },
        { name: 'comments', value: req.body.comments || "" },
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

  // put wholesaler list
  router.put('/', function (req, res, next) {

    //console.log('req', req.body);
    if (!utils.validateParam({ 'name': 'wholesalerId', 'value': req.body.wholesalerId }, res)) return;
    if (!utils.validateParam({ 'name': 'familyId', 'value': req.body.familyId }, res)) return;
    if (!utils.validateParam({ 'name': 'brand', 'value': req.body.brand }, res)) return;

    var query = {
      sql: 'UpdateWholeSalerList @id, @wholesalerId, @familyId, @brand, @comments',
      parameters: [
        { name: 'id', value: req.body.id },
        { name: 'wholesalerId', value: req.body.wholesalerId },
        { name: 'familyId', value: req.body.familyId },
        { name: 'brand', value: req.body.brand },
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
      sql: 'DeleteWholeSalerList @id',
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