var express = require('express');
var utils = require('./utils');
var constants = require('./constants');

module.exports = function () {

  var router = express.Router();

  // Get offer by Id
  router.get('/:id', function(req, res, next) {
         
    var query = {
        sql: 'GetOffer @id',
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
          let dataFromDB = JSON.parse(results[0]["Offer"]);
          const data = utils.buildResponse(dataFromDB.length, null, null, '', '', dataFromDB);
          res.status(200).json(data);
        }        
      } else {
        const data = utils.buildResponse(0, null, null, constants.errors.DATA_NOT_FOUND, 'Data not found', []);
        res.status(200).json(data);
      }
    })
    .catch(function (err) {
      const data = utils.buildResponse(0, null, null, constants.errors.ERROR, err, []);
      res.status(200).json(data);
    });            
  });

  // Get offers
  router.get('/', function(req, res, next) {

    var query = {
        sql: 'GetOffers',
        parameters: []
    };
    req.azureMobile.data.execute(query)
    .then(function (results) {
      console.log(results);
      if (results.length > 0) {
        if (results[0].errorCode) {
          const data = utils.buildResponse(0, null, null, results[0].errorCode, '', []);            
          res.status(200).json(data);
        } else {
          // console.log('JSON output -> ', JSON.parse(results[0]["Demands"]));
          let dataFromDB = JSON.parse(results[0]["Offers"]);
          if (dataFromDB !== null && dataFromDB.length > 0) {
            const data = utils.buildResponse(dataFromDB.length, null, null, '', '', dataFromDB);
            res.status(200).json(data);
          } else {
            const data = utils.buildResponse(0, null, null, constants.messages.DATA_NOT_FOUND, 'Data not found', []);
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

  // Accept offer
  router.post('/contact', function (req, res, next) {
    
    var query = {
      sql: 'ContactOffer @customerId, @wholeSalerId',
      parameters: [
        { name: 'customerId', value: req.body.customerId }, 
        { name: 'wholeSalerId', value: req.body.wholeSalerId }
      ],
      multiple: true
    };

    var data = [];
    req.azureMobile.data.execute(query)
      .then(function (results) {
        console.log(results);
        if (results.length > 0) {
          if (results[0].errorCode) {
            data = utils.buildResponse(0, null, null, results[0].errorCode, '', []);
            res.status(200).json(data);
          } else {
            // console.log(results[1][0]);
            let wholeSaler = results[0][0];
            let customer = results[1][0];
            let fromName = constants.emailName;
            let fromEmail = constants.emailFrom;
            let toEmail = wholeSaler.email;
            let toName = wholeSaler.name;
            let subject = 'Horecafy - Nueva oferta aceptada';
            let body = `<p>Hola, el restaurador ${customer.name} ubicado en ${customer.address} ${customer.zipCode} ${customer.city} (${customer.province}) ha aceptado tu propuesta. Ponte en contacto con ${customer.contactName} en el teléfono ${customer.contactMobile} e intenta cerrar el acuerdo fuera de Horecafy; no cobramos nada por los acuerdos a los que lleguéis.</p><p>Gracias por usar Horecafy</p>`;
            let attachment = [];

            let emailTo = JSON.parse('{"' + toEmail + '":"' + toName + '"}');
            let emailFrom = [fromEmail, fromName];

            utils.sendEmail(emailFrom, emailTo, subject, body, attachment, function (emailReponse) {
              var jsonEmailResponse = JSON.parse(emailReponse);
              // console.log('emailReponse.code -> ', jsonEmailResponse.code);
              if (jsonEmailResponse.code !== 'success') {
                console.log(`Error during email sending -> ${emailReponse}`);
                data = utils.buildResponse(0, null, null, constants.messages.SENDING_EMAIL_ERROR, jsonEmailResponse.message, []);
                res.status(200).json(data);
                return;
              }

              // After sending the notification to customer, it's time to do the same with wholesaler
              let fromName = constants.emailName;
              let fromEmail = constants.emailFrom;
              let toEmail = customer.email;
              let toName = customer.name;
              let subject = 'Horecafy - Oferta aceptada por restaurador';
              let body = `<p>Hola, has aceptado una oferta del distribuidor realizada por ${wholeSaler.name}. Ponte en contacto con ${wholeSaler.contactName} en el teléfono ${wholeSaler.contactMobile} e intentar llegar a un acuerdo fuera de horecafy; no cobramos nada por los acuerdos a los que lleguéis.</p><p>Gracias por usar Horecafy</p>`;
              let attachment = [];

              let emailTo = JSON.parse('{"' + toEmail + '":"' + toName + '"}');
              let emailFrom = [fromEmail, fromName];

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

  // Accept offer
  router.get('/accept/:id', function(req, res, next) {

    var query = {
      sql: 'AcceptOffer @id',
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
          // console.log(results[1][0]);
          let wholeSaler = results[1][0];
          let customer = results[2][0];
          let fromName = constants.emailName;
          let fromEmail = constants.emailFrom;
          let toEmail = wholeSaler.email;
          let toName = wholeSaler.name;
          let subject = 'Horecafy - Nueva oferta aceptada';
          let body = `<p>Hola, el restaurador ${customer.name} ubicado en ${customer.address} ${customer.zipCode} ${customer.city} (${customer.province}) ha aceptado tu propuesta. Ponte en contacto con ${customer.contactName} en el teléfono ${customer.contactMobile} e intenta cerrar el acuerdo fuera de Horecafy; no cobramos nada por los acuerdos a los que lleguéis.</p><p>Gracias por usar Horecafy</p>`;
          let attachment = [];
  
          let emailTo = JSON.parse('{"' + toEmail + '":"' + toName + '"}');
          let emailFrom = [fromEmail, fromName];  
          
          utils.sendEmail(emailFrom, emailTo, subject, body, attachment, function(emailReponse) {
              var jsonEmailResponse = JSON.parse(emailReponse);
              // console.log('emailReponse.code -> ', jsonEmailResponse.code);
              if (jsonEmailResponse.code !== 'success') {
                console.log(`Error during email sending -> ${emailReponse}`);
                data = utils.buildResponse(0, null, null, constants.messages.SENDING_EMAIL_ERROR , jsonEmailResponse.message , []);
                res.status(200).json(data);
                return;
              }

              // After sending the notification to customer, it's time to do the same with wholesaler
              let fromName = constants.emailName;
              let fromEmail = constants.emailFrom;
              let toEmail = customer.email;
              let toName = customer.name;
              let subject = 'Horecafy - Oferta aceptada por restaurador';
              let body = `<p>Hola, has aceptado una oferta del distribuidor realizada por ${wholeSaler.name}. Ponte en contacto con ${wholeSaler.contactName} en el teléfono ${wholeSaler.contactMobile} e intentar llegar a un acuerdo fuera de horecafy; no cobramos nada por los acuerdos a los que lleguéis.</p><p>Gracias por usar Horecafy</p>`;    
              let attachment = [];
      
              let emailTo = JSON.parse('{"' + toEmail + '":"' + toName + '"}');
              let emailFrom = [fromEmail, fromName];  
              
              utils.sendEmail(emailFrom, emailTo, subject, body, attachment, function(emailReponse) {
                  var jsonEmailResponse = JSON.parse(emailReponse);
                  // console.log('emailReponse.code -> ', jsonEmailResponse.code);
                  if (jsonEmailResponse.code !== 'success') {
                    console.log(`Error during email sending -> ${emailReponse}`);
                    data = utils.buildResponse(0, null, null, constants.messages.SENDING_EMAIL_ERROR , jsonEmailResponse.message , []);
                    res.status(200).json(data);
                    return;
                  }
                  data = utils.buildResponse(results[0].length, null, null, '', '', results[0]);
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

  });

  // post offer
  router.post('/', function(req, res, next) {

    //console.log('req', req.body);
    if (!utils.validateParam({ 'name': 'customerId', 'value': req.body.customerId }, res)) return;
    if (!utils.validateParam({ 'name': 'demandId', 'value': req.body.demandId }, res)) return;
    if (!utils.validateParam({ 'name': 'wholesalerId', 'value': req.body.wholesalerId }, res)) return;
    if (!utils.validateParam({ 'name': 'quantyPerMonth', 'value': req.body.quantyPerMonth }, res)) return;
    if (!utils.validateParam({ 'name': 'typeOfFormatId', 'value': req.body.typeOfFormatId }, res)) return;
    if (!utils.validateParam({ 'name': 'offerPrice', 'value': req.body.offerPrice }, res)) return;
    if (!utils.validateParam({ 'name': 'brand', 'value': req.body.brand }, res)) return;
    // if (!utils.validateParam({ 'name': 'fomat', 'value': req.body.fomat }, res)) return;

    var query = {
      sql: 'CreateOffer @customerId, @demandId, @wholesalerId, @quantyPerMonth, @typeOfFormatId, @offerPrice, @brand, @fomat, @comments, @createdOn, @borrado, @approvedByCustomer, @sentToCustomer, @rejected',
      parameters: [
        { name: 'customerId', value: req.body.customerId },
        { name: 'demandId', value: req.body.demandId },
        { name: 'wholesalerId', value: req.body.wholesalerId },
        { name: 'quantyPerMonth', value: req.body.quantyPerMonth },
        { name: 'typeOfFormatId', value: req.body.typeOfFormatId },
        { name: 'offerPrice', value: req.body.offerPrice },
        { name: 'brand', value: req.body.brand },
        { name: 'fomat', value: req.body.fomat },
        { name: 'comments', value: req.body.comments },
        { name: 'createdOn', value: new Date() },
        { name: 'borrado', value: false },
        { name: 'approvedByCustomer', value: null },
        { name: 'sentToCustomer', value: new Date() },
        { name: 'rejected', value: false }
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
          let wholeSaler = results[1][0];
          let customer = results[2][0];
          let fromName = constants.emailName;
          let fromEmail = constants.emailFrom;
          let toEmail = wholeSaler.email;
          let toName = wholeSaler.name;
          let subject = 'Horecafy - Oferta creada por distribuidor';
          let body = `<p>Hola, hemos enviado tu oferta al restaurador. Esperamos que pronto recibas una aceptación y alcancéis un acuerdo fuera de Horecafy; no cobramos nada por los acuerdos a los que lleguéis.</p><p>Gracias por usar Horecafy</p>`;
          let attachment = [];
  
          let emailTo = JSON.parse('{"' + toEmail + '":"' + toName + '"}');
          let emailFrom = [fromEmail, fromName];  
          
          utils.sendEmail(emailFrom, emailTo, subject, body, attachment, function(emailReponse) {
              var jsonEmailResponse = JSON.parse(emailReponse);
              // console.log('emailReponse.code -> ', jsonEmailResponse.code);
              if (jsonEmailResponse.code !== 'success') {
                console.log(`Error during email sending -> ${emailReponse}`);
                data = utils.buildResponse(0, null, null, constants.messages.SENDING_EMAIL_ERROR , jsonEmailResponse.message , []);
                res.status(200).json(data);
                return;
              }

              // After sending the notification to wholesaler, it's time to do the same with customer
              let fromName = constants.emailName;
              let fromEmail = constants.emailFrom;
              let toEmail = customer.email;
              let toName = customer.name;
              let subject = 'Horecafy - Nueva oferta recibida';
              let body = `<p>Hola, has recibido alguna oferta a las listas compartidas. Echa un vistazo en la app y si te gustan pulsa en contactar con el distribuidor para que podáis alcanzar un acuerdo fuera de horecafy; no cobramos nada por los acuerdos a los que lleguéis.</p><p>Gracias por usar Horecafy</p>`;
              let attachment = [];
      
              let emailTo = JSON.parse('{"' + toEmail + '":"' + toName + '"}');
              let emailFrom = [fromEmail, fromName];  
              
              utils.sendEmail(emailFrom, emailTo, subject, body, attachment, function(emailReponse) {
                  var jsonEmailResponse = JSON.parse(emailReponse);
                  // console.log('emailReponse.code -> ', jsonEmailResponse.code);
                  if (jsonEmailResponse.code !== 'success') {
                    console.log(`Error during email sending -> ${emailReponse}`);
                    data = utils.buildResponse(0, null, null, constants.messages.SENDING_EMAIL_ERROR , jsonEmailResponse.message , []);
                    res.status(200).json(data);
                    return;
                  }
                  data = utils.buildResponse(results[0].length, null, null, '', '', results[0]);
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
  });

  return router;
}