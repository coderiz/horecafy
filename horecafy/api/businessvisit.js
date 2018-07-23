var express = require('express');
var utils = require('./utils');
var constants = require('./constants');
var async = require('async');

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
      sql: 'CreateBusinessVisit @wholesalerId, @zipcode, @typeOfBusinessId, @comments, @createdOn, @borrado',
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
    if (!utils.validateParam({ 'name': 'timeslot', 'value': req.body.timeslot }, res)) return;

    var query = {
      sql: 'UpdateBusinessVisit @id, @timeslot',
      parameters: [
        { name: 'id', value: req.params.id },
        { name: 'timeslot', value: req.body.timeslot }
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

  // delete demand
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

  return router;
}