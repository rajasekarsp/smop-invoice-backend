var express = require('express');
var router = express.Router();
var async = require('async')

router.post('/', function (req, res, next) {
  const execute = (query, values) => {
    return new Promise((resove, reject) => {
      connection.query(query, [values],
        function (err, rows) {
          if (err) reject(err);
          resove(rows);
        });
    });
  }

  const getTasks = async () => {
    let invoiceInsertResults;
    let prodInsertResults;
    var params = req.body;
    var query = `INSERT INTO invoices (clientId, invoiceDate, invoiceNo, eWayBillNo, gstType, gstSlab, goodsValue, packingValue, gstValue, totalAmount, advanceAmount, balanceAmount, preparedBy, checkedBy, refNo, despatchedThru, lrNo, despatchedDate, despatchedTo, documentsThru, invoiceOrgType, createdDate) VALUES ?  `;
    let values = [[params.clientId, formatMyDate(params.invoiceDate), params.invoiceNo, params.eWayBillNo, params.gstType, params.gstSlab, params.goodsValue, params.packingValue, params.gstValue, params.totalAmount, params.advanceAmount, params.balanceAmount, params.preparedBy, params.checkedBy, params.refNo, params.despatchedThru, params.lrNo, formatMyDate(params.despatchedDate), params.despatchedTo, params.documentsThru, params.invoiceOrgType, new Date()]];
    invoiceInsertResults = await execute(query, values);
    for (var i = 0; i < params.products.length; i++) {
      let productParam = params.products[i];
      let query = `INSERT INTO products (invoiceId, productName, quantity, rate, ratePer, amount, createdDate) VALUES ?  `;
      let values = [[invoiceInsertResults.insertId, productParam.productName, productParam.quantity, productParam.rate, productParam.ratePer, productParam.amount, new Date()]];
      prodInsertResults = await execute(query, values);
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
    //return new Date(dateStr);
    // console.log(dateStr);
    let splitArr = dateStr.split("/");
    return splitArr[2] + "-" + splitArr[1] + "-" + splitArr[0];
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

