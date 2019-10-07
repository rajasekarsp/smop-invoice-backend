var express = require('express');
var router = express.Router();
var async = require('async')

router.get('/', function (req, res, next) {

  const execute = (query) => {
    return new Promise((resove, reject) => {
      connection.query(query,
        function (err, rows) {
          if (err) reject(err);
          resove(rows);
        });
    });
  }

  const getTasks = async () => {
    var query = "SELECT * FROM clients";
    const results = await execute(query);
    return results;

    /*
    if (error) {
      res.send(JSON.stringify({ "status": 500, "error": error, "response": null }));
      //If there is error, we send the error in the error section with 500 status
    } else {
      console.log("I AM EXECUTEDDDDDDDDDDDDDDDDDDDDD");
      res.send(JSON.stringify({ "status": 200, "error": null, "response": results }));
      //If there is no error, all is good and response is 200OK.
    }
    */
  }

  getTasks().then((rows) => {
    //console.log(rows);
    if (!rows) {
      res.send(JSON.stringify({ "status": 500, "error": error, "response": null }));
      //If there is error, we send the error in the error section with 500 status
    } else {
      res.send(JSON.stringify({ "status": 200, "error": null, "response": rows }));
      //If there is no error, all is good and response is 200OK.
    }
  }).catch((err) => {
    //console.log(err);
  })


});

module.exports = router;

