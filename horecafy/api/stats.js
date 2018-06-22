var express = require('express');
var utils = require('./utils');
var constants = require('./constants');

module.exports = function () {

    var router = express.Router();

    // Get all stats
    router.get('/', function(req, res, next) {

      var query = {
          sql: 'GetStats',
          parameters: [],
          multiple: true
      };

      req.azureMobile.data.execute(query)
      .then(function (results) {
        //   console.log('results', results);
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

    // Get stats for customers
    router.get('/customer', function(req, res, next) {

      var from = req.query.from || null;
      var to = req.query.to || null;

      var query = {
          sql: 'GetStatsCustomer @from, @to',
          parameters: [
            { name: 'from', value: from },
            { name: 'to', value: to }
          ]
      };

      req.azureMobile.data.execute(query)
      .then(function (results) {
        //   console.log('results', results);
          if (results.length > 0) {
            if (results[0].errorCode) {
              const data = utils.buildResponse(0, null, null, results.errorCode, '', []);
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

    // Get stats for wholesalers
    router.get('/wholesaler', function(req, res, next) {
        
      var from = req.query.from || null;
      var to = req.query.to || null;

      var query = {
          sql: 'GetStatsWholeSaler @from, @to',
          parameters: [
            { name: 'from', value: from },
            { name: 'to', value: to }
          ]
      };

      req.azureMobile.data.execute(query)
      .then(function (results) {
        //   console.log('results', results);
          if (results.length > 0) {
            if (results[0].errorCode) {
              const data = utils.buildResponse(0, null, null, results.errorCode, '', []);
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

    // Get stats for categories
    router.get('/categories', function(req, res, next) {

      var from = req.query.from || null;
      var to = req.query.to || null;

      var query = {
          sql: 'GetStatsCategories @from, @to',
          parameters: [
            { name: 'from', value: from },
            { name: 'to', value: to }
          ]
      };

      req.azureMobile.data.execute(query)
      .then(function (results) {
        //   console.log('results', results);
          if (results.length > 0) {
            if (results[0].errorCode) {
              const data = utils.buildResponse(0, null, null, results.errorCode, '', []);
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

    return router;
};