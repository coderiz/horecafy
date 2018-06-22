var express = require('express');
var utils = require('./utils');

module.exports = function() {
    var router = express.Router();

    // Get all users
    router.get('/', function(req, res, next) {
        
        var page = req.query.page || null;
        var rows = req.query.rows || null;
        var status = req.query.status || null;
        var deleted = req.query.deleted || null;
        var idRole = req.query.idRole || null;
        
        var query = {
            sql: 'GetUsuarios @status, @page, @rows, @deleted, @idRole',
            parameters: [
                { name: 'status', value: status },
                { name: 'page', value: page },
                { name: 'rows', value: rows },
                { name: 'deleted', value: deleted },
                { name: 'idRole', value: idRole }
            ],
            multiple: true // this allows to receive multiple resultsets
        };

        req.azureMobile.data.execute(query)
         .then(function (results) {
            if (results.length > 0)
               res.json({
                  totalRows: results[0][0].totalRows,
                  page: page,
                  rows: rows,
                  error: '',
                  data: results[1]
               });
            else
               res.json({
                  totalRows: 0,
                  page: 0,
                  rows: 0,
                  error: 'No data found',
                  data: {}
               });
         });
    });

    // Get user by Id
    router.get('/:id', function(req, res, next) {
        
        var status = req.query.status || null;
        var deleted = req.query.deleted || null;
        
        var query = {
            sql: 'GetUserById @id, @status, @deleted',
            parameters: [
                { name: 'id', value: req.params.id },
                { name: 'status', value: status },
                { name: 'deleted', value: deleted }
            ]
        };
        req.azureMobile.data.execute(query)
        .then(function (results) {

            if (results.length > 0)
                res.json({
                    totalRows: results.length,
                    error: '',
                    data: results
                });
            else
                res.json({
                    totalRows: 0,
                    error: 'No data found',
                    data: {}
                });
        });
    });

    // Get inscripciones por usuario
    router.get('/:id/inscripciones', function(req, res, next) {
        
        var status = req.query.status || null;
        var deleted = req.query.deleted || null;
        
        var query = {
            sql: 'GetInscripcionesByUsuario @idUsuario',
            parameters: [
                { name: 'idUsuario', value: req.params.id }
            ]
        };
        req.azureMobile.data.execute(query)
        .then(function (results) {

            if (results.length > 0)
                res.json({
                    totalRows: results.length,
                    error: '',
                    data: results
                });
            else
                res.json({
                    totalRows: 0,
                    error: 'No data found',
                    data: {}
                });
        });
    });    

    // Confirm the email address
    router.get('/confirm/:id', function(req, res, next) {
      var query = {
         sql: 'ConfirmRegistry @id',
         parameters: [
            {name: 'id', value: req.params.id}
         ]
      };
      req.azureMobile.data.execute(query)
            .then(function (results) {
            // console.log('Confirme -> ', results);
           if (results.length > 0) {
               /*res.json({
                  totalRows: 1,
                  page: 1,
                  rows: 1,
                  error: '',
                  data: [
                      {
                          message: 'Your registration was confirmed successfully.'
                      }
                  ]
               });
               */
               res.writeHead(301,
                   {
                       Location: 'http://ualblicexadmin.azurewebsites.net/#/login'
                   });
               res.end();
            }
            else {
                /*
               res.json({
                  totalRows: 0,
                  page: 0,
                  rows: 0,
                  error: 'Error during email confirmation process.',
                  data: {}
               });
               */
               res.writeHead(301,
                   {
                       Location: 'http://ualblicexadmin.azurewebsites.net/#/confirmaton-failed'
                   });
               res.end();
            }
        });        
    });
    
    // Create user
    router.post('/', function(req, res, next) {
        var db = req.azureMobile.data;
        utils.GetUserByEmail(db, req.body.email, function(results, err) {
            if (err) {
                res.json({
                    totalRows: 0,
                    error: err,
                    data: {}
                });
                return;
            }

            if (err || (results && results.length > 0)) {
                res.json({
                    error: 'error',
                    mensaje: results[0].Error
                }); 

                return;
            }

            if (!utils.validateParam({ 'name': 'nif', 'value': req.body.nif }, res)) return;
            if (!utils.validateParam({ 'name': 'email', 'value': req.body.email }, res)) return;
            if (!utils.validateParam({ 'name': 'password', 'value': req.body.password }, res)) return;
            if (!utils.validateParam({ 'name': 'nombre', 'value': req.body.nombre }, res)) return;
            if (!utils.validateParam({ 'name': 'apellidos', 'value': req.body.apellidos }, res)) return;
            if (!utils.validateParam({ 'name': 'idRole', 'value': req.body.idRole }, res)) return;
            // if (!utils.validateParam({ 'name': 'telMovil', 'value': req.body.telMovil }, res)) return;
            // if (!utils.validateParam({ 'name': 'profesion', 'value': req.body.profesion }, res)) return;

            var query = {
                sql: 'CreateUser @nif, @email, @password, @nombre, @apellidos, @photoUrl, @idRole, @telMovil, @profesion',
                parameters: [
                    { name: 'nif', value: req.body.nif },
                    { name: 'email', value: req.body.email },
                    { name: 'password', value: utils.md5(req.body.password) },
                    { name: 'nombre', value: req.body.nombre },
                    { name: 'apellidos', value: req.body.apellidos },
                    { name: 'photoUrl', value: req.body.photoUrl },
                    { name: 'idRole', value: req.body.idRole },
                    { name: 'telMovil', value: req.body.telMovil },
                    { name: 'profesion', value: req.body.profesion }
                ]
            };

            var email = req.body.email;
            var nombre = req.body.nombre;
            // console.log(JSON.stringify('{"' + email + '":"' + nombre + '"}'));
            // console.log(JSON.parse('{"' + email + '":"' + nombre + '"}'));
            db.execute(query)
                .then(function (results) {
                    // console.log('results -> ', results);
                    if (results.length > 0 && results[0].Error) {
                        res.json({
                            error: 'error',
                            mensaje: results[0].Error
                        }); 
                    }
                    else {
                        if (results.length > 0) {
                            // console.log('Results -> ', results[0].id);
                            // envío el email para la confirmación
                            var emailTo = JSON.parse('{"' + email + '":"' + nombre + '"}');
                            var emailFrom = ['comunicacion@ual-sej056.es', 'UAL-SEJ056'];
                            var subject = 'Alta en Alta en UAL-SEJ056';
                            var body = 'Su alta en la plataforma de UAL-SEJ056 se ha realizado con éxito, para asegurarnos de que el correo introducido es el correcto, por favor haga clic en el siguiente enlace ';
                            var enlaceUrlConfirm = 'http://ualblicexapi-dev.azurewebsites.net/api/v1/usuarios/confirm/' + results[0].id;
                            body += '<a href="' + enlaceUrlConfirm + '">' + enlaceUrlConfirm + '</a>';
                            body += ' Si no puede hacer clic, copie la url y péguela en su navegador habitual. Si tiene algún problema y no puede activar su cuenta, por favor contacte al email: comunicacion@ual-sej056.es';
                            // console.log(body);
                            //var attachment = ['http://ualblicexapi-dev.azurewebsites.net/cursos/98CF122E-B945-4B43-8A8E-B826C31344DE/CURSO_IMAGE_98CF122E-B945-4B43-8A8E-B826C31344DE.jpg'];
                            var attachment = [];
                            utils.sendEmail(emailFrom, emailTo, subject, body, attachment, function(emailReponse) {
                                var jsonEmailResponse = JSON.parse(emailReponse);
                                // console.log('emailReponse.code -> ', jsonEmailResponse.code);
                                if (jsonEmailResponse.code !== 'success') {
                                    res.json({
                                        error: jsonEmailResponse.error,
                                        mensaje: "No se puedo enviar el email."
                                    });               
                                }
                                res.json({
                                    error: '',
                                    mensaje: "Gracias por registrarse. Se ha enviado un email para confirmar el registro."
                                }); 
                            });
                        }
                        else {
                            res.json({
                                error: 'error',
                                mensaje: "No se pudo registrar al usuario."
                            }); 
                        }
                    }
                })
                .catch(function (err) {
                    res.json({
                        error: err,
                        mensaje: "No se pudo completar el registro."
                    }); 
                });
            });
    });
    
    // Modify profile user
    router.put('/:id', function(req, res, next) {

        var id = req.params.id;

        if (!utils.validateParam({ 'name': 'nif', 'value': req.body.nif }, res)) return;
        if (!utils.validateParam({ 'name': 'email', 'value': req.body.email }, res)) return;
        if (!utils.validateParam({ 'name': 'nombre', 'value': req.body.nombre }, res)) return;
        if (!utils.validateParam({ 'name': 'apellidos', 'value': req.body.apellidos }, res)) return;
        if (!utils.validateParam({ 'name': 'idRole', 'value': req.body.idRole }, res)) return;
        if (!utils.validateParam({ 'name': 'estado', 'value': req.body.estado }, res)) return;
        if (!utils.validateParam({ 'name': 'borrado', 'value': req.body.borrado }, res)) return;
		
        var db = req.azureMobile.data;
        utils.GetUserByEmail(db, req.body.email, function(results, err) {
            
            if (err) {
                res.json({
                    totalRows: 0,
                    error: err,
                    data: {}
                });
                return;
            }
            
            if (err || (results && results.length == 0)) {
                res.json({
                    totalRows: 0,
                    error: err || 'User not found.',
                    data: {}
                });

                return;
            }

            var query = {
                sql: 'UpdateUsuario @id, @nif, @email, @nombre, @apellidos, @photoUrl, @idRole, @estado, @borrado, @telMovil, @profesion',
                parameters: [
                    { name: 'id', value: id },
                    { name: 'nif', value: req.body.nif },
                    { name: 'email', value: req.body.email },
                    { name: 'nombre', value: req.body.nombre },
                    { name: 'apellidos', value: req.body.apellidos },
                    { name: 'photoUrl', value: req.body.photoUrl },
                    { name: 'idRole', value: req.body.idRole },
                    { name: 'estado', value: req.body.estado },
                    { name: 'borrado', value: req.body.borrado },
                    { name: 'telMovil', value: req.body.telMovil },
                    { name: 'profesion', value: req.body.profesion }
                ]
            };

            db.execute(query)
            .then(function (results) {
                if (results.length > 0) {
                    res.json({
                        totalRows: results.length,
                        error: '',
                        data: results
                    });
                        // After updating the user data in db, we have to send an email to user
                    }
                    else {
                        res.json({
                            totalRows: 0,
                            error: 'No data found',
                            data: {}
                        });
                    }
                })
                .catch(function (err) {
                   //res.json(400, err);
                    res.json({
                        totalRows: 0,
                        error: err,
                        data: {}
                    });
                });
            });
            
    });
    
    // Delete user
    router.delete('/:id', function(req, res, next) {
        var id = req.params.id;
        
        var query = {
            sql: 'DeleteUsuario @id',
            parameters: [
                { name: 'id', value: id }
            ]
        };
    
        var db = req.azureMobile.data;
        db.execute(query)
            .then(function () {
                res.status(200).send({
                    totalRows: 0,
                    error: '',
                    data: {}
                });
            })
            .catch(function (err) {
                res.status(200).send({
                    totalRows: 0,
                    error: 'Error: The item was not deleted.',
                    data: {}
                });
            });
    });   

    return router;
};