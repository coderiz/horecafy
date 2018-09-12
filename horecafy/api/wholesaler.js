var express = require('express');
var utils = require('./utils');
var constants = require('./constants');

module.exports = function () {

  var router = express.Router();

  // Get all customers
  router.get('/', function (req, res, next) {

    var page = req.query.page || null;
    var rows = req.query.rows || null;
    var visible = req.query.visible || null;
    var borrado = req.query.borrado || null;

    var query = {
      sql: 'GetWholeSalers @page, @rows, @visible, @borrado',
      parameters: [
        { name: 'page', value: page },
        { name: 'rows', value: rows },
        { name: 'visible', value: visible },
        { name: 'borrado', value: borrado }
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
            const data = utils.buildResponse(results[1].length, page, rows, '', '', results[1]);
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

  // Get wholesaler by Id
  router.get('/:id', function (req, res, next) {

    var visible = req.query.visible || null;
    var borrado = req.query.borrado || null;

    var query = {
      sql: 'GetWholeSalerById @id, @visible, @borrado',
      parameters: [
        { name: 'id', value: req.params.id },
        { name: 'visible', value: visible },
        { name: 'borrado', value: borrado }
      ]
    };
    req.azureMobile.data.execute(query)
      .then(function (results) {
        if (results.length > 0) {
          if (results[0].errorCode) {
            const data = utils.buildResponse(0, null, null, results[0].errorCode, '', []);
            res.status(200).json(data);
          } else {
            const data = utils.buildResponse(results.length, null, null, '', '', results[0]);
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

  // Get lists from wholesaler by id
  router.get('/:id/lists', function (req, res, next) {

    var categoryId = req.query.categoryId || null;
    var borrado = req.query.borrado || null;

    var query = {
      sql: 'GetWholesalerListsByWholesalerId @wholesalerId, @categoryId, @borrado',
      parameters: [
        { name: 'wholesalerId', value: req.params.id },
        { name: 'categoryId', value: categoryId },
        { name: 'borrado', value: borrado }
      ]
    };

    req.azureMobile.data.execute(query)
      .then(function (results) {
        if (results.length > 0) {
          if (results[0].errorCode) {
            const data = utils.buildResponse(0, null, null, results[0].errorCode, '', []);
            res.status(200).json(data);
          } else {
            // console.log('JSON output -> ', JSON.parse(results[0]["Demands"]));
            let dataFromDB = JSON.parse(results[0]["WholesalerLists"]);
            if (dataFromDB === null) {
              const data = utils.buildResponse(0, null, null, constants.messages.DATA_NOT_FOUND, 'Data not found', []);
              res.status(200).json(data);
            }
            else {
              const data = utils.buildResponse(dataFromDB.length, null, null, '', '', dataFromDB);
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

  // Get demands from wholesaler by id
  router.get('/:id/demands', function (req, res, next) {

    var categoryId = req.query.categoryId || null;
    var page = req.query.page || null;
    var rows = req.query.rows || null;

    var query = {
      sql: 'GetDemandsByWholesalerId @wholesalerId, @categoryId',
      parameters: [
        { name: 'wholesalerId', value: req.params.id },
        { name: 'categoryId', value: categoryId },
        { name: 'page', value: page },
        { name: 'rows', value: rows }
      ]
    };

    req.azureMobile.data.execute(query)
      .then(function (results) {
        if (results.length > 0) {
          if (results[0].errorCode) {
            const data = utils.buildResponse(0, null, null, results[0].errorCode, '', []);
            res.status(200).json(data);
          } else {
            const data = utils.buildResponse(results.length, page, rows, '', '', results);
            res.status(200).json(data);
          }
        } else {
          // can be empty
          const data = utils.buildResponse(0, null, null, '', '', []);
          res.status(200).json(data);
        }
      })
      .catch(function (err) {
        const data = utils.buildResponse(0, null, null, constants.messages.ERROR, err, []);
        res.status(200).json(data);
      });
  });

  // Get families from wholesaler by id
  router.get('/:id/families', function (req, res, next) {

    var categoryId = req.query.categoryId || null;

    var query = {
      sql: 'GetFamiliesByWholesalerId @wholeSalerId, @categoryId',
      parameters: [
        { name: 'wholeSalerId', value: req.params.id },
        { name: 'categoryId', value: categoryId }
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
          const data = utils.buildResponse(0, null, null, '', '', []);
          res.status(200).json(data);
        }
      })
      .catch(function (err) {
        const data = utils.buildResponse(0, null, null, constants.messages.ERROR, err, []);
        res.status(200).json(data);
      });
  });

  // post wholesaler
  router.post('/', function (req, res, next) {

    console.log('req', req.body);
    if (!utils.validateParam({ 'name': 'VAT', 'value': req.body.VAT }, res)) return;
    if (!utils.validateParam({ 'name': 'email', 'value': req.body.email }, res)) return;
    if (!utils.validateParam({ 'name': 'password', 'value': req.body.password }, res)) return;
    if (!utils.validateParam({ 'name': 'name', 'value': req.body.name }, res)) return;
    if (!utils.validateParam({ 'name': 'typeOfBusinessId', 'value': req.body.typeOfBusinessId }, res)) return;
    if (!utils.validateParam({ 'name': 'contactName', 'value': req.body.contactName }, res)) return;
    if (!utils.validateParam({ 'name': 'contactEmail', 'value': req.body.contactEmail }, res)) return;
    if (!utils.validateParam({ 'name': 'contactMobile', 'value': req.body.contactMobile }, res)) return;
    if (!utils.validateParam({ 'name': 'address', 'value': req.body.address }, res)) return;
    if (!utils.validateParam({ 'name': 'city', 'value': req.body.city }, res)) return;
    if (!utils.validateParam({ 'name': 'zipCode', 'value': req.body.zipCode }, res)) return;
    if (!utils.validateParam({ 'name': 'province', 'value': req.body.province }, res)) return;
    // if (!utils.validateParam({ 'name': 'country', 'value': req.body.country }, res)) return;

    var query = {
      sql: 'CreateWholeSaler @VAT, @email, @password, @name, @typeOfBusinessId, @contactName, @contactEmail, @contactMobile, @address, @city, @zipCode, @province, @country, @createdOn, @visible',
      parameters: [
        { name: 'VAT', value: req.body.VAT },
        { name: 'email', value: req.body.email },
        { name: 'password', value: utils.md5(req.body.password) },
        { name: 'name', value: req.body.name },
        { name: 'typeOfBusinessId', value: req.body.typeOfBusinessId },
        { name: 'contactName', value: req.body.contactName },
        { name: 'contactEmail', value: req.body.contactEmail },
        { name: 'contactMobile', value: req.body.contactMobile },
        { name: 'address', value: req.body.address },
        { name: 'city', value: req.body.city },
        { name: 'zipCode', value: req.body.zipCode },
        { name: 'province', value: req.body.province },
        { name: 'country', value: req.body.country || '' },
        { name: 'createdOn', value: new Date() },
        { name: 'visible', value: true }
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
            var toEmail = req.body.email;
            var toName = req.body.name;
            var subject = 'Bienvenido a Horecafy';
            var body = `<p>¡Enhorabuena!</p>
                      <p>Ahora formas parte de la familia Horecafy. Gracias por confiar en nosotros.</p>
                      <p>Un saludo, equipo Horecafy.</p>`;
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

              // create another email 
              subject = 'Horecafy - Registro de distribuidor';
              body = `<p>Hola, gracias por registrarte.</p> 
                      <p>Ahora crea tu catálogo con las familias de productos que comercializas para que podamos hacerte llegar las necesidades de los restauradores registrados.</p> 
                      <p>Si tienes alguna duda al crear tu catálogo ponte en contacto con nosotros en distribuidores@horecafy.com</p>
                      <p>Gracias por usar Horecafy</p>`;

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

  // put wholesaler
  router.put('/', function (req, res, next) {

    //console.log('req', req.body);
    if (!utils.validateParam({ 'name': 'hiddenId', 'value': req.body.hiddenId }, res)) return;
    if (!utils.validateParam({ 'name': 'id', 'value': req.body.id }, res)) return;
    if (!utils.validateParam({ 'name': 'VAT', 'value': req.body.VAT }, res)) return;
    if (!utils.validateParam({ 'name': 'email', 'value': req.body.email }, res)) return;
    if (!utils.validateParam({ 'name': 'name', 'value': req.body.name }, res)) return;
    if (!utils.validateParam({ 'name': 'typeOfBusinessId', 'value': req.body.typeOfBusinessId }, res)) return;
    if (!utils.validateParam({ 'name': 'contactName', 'value': req.body.contactName }, res)) return;
    if (!utils.validateParam({ 'name': 'contactEmail', 'value': req.body.contactEmail }, res)) return;
    if (!utils.validateParam({ 'name': 'contactMobile', 'value': req.body.contactMobile }, res)) return;
    if (!utils.validateParam({ 'name': 'address', 'value': req.body.address }, res)) return;
    if (!utils.validateParam({ 'name': 'city', 'value': req.body.city }, res)) return;
    if (!utils.validateParam({ 'name': 'zipCode', 'value': req.body.zipCode }, res)) return;
    if (!utils.validateParam({ 'name': 'province', 'value': req.body.province }, res)) return;
    // if (!utils.validateParam({ 'name': 'country', 'value': req.body.country }, res)) return;


    var query = {
      sql: 'UpdateWholesaler @hiddenId, @id, @VAT, @email, @name, @typeOfBusinessId, @contactName, @contactEmail, @contactMobile, @address, @city, @zipCode, @province, @country, @visible',
      parameters: [
        { name: 'hiddenId', value: req.body.hiddenId },
        { name: 'id', value: req.body.id },
        { name: 'VAT', value: req.body.VAT },
        { name: 'email', value: req.body.email },
        { name: 'name', value: req.body.name },
        { name: 'typeOfBusinessId', value: req.body.typeOfBusinessId },
        { name: 'contactName', value: req.body.contactName },
        { name: 'contactEmail', value: req.body.contactEmail },
        { name: 'contactMobile', value: req.body.contactMobile },
        { name: 'address', value: req.body.address },
        { name: 'city', value: req.body.city },
        { name: 'zipCode', value: req.body.zipCode },
        { name: 'province', value: req.body.province },
        { name: 'country', value: req.body.country || '' },
        { name: 'visible', value: req.body.visible == 1 ? true : false }
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

  // get wholesaler statitstics
  router.get('/stats/:id', function (req, res, next) {

    var query = {
      sql: 'GetWholesalerStats @wholesalerId',
      parameters: [
        { name: 'wholesalerId', value: req.params.id }
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

            var response = {};
            results[0].forEach(result => {
              response[result.type] = result.totalCount;
            });

            const data = utils.buildResponse(response.length, null, null, '', '', response);
            res.status(200).json(data);
          }
        } else {
          const data = utils.buildResponse(0, null, null, constants.errors.DATA_NOT_FOUND, 'Data not found', []);
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