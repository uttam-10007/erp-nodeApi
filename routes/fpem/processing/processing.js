var express = require('express');
var router = express.Router();

var propObj = require('../../../config_con.js')

const fs = require('fs');
var SqlString = require('sqlstring');

try {
    var mysqlPool = require('../../../connections/mysqlConnection.js');
} catch (ex) {
    console.log("Error-->routes-->userManagement-->usermanegement--", ex)
}

router.get('/getSystemProcesses', function (req, res) {
    try {
        var objectToSend = {};
        
       
        var sqlQuery = "Select * from " + propObj.svayamSystemDbName + ".process_info ";
        mysqlPool.query(sqlQuery, function (error, results, fields) {
            if (error) {
                console.log("Error-->routes-->Processing-->processing-->getSystemProcesses--", error);
                objectToSend["error"] = true;
                objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."

                res.end(JSON.stringify(objectToSend))
            }
            else {
                //console.log("Error-->false-->routes-->datadefinition-->field-->getfields");

                objectToSend["error"] = false;
                objectToSend["data"] = results
                res.send(JSON.stringify(objectToSend))
            }
        });
    }
    catch (ex) {
        console.log("Error-->routes-->Processing-->processing-->getSystemProcesses--", ex);
        objectToSend["error"] = true;
        objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
        res.send(JSON.stringify(objectToSend))
    }
});



router.get('/getprocessInfo:dtls', function (req, res) {
    try {
        var objectToSend = {};
        var b_acct_id = req.params.dtls;
        let db="svayam_"+b_acct_id+"_data";
        var sqlQuery = "Select * from " + db + ".financial_process_info";
        mysqlPool.query(sqlQuery, function (error, results, fields) {
            if (error) {
                console.log("Error-->routes-->Processing-->processing-->getprocessinfo--", error);
                objectToSend["error"] = true;
                objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."

                res.end(JSON.stringify(objectToSend))
            }
            else {
                //console.log("Error-->false-->routes-->datadefinition-->field-->getfields");

                objectToSend["error"] = false;
                objectToSend["data"] = results
                res.send(JSON.stringify(objectToSend))
            }
        });
    }
    catch (ex) {
        console.log("Error-->routes-->Processing-->processing-->getprocessinfo--", ex);
        objectToSend["error"] = true;
        objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
        res.send(JSON.stringify(objectToSend))
    }
});

router.post('/activateProcess', function (req, res) {
    try {
        var objectToSend = {};
        var obj=req.body;
        let db = "svayam_" + obj.b_acct_id + "_data";
        
        var sqlQuery =" INSERT INTO "+ db +".financial_process_info(process_name,status,process_code)  VALUES ("+ SqlString.escape(obj.process_name) +",'ACTIVE',"+ SqlString.escape(obj.process_code) +") ON DUPLICATE KEY UPDATE status = 'ACTIVE';"
        
        
   
        mysqlPool.query(sqlQuery, function (error, results, fields) {
            if (error) {
                console.log("Error-->routes-->Processing-->processing-->activateProcess--", error);
                objectToSend["error"] = true;
                objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."

                res.end(JSON.stringify(objectToSend))
            }
            else {

                objectToSend["error"] = false;
                objectToSend["data"] = "Process Activate Successfull!"
                res.send(JSON.stringify(objectToSend))
            }
        });
    }
    catch (ex) {
        console.log("Error-->routes-->Processing-->processing-->activateProcess--", ex);
        objectToSend["error"] = true;
        objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
        res.send(JSON.stringify(objectToSend))
    }
});






router.put('/deactivateProcess', function (req, res) {
    try {
        var objectToSend = {};
     
        var b_acct_id=req.body.b_acct_id;
        var process_id=req.body.process_id;
        let db = "svayam_" + b_acct_id + "_data";
        
        var sqlQuery = "update " + db + ".financial_process_info set status='INACTIVE' where id="+process_id;
        mysqlPool.query(sqlQuery, function (error, results, fields) {
            if (error) {
                console.log("Error-->routes-->Processing-->processing-->deactivateProcess--", error);
                objectToSend["error"] = true;
                objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."

                res.end(JSON.stringify(objectToSend))
            }
            else {
                //console.log("Error-->false-->routes-->datadefinition-->field-->getfields");

                objectToSend["error"] = false;
                objectToSend["data"] = "Process Deactivate Successfully!"
                res.send(JSON.stringify(objectToSend))
            }
        });
    }
    catch (ex) {
        console.log("Error-->routes-->Processing-->processing-->deactivateProcess--", ex);
        objectToSend["error"] = true;
        objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
        res.send(JSON.stringify(objectToSend))
    }
});

module.exports = router;
