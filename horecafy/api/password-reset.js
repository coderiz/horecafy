var express = require('express');
var utils = require('./utils');
var constants = require('./constants');
require('../mailin.js');

module.exports = function () {

    var router = express.Router();

    router.post('/', function (req, res, next) {

        if (!utils.validateParam({ 'name': 'email', 'value': req.body.email }, res)) return;
        if (!utils.validateParam({ 'name': 'typeUser', 'value': req.body.typeUser }, res)) return;

        var query = {
            sql: 'GetCustomerByEmail @email, @typeUser',
            parameters: [
                { name: 'email', value: req.body.email },
                { name: 'typeUser', value: req.body.typeUser }
            ]
        };

        req.azureMobile.data.execute(query)
            .then(function (results) {

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