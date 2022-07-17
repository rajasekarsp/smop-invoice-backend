var express = require('express');
var moment = require('moment');
var router = express.Router();

router.post('/', function (req, res, next) {
  const execute = (query, values) => {
    return new Promise((resolve, reject) => {
      if(values) {
        connection.query(query, [values],
          function (err, rows) {
            if (err) {
              console.log(err, "error");
              reject(err);
            }
            resolve(rows);
        });
      }
      connection.query(query,
        function (err, rows) {
          if (err) {
            console.log(err, "error");
            reject(err);
          }
          resolve(rows);
      });
    });
  };

  const getTasks = async () => {
    let clientInsertResults;
    var params = req.body;

    //query
    let clientInsertQuery = `INSERT INTO clients (clientName, clientAddress1, clientAddress2, clientCity, clientPincode, clientGstNo, createdDate) VALUES ?  `;
    let clientValues = [[params.clientName, params.clientAddress1, params.clientAddress2, params.clientCity, params.clientPincode, params.clientGstNo, new Date()]];
    clientInsertResults = await execute(clientInsertQuery, clientValues);

    return clientInsertResults;
  }

  getTasks().then((rows, error) => {
    if (!rows) {
      res.send(JSON.stringify({ "status": 500, "error": error, "response": null }));
      //If there is error, we send the error in the error section with 500 status
    } else {
      res.send(JSON.stringify({ "status": 200, "error": null, "response": rows }));
      //If there is no error, all is good and response is 200OK.
    }
  }).catch((err) => {
    console.err("save-client", err);
    res.status(500).send(JSON.stringify({ "status": 500, "error": err }));
  })


});

module.exports = router;

