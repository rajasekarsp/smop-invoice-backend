var express = require("express");
var bodyParser = require("body-parser");
var mysql = require("mysql");
var app = express();

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

//routes(app);

var server = app.listen(3000, function () {
    console.log("app running on port.", server.address().port);
});


//Database connection
app.use(function(req, res, next){
  global.connection = mysql.createConnection({
		host     : 'localhost',
		user     : 'root',
		password : '',
		database : 'smopinvoicedb'
	});
	connection.connect();
	next();
});

app.use('/', indexRouter);
app.use('/api/v1/users', usersRouter);