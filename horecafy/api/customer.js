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
      sql: 'GetCustomers @page, @rows, @visible, @borrado',
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

  // Get user by Id
  router.get('/:id', function (req, res, next) {

    var visible = req.query.visible || null;
    var borrado = req.query.borrado || null;

    var query = {
      sql: 'GetCustomerById @id, @visible, @borrado',
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

  // Get demands from user by id
  router.get('/:id/demands', function (req, res, next) {

    var categoryId = req.query.categoryId || null;
    var sentTo = req.query.sentTo || null;
    var borrado = req.query.borrado || null;

    var query = {
      sql: 'GetDemandsByCustomerId @customerId, @categoryId, @sentTo, @borrado',
      parameters: [
        { name: 'customerId', value: req.params.id },
        { name: 'categoryId', value: categoryId },
        { name: 'sentTo', value: sentTo },
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
        // can be empty
        const data = utils.buildResponse(0, null, null, '', '', []);
        res.status(200).json(data);
      });

  });

  // Get demands with offers from user by id
  router.get('/:id/demandsWithOffers', function (req, res, next) {

    var categoryId = req.query.categoryId || null;
    var borrado = req.query.borrado || null;
    var sentTo = req.query.sentTo || null;

    var query = {
      sql: 'GetDemandsWithOffersByCustomerId @customerId, @categoryId, @borrado, @sentTo',
      parameters: [
        { name: 'customerId', value: req.params.id },
        { name: 'categoryId', value: categoryId },
        { name: 'borrado', value: borrado },
        { name: 'sentTo', value: sentTo }
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
            let dataFromDB = JSON.parse(results[0]["Demands"]);
            const data = utils.buildResponse(dataFromDB.length, null, null, '', '', dataFromDB);
            res.status(200).json(data);
          }
        } else {
          // can be empty
          const data = utils.buildResponse(0, null, null, '', '', []);
          res.status(200).json(data);
        }
      })
      .catch(function (err) {
        const data = utils.buildResponse(0, null, null, '', '', []);
        res.status(200).json(data);
      });
  });

  // Get offers from user by id
  router.get('/:id/offers', function (req, res, next) {

    var categoryId = req.query.categoryId || null;
    var demandId = req.query.demandId || null;
    var borrado = req.query.borrado || null;
    var approvedByCustomer = req.query.approvedByCustomer || null;

    var query = {
      sql: 'GetOffersByCustomerId @customerId, @categoryId, @demandId, @borrado, @approvedByCustomer',
      parameters: [
        { name: 'customerId', value: req.params.id },
        { name: 'categoryId', value: categoryId },
        { name: 'demandId', value: demandId },
        { name: 'borrado', value: borrado },
        { name: 'approvedByCustomer', value: approvedByCustomer }
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
            let dataFromDB = JSON.parse(results[0]["Offers"]);
            const data = utils.buildResponse(dataFromDB.length, null, null, '', '', dataFromDB);
            res.status(200).json(data);
          }
        } else {
          const data = utils.buildResponse(0, null, null, constants.errors.DATA_NOT_FOUND, 'Data not found', []);
          res.status(200).json(data);
        }
      })
      .catch(function (err) {
        // can be emtpy
        const data = utils.buildResponse(0, null, null, '', '', []);
        res.status(200).json(data);
      });
  });

  // Get families from user by id
  router.get('/:id/families', function (req, res, next) {

    var categoryId = req.query.categoryId || null;

    var query = {
      sql: 'GetFamiliesByCustomerId @customerId, @categoryId',
      parameters: [
        { name: 'customerId', value: req.params.id },
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

  // post customer
  router.post('/', function (req, res, next) {

    //console.log('req', req.body);
    // if (!utils.validateParam({ 'name': 'VAT', 'value': req.body.VAT }, res)) return;
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
      sql: 'CreateCustomer @VAT, @email, @password, @name, @typeOfBusinessId, @contactName, @contactEmail, @contactMobile, @address, @city, @zipCode, @province, @country, @createdOn, @visible',
      parameters: [
        { name: 'VAT', value: '' },
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
        { name: 'country', value: '' },
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

  // put customer
  router.put('/', function (req, res, next) {

    //console.log('req', req.body);
    if (!utils.validateParam({ 'name': 'hiddenId', 'value': req.body.hiddenId }, res)) return;
    if (!utils.validateParam({ 'name': 'id', 'value': req.body.id }, res)) return;
    // if (!utils.validateParam({ 'name': 'VAT', 'value': req.body.VAT }, res)) return;
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
      sql: 'UpdateCustomer @hiddenId, @id, @VAT, @email, @name, @typeOfBusinessId, @contactName, @contactEmail, @contactMobile, @address, @city, @zipCode, @province, @country, @visible',
      parameters: [
        { name: 'hiddenId', value: req.body.hiddenId },
        { name: 'id', value: req.body.id },
        { name: 'VAT', value: '' },
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
        { name: 'country', value: '' },
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

  // post new product request
  router.post('/requestProduct', function (req, res, next) {

    // console.log('req', req.body);
    if (!utils.validateParam({ 'name': 'customerId', 'value': req.body.customerId }, res)) return;
    if (!utils.validateParam({ 'name': 'productName', 'value': req.body.productName }, res)) return;
    if (!utils.validateParam({ 'name': 'brand', 'value': req.body.brand }, res)) return;
    if (!utils.validateParam({ 'name': 'consumption', 'value': req.body.consumption }, res)) return;
    if (!utils.validateParam({ 'name': 'targetPrice', 'value': req.body.targetPrice }, res)) return;
    if (!utils.validateParam({ 'name': 'allowCall', 'value': req.body.allowCall }, res)) return;

    var query = {
      sql: 'CreateProductRequest @customerId, @productName, @brand, @consumption, @targetPrice, @allowCall, @createdOn',
      parameters: [
        { name: 'customerId', value: req.body.customerId },
        { name: 'productName', value: req.body.productName },
        { name: 'brand', value: req.body.brand },
        { name: 'consumption', value: req.body.consumption },
        { name: 'targetPrice', value: req.body.targetPrice || 0 },
        { name: 'allowCall', value: (req.body.allowCall == "yes") ? true : false },
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

            var product = results[0][0];
            var customer = results[1][0];

            var fromName = constants.emailName;
            var fromEmail = constants.emailFrom;
            var toEmail = "restauradores@horecafy.com";
            var toName = "Horecafy";
            var subject = "Búsqueda producto";
            var body = `<p>Hola! El establecimiento ${customer.name} ${customer.hiddenId} con código postal ${customer.zipCode} en calle ${customer.address} ${customer.city} con email ${customer.email} y teléfono ${customer.contactMobile} necesita: necesita:</p> 
            
            <p>producto: ${product.productName}<br /> 
            marca: ${product.brand}<br />
            consumo aproximado: ${product.consumption}<br />
            precio objetivo: ${product.targetPrice}<br />
            Llamada telefonica: ${(product.allowCall == 1) ? 'si' : 'no'}.
            </p>`;

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

  // Get demands with offers from user by id
  router.get('/:id/availability', function (req, res, next) {

    var query = {
      sql: 'GetAailabilityByCustomerId @customerId',
      parameters: [
        { name: 'customerId', value: req.params.id }
      ]
    };

    req.azureMobile.data.execute(query)
      .then(function (results) {
        if (results.length > 0) {
          const data = utils.buildResponse(results.length, null, null, '', '', results[0]);
          res.status(200).json(data);
        } else {
          const data = utils.buildResponse(0, null, null, '', '', {});
          res.status(200).json(data);
        }
      })
      .catch(function (err) {
        const data = utils.buildResponse(0, null, null, '', '', {});
        res.status(200).json(data);
      });
  });

  // put customer
  router.put('/:id/availability', function (req, res, next) {

    //console.log('req', req.body);
    if (!utils.validateParam({ 'name': 'availability', 'value': req.body.availability }, res)) return;

    var query = {
      sql: 'UpdateCustomerAvailability @customerId, @availability, @createdOn',
      parameters: [
        { name: 'customerId', value: req.params.id },
        { name: 'availability', value: req.body.availability },
        { name: 'createdOn', value: new Date() }
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

  // get customer statitstics
  router.get('/stats/:id', function (req, res, next) {

    var query = {
      sql: 'GetCustomerStats @customerId',
      parameters: [
        { name: 'customerId', value: req.params.id }
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
        // can be emtpy
        const data = utils.buildResponse(0, null, null, '', '', []);
        res.status(200).json(data);
      });

  });

  return router;
}