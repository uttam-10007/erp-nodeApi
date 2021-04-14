var express = require('express');
var router = express.Router();
var propObj = require('../config_con.js')
var mysqlPool = require('../connections/mysqlConnection.js');

var SqlString = require('sqlstring');
var moment = require('moment')



router.get('/getApprbydoclocalno:dtls', (req, res) => {
    let objectToSend = {};

    let obj = JSON.parse(req.params.dtls);

    let b_acct_id = SqlString.escape(obj.b_acct_id);

    let sql = "Select forward_msg,id,user_id,vendor_id,DATE_FORMAT(`timestamp`,'%Y-%m-%d %H:%i:%S') AS `timestamp`,status,doc_type,doc_local_no,doc_desc,remark,forwarded_by from svayam_" + b_acct_id + "_ebill.appr where doc_type ="+SqlString.escape(obj.doc_type) + " and doc_local_no ="+SqlString.escape(obj.doc_local_no);
    
    mysqlPool.query(sql, function (error, results) {
        if (error) {
            console.log("Error routes-->approve-->getApprbydoclocalno", error);
            objectToSend["error"] = true;
            objectToSend["data"] = "Server Side error! Please try again later. If problem persists, contact support"
            res.send(objectToSend)
        } else {
            objectToSend["error"] = false;
            objectToSend["data"] = results
            res.send(objectToSend)
        }
    })
});



router.put('/updateappr', (req, res) => {
    let objectToSend = {};
    let obj = req.body;
 let timestamp = SqlString.escape(moment().format('YYYY-MM-DD HH:mm:ss'))
    let b_acct_id = SqlString.escape(obj.b_acct_id);
    let status = SqlString.escape(obj.status);
    let id = SqlString.escape(obj.id);
 let remark = SqlString.escape(obj.remark);

    let sql = "update  svayam_"+ b_acct_id + "_ebill.appr SET  timestamp="+timestamp+",`status`= " + status + " ,  remark= " + remark + " WHERE id=" + id;


    mysqlPool.query(sql, function (error, results) {
        if (error) {
            console.log("Error routes-->appr-->updateappr", error);
            objectToSend["error"] = true;
            objectToSend["data"] = "Server Side error! Please try again later. If problem persists, contact support"
            res.send(objectToSend)
        } else {
            objectToSend["error"] = false;
            objectToSend["data"] = results;
            res.send(objectToSend)
        }
    })
});



router.get('/getApprbyuserid:dtls', (req, res) => {
    let objectToSend = {};

    let obj = JSON.parse(req.params.dtls);

    let b_acct_id = SqlString.escape(obj.b_acct_id);

    let sql = "Select forward_msg,id,user_id,vendor_id,DATE_FORMAT(`timestamp`,'%Y-%m-%d %H:%i:%S') AS `timestamp`,status,doc_type,doc_local_no,doc_desc,remark,forwarded_by from svayam_" + b_acct_id + "_ebill.appr where status = 'PENDING' and  user_id ="+SqlString.escape(obj.user_id);
    
    mysqlPool.query(sql, function (error, results) {
        if (error) {
            console.log("Error routes-->approve-->getApprbyuserid", error);
            objectToSend["error"] = true;
            objectToSend["data"] = "Server Side error! Please try again later. If problem persists, contact support"
            res.send(objectToSend)
        } else {
            objectToSend["error"] = false;
            objectToSend["data"] = results
            res.send(objectToSend)
        }
    })
});


router.get('/getApprbyvendorid:dtls', (req, res) => {
    let objectToSend = {};

    let obj = JSON.parse(req.params.dtls);

    let b_acct_id = SqlString.escape(obj.b_acct_id);

    let sql = "Select forward_msg,id,user_id,vendor_id,DATE_FORMAT(`timestamp`,'%Y-%m-%d %H:%i:%S') AS `timestamp`,status,doc_type,doc_local_no,doc_desc,remark,forwarded_by from svayam_" + b_acct_id + "_ebill.appr where status = 'PENDING' and  vendor_id ="+SqlString.escape(obj.vendor_id);
    
    mysqlPool.query(sql, function (error, results) {
        if (error) {
            console.log("Error routes-->approve-->getApprbyvendorid", error);
            objectToSend["error"] = true;
            objectToSend["data"] = "Server Side error! Please try again later. If problem persists, contact support"
            res.send(objectToSend)
        } else {
            objectToSend["error"] = false;
            objectToSend["data"] = results
            res.send(objectToSend)
        }
    })
});

router.post('/insertforappr', (req, res) => {
    let obj = req.body;

    let objectToSend = {}
    let db = "svayam_" + obj.b_acct_id + "_ebill";
 let timestamp = SqlString.escape(moment().format('YYYY-MM-DD HH:mm:ss'))
   
    let sql_insert = "insert into " + db + ".appr (forward_msg,timestamp,vendor_id,user_id,forwarded_by,doc_type,doc_desc,status,doc_local_no,remark) values"
    
    
        sql_insert +=  " ("+SqlString.escape(obj.forward_msg)+","+timestamp+","+ SqlString.escape(obj.vendor_id) +","+ SqlString.escape(obj.user_id) +","+ SqlString.escape(obj.forwarded_by)+","+SqlString.escape(obj.doc_type) + ","+ SqlString.escape(obj.doc_desc) +","+SqlString.escape(obj.status) + "," + SqlString.escape(obj.doc_local_no) + "," + SqlString.escape(obj.remark) +  ") "
        
    mysqlPool.query(sql_insert, function (error, results) {
        if (error) {
            console.log("Error-->routes-->info-->appr-->insertforappr-->", error)
            objectToSend["error"] = true;
            if (error.message != undefined || error.message != null) {

                objectToSend["data"] = "Some error occured at server Side. Please try again later"

            } else {
                objectToSend["data"] = "Some error occured at server Side. Please try again later"
            }

            res.send(objectToSend)
        } else {

            objectToSend["error"] = false;
            objectToSend["data"] = 'Inserted Successfully.'
            res.send(objectToSend)
        }
    })

})


module.exports = router
