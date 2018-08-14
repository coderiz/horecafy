var express = require('express');
var utils = require('./utils');
var constants = require('./constants');

module.exports = function () {

    var router = express.Router();

    // Get all provinces
    router.get('/', function (req, res, next) {

        var query = {
            sql: 'GetProvinces'
        };

        req.azureMobile.data.execute(query)
            .then(function (results) {
                
                if (results.length > 0) {
                    if (results.errorCode) {
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
}