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
  }

  const formatIfNaN = value => isNaN(value) ? "" : value;
  const formatIfDate = value => moment.isDate(value) ? `'${moment(value).format("YYYY-MM-DD HH:mm:ss.SSS")}'` : formatIfNaN(value);
  const formatValue = value => (typeof value === "string") ? `'${value}'` : formatIfDate(value);

  const constructUpdateQuery = (keys, values) => {
    return values[0].reduce((aggregate, currentValue, currentIndex) => {
      const keyValuePair = `${keys[currentIndex]}=${formatValue(currentValue)}`;
      return aggregate + (currentIndex === 0 ? ` ${keyValuePair}` : `, ${keyValuePair}`);
    }, "UPDATE");
  };

  const getTasks = async () => {
    let invoiceInsertResults;
    let prodInsertResults;
    let clientInsertResults;
    var params = req.body;

    let clientId = params.clientId;
    if (!clientId) { /* New Client */
      let clientInsertQuery = `INSERT INTO clients (clientName, clientAddress1, clientAddress2, clientCity, clientPincode, clientGstNo, createdDate) VALUES ?  `;
      let clientValues = [[params.clientName, params.clientAddress1, params.clientAddress2, params.clientCity, params.clientPincode, params.clientGstNo, new Date()]];
      clientInsertResults = await execute(clientInsertQuery, clientValues);
    }

    let insertKeys = "clientId, invoiceDate, invoiceNo, eWayBillNo, gstType, gstSlab, goodsValue, packingValue, gstValue, totalAmount, advanceAmount, balanceAmount, preparedBy, checkedBy, refNo, despatchedThru, lrNo, despatchedDate, despatchedTo, documentsThru, invoiceOrgType, createdDate, year";

    let values = [[params.clientId ? params.clientId : clientInsertResults.insertId, params.invoiceDate, params.invoiceNo, params.eWayBillNo, params.gstType, params.gstSlab, params.goodsValue, params.packingValue, params.gstValue, params.totalAmount, params.advanceAmount, params.balanceAmount, params.preparedBy, params.checkedBy, params.refNo, params.despatchedThru, params.lrNo, params.despatchedDate, params.despatchedTo, params.documentsThru, params.invoiceOrgType, new Date(), params.year]];

    const keysArray = insertKeys.split(", "); 
    const updateQuery = constructUpdateQuery(keysArray, values);

    var query = `INSERT INTO invoices (${insertKeys}) VALUES ? ON DUPLICATE KEY ${updateQuery}`;
    
    invoiceInsertResults = await execute(query, values);
    for (var i = 0; i < params.products.length; i++) {
      if(i === 0) {
        let deleteQuery = `DELETE FROM products WHERE invoiceId=${invoiceInsertResults.insertId}`;
        deletedRowsCount = await execute(deleteQuery, null);
        if(deletedRowsCount) {
          console.log("Existing invoiceid products deleted");
        }
      }

      let productParam = params.products[i];
      let insertQuery = `INSERT INTO products (invoiceId, productName, quantity, rate, ratePer, amount, createdDate) VALUES ?  `;
      console.log(productParam.productName);
      let values = [[invoiceInsertResults.insertId, productParam.productName, productParam.quantity, productParam.rate, productParam.ratePer, productParam.amount, new Date()]];
      prodInsertResults = await execute(insertQuery, values);
    }
    return prodInsertResults;

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

  formatMyDate = function (dateStr) {
    return new Date(dateStr).toISOString();
    // console.log(dateStr);
    //let splitArr = dateStr.split("/");
    //return splitArr[2] + "-" + splitArr[1] + "-" + splitArr[0];
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
    console.err(err);
    res.status(500).send(JSON.stringify({ "status": 500, "error": err }));
    //console.log(err);
  })


});

module.exports = router;

