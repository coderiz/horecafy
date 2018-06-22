var express = require('express');
var utils = require('./utils');
var constants = require('./constants');

module.exports = function () {

  var router = express.Router();

  // Get all categories
  router.get('/', function(req, res, next) {
      
      var query = {
          sql: 'GetCategories',
          parameters: []
      };

      req.azureMobile.data.execute(query)
      .then(function (results) {
          //console.log('results', results);
          if (results.length > 0) {
            if (results[0].errorCode) {
              const data = utils.buildResponse(0, null, null, results.errorCode, '', []);
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

  // Get all categories from a customer in a demand with family count
  router.get('/demand/family', function(req, res, next) {

    if (!utils.validateParam({ 'name': 'customerId', 'value': req.query.customerId }, res)) return;
  
    var query = {
        sql: 'GetDemandCategoriesWithFamilyCount @customerId',
        parameters: [
          { name: 'customerId', value: req.query.customerId },
        ]
    };

    req.azureMobile.data.execute(query)
    .then(function (results) {
        //console.log('results', results);
        if (results.length > 0) {
          if (results[0].errorCode) {
            const data = utils.buildResponse(0, null, null, results.errorCode, '', []);
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

  // Get all categories from a customer in an offer with family count
  router.get('/offer/family', function(req, res, next) {

    if (!utils.validateParam({ 'name': 'customerId', 'value': req.query.customerId }, res)) return;
  
    var query = {
        sql: 'GetOfferCategoriesWithFamilyCount @customerId',
        parameters: [
          { name: 'customerId', value: req.query.customerId },
        ]
    };

    req.azureMobile.data.execute(query)
    .then(function (results) {
        //console.log('results', results);
        if (results.length > 0) {
          if (results[0].errorCode) {
            const data = utils.buildResponse(0, null, null, results.errorCode, '', []);
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

  // Get all categories from a wholesaler in an wholesaler list with family count
  router.get('/wholesaler-list/family', function(req, res, next) {

    if (!utils.validateParam({ 'name': 'wholesalerId', 'value': req.query.wholesalerId }, res)) return;

    var query = {
        sql: 'GetWholesalerListCategoriesWithFamilyCount @wholesalerId',
        parameters: [
          { name: 'wholesalerId', value: req.query.wholesalerId }
        ]
    };

    req.azureMobile.data.execute(query)
    .then(function (results) {
        //console.log('results', results);
      if (results.length > 0) {
        if (results[0].errorCode) {
          const data = utils.buildResponse(0, null, null, results.errorCode, '', []);
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

  return router;
};