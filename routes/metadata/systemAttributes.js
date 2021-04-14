var express = require('express');
var router = express.Router();
var SqlString = require('sqlstring');
var propObj = require('../../config_con')
let mysqlPool = require('../../connections/mysqlConnection');
var moment = require('moment')


router.get('/getSystemDate', (req, res) => {

    let system_date = moment().format('YYYY-MM-DD')
    let objectToSend={}

    objectToSend["error"] = false
    objectToSend["data"] = system_date
    res.send(objectToSend);

})



module.exports = router;
