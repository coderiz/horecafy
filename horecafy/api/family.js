var express = require('express');
var utils = require('./utils');
var constants = require('./constants');

module.exports = function () {

  var router = express.Router();

  // Get all families
  router.get('/', function (req, res, next) {

    var query = {
      sql: 'GetFamilies @categoryId',
      parameters: [
        { name: 'categoryId', value: req.query.categoryId }
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

  // TO REMOVE: Get all families by customerId and categoryId in a demand
  router.get('/demand', function (req, res, next) {

    if (!utils.validateParam({ 'name': 'customerId', 'value': req.query.customerId }, res)) return;
    if (!utils.validateParam({ 'name': 'categoryId', 'value': req.query.categoryId }, res)) return;

    var query = {
      sql: 'GetFamiliesInDemand @customerId, @categoryId',
      parameters: [
        { name: 'customerId', value: req.query.customerId },
        { name: 'categoryId', value: req.query.categoryId }
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

  // TO REMOVE: Get all families by customerId and categoryId in an offer
  router.get('/offer', function (req, res, next) {

    if (!utils.validateParam({ 'name': 'customerId', 'value': req.query.customerId }, res)) return;
    if (!utils.validateParam({ 'name': 'categoryId', 'value': req.query.categoryId }, res)) return;

    var query = {
      sql: 'GetFamiliesInOffer @customerId, @categoryId',
      parameters: [
        { name: 'customerId', value: req.query.customerId },
        { name: 'categoryId', value: req.query.categoryId }
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

  return router;
};