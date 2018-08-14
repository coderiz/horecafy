var express = require('express');
var bodyParser = require('body-parser');
var azureMobileApps = require('azure-mobile-apps');
var path = require('path');

// var cors = require('cors');

// database
var databaseConfig = require('./api/database/config');

// api
// var usuariosApi = require('./api/usuarios');
var loginApi = require('./api/login');
var typeOfBusinessApi = require('./api/type-of-business');
var typeOfFormatApi = require('./api/type-of-format');
var customerApi = require('./api/customer');
var wholesalerApi = require('./api/wholesaler');
var categoryApi = require('./api/category');
var familyApi = require('./api/family');
var demandApi = require('./api/demand');
var freedemandApi = require('./api/freedemand');
var offerApi = require('./api/offer');
var wholesalerListApi = require('./api/wholesaler-list');
var statsApi = require('./api/stats');
var orderApi = require('./api/order');
var businessvisitApi = require('./api/businessvisit');
var passwordResetApi = require('./api/password-reset');
var provinceApi = require('./api/province');

var app = express();
var mobile = azureMobileApps({
    // Explicitly enable the Azure Mobile Apps home page
    homePage: true,
    // Explicitly enable the Swagger UI - swagger endpoint is at /swagger
    // and the UI is at /swagger/ui
    swagger: false,
    data: databaseConfig.data
});
app.use(mobile);

// app.use(cors({ origin: 'null', credentials: true }));

// view engine setup
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'api/public')));

app.use(function (req, res, next) {

  // Website you wish to allow to connect
  res.setHeader('Access-Control-Allow-Origin', '*');

  // Request methods you wish to allow
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

  // Request headers you wish to allow
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

  // Set to true if you need the website to include cookies in the requests sent
  // to the API (e.g. in case you use sessions)
  res.setHeader('Access-Control-Allow-Credentials', true);

  // Pass to next layer of middleware
  next();
});

// api
var apiVersion = 'v1';
// app.use(`/api/${apiVersion}/usuarios`, usuariosApi());
app.use(`/api/${apiVersion}/login`, loginApi());
app.use(`/api/${apiVersion}/type-business`, typeOfBusinessApi());
app.use(`/api/${apiVersion}/type-format`, typeOfFormatApi());
app.use(`/api/${apiVersion}/category`, categoryApi());
app.use(`/api/${apiVersion}/customer`, customerApi());
app.use(`/api/${apiVersion}/wholesaler`, wholesalerApi());
app.use(`/api/${apiVersion}/family`, familyApi());
app.use(`/api/${apiVersion}/demand`, demandApi());
app.use(`/api/${apiVersion}/freedemand`, freedemandApi());
app.use(`/api/${apiVersion}/offer`, offerApi());
app.use(`/api/${apiVersion}/wholesaler-list`, wholesalerListApi());
app.use(`/api/${apiVersion}/stats`, statsApi());
app.use(`/api/${apiVersion}/order`, orderApi());
app.use(`/api/${apiVersion}/businessvisit`, businessvisitApi());
app.use(`/api/${apiVersion}/password-reset`, passwordResetApi());
app.use(`/api/${apiVersion}/province`, provinceApi());

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  console.log('PMG -> ', err.status);
  console.log('PMG -> ', err.message);
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});

module.exports = app;
