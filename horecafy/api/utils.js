var crypto = require('crypto');
var multer = require('multer');
// var fs = require('fs');
// var path = require('path');
var constants = require('./constants');

//var uploadBasePath = path.join(__dirname, '/public');

module.exports = {
	md5: function(string) {
        return crypto.createHash('md5').update(string).digest('hex');
    },
	validateParam: function(param, res) {
        if (param.value === null || (param.value === undefined)) {
            const data = this.buildResponse(0, null, null, constants.messages.MISSING_PARAM, param.name + ' param is missing', []);
            res.status(200).json(data);
            // res.status(400).json({
            //         totalRows: 0,
            //         error: param.name + " param is missing",
            //         data: []
            //     });
           return false;
        }
		return true;
	},
	GetUserByEmail: function GetUserByEmail(db, email, callback) {
        var query = {
            sql: 'GetUserByEmail @email',
            parameters: [
                { name: 'email', value: email }
            ]
        };
        db.execute(query)
        .then(function (results) {
            callback(results, null);
        })
        .catch(function(err) {
            callback(null, err);
        });
    },
	GetUserByEmailAndPassword: function GetUserByEmail(db, email, password, callback) {
        var query = {
            sql: 'GetUserByEmailAndPassword @email, @password',
            parameters: [
                { name: 'email', value: email },
				{ name: 'password', value: password }
            ]
        };
        db.execute(query)
        .then(function (results) {
            callback(results, null);
        })
        .catch(function(err) {
            callback(null, err);
        });
    },
	sendEmail: function (emailFrom, emailTo, subject, body, attachment, callback) {

        var client = new Mailin("https://api.sendinblue.com/v2.0","5cVYhrRL2vUJtQbS");
        data = { 
            to : emailTo,
            from : emailFrom,
            subject : subject,
            html : body,
            attachment : attachment
        }
        // console.log('data -> ', data);

        client.send_email(data).on('complete', function(response) {
            // console.log(response);
            callback(response);
        });        
    },    
    buildResponse: function(totalRows, page, rows, error, message, data) {
        return {
            totalRows,
            page,
            rows,
            error,
            message,
            data
        };
    }
};