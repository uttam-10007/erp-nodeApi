var express = require('express');
var router = express.Router();
var SqlString = require('sqlstring');
var propObj = require('../../config_con')
let mysqlPool = require('../../connections/mysqlConnection');











router.get('/dashboardcount:dtls', function (req, res) {

    var b_acct_id = req.params.dtls;
    var db = "svayam_" + b_acct_id + "_hr";
    var objectToSend = {};

    var sqlQuery = "select count(accounts_detail_id) as accounts_detail from " + db + ".accounts_detail; ";
    sqlQuery += "select count(designation_group_id) as designation_group_master  from " + db + ".designation_group_master; ";
    sqlQuery += "select count(employee_id) as employee_detail_master from " + db + ".employee_detail_master; ";
    sqlQuery += "select count(section_id) as section_master  from " + db + ".section_master; ";
    sqlQuery += "select count(designation_id) as designation_master  from " + db + ".designation_master; ";
    sqlQuery += "select count(office_id) as office_master from " + db + ".office_master; ";
    sqlQuery += "select count(district_id) as district_master from " + db + ".district_master; ";
    sqlQuery += "select count(complaint_id) as preliminary_complaint_register from " + db + ".preliminary_complaint_register; ";
    sqlQuery += "select count(state_id) as state_master from " + db + ".state_master; ";
    sqlQuery += "select count(department_id) as department_master from " + db + ".department_master; ";
    sqlQuery += "select count(complaint_proceeding_id) as complaint_proceeding from " + db + ".complaint_proceeding; ";
    
    mysqlPool.query(sqlQuery, function (error, results, fields) {
        if (error) {
            console.log("Error-->routes-->hr-->gethrapis-->getallowanceanddeductionmaster", error);
            objectToSend["error"] = true;
            objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
            res.end(JSON.stringify(objectToSend))
        }
        else {
            objectToSend["error"] = false;
            objectToSend["data"] = results;
            res.send(JSON.stringify(objectToSend))
        }
    });

});


module.exports = router