var express = require('express');
var router = express.Router();
var propObj = require('../config_con.js')
var mysqlPool = require('../connections/mysqlConnection.js');

var SqlString = require('sqlstring');
var moment = require('moment')

router.get('/getApprovalHier:dtls', (req, res) => {
    let objectToSend = {};

    let obj = JSON.parse(req.params.dtls);

    let b_acct_id = SqlString.escape(obj.b_acct_id);

    let sql = "Select * from svayam_" + b_acct_id + "_ebill.approval";
    
    mysqlPool.query(sql, function (error, results) {
        if (error) {
            console.log("Error routes-->approve-->getApprovalHier", error);
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

router.get('/getstatus:dtls', (req, res) => {
    let objectToSend = {};

    let obj = JSON.parse(req.params.dtls);

    let b_acct_id = SqlString.escape(obj.b_acct_id);

    let sql = "Select ast.*,ap.designation_cd from ( select * from svayam_" + b_acct_id + "_ebill.approval_status where doc_type ="+ SqlString.escape(obj.doc_type)+" and doc_local_no ="+SqlString.escape(obj.doc_local_no) +" ) ast JOIN svayam_" + b_acct_id + "_ebill.approval ap ON ap.doc_type = ast.doc_type AND ap.level_of_approval = ast.level_of_approval ORDER BY ast.level_of_approval";
    
    mysqlPool.query(sql, function (error, results) {
        if (error) {
            console.log("Error routes-->approve-->getstatus", error);
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


router.put('/approveTask', (req, res) => {
    let objectToSend = {};
    let obj = req.body;

    let b_acct_id = SqlString.escape(obj.b_acct_id);
    let status = SqlString.escape(obj.status);
    let id = SqlString.escape(obj.id);
    let level_of_approval = SqlString.escape(parseInt(obj.level_of_approval) + 1);
    let doc_local_no = SqlString.escape(obj.doc_local_no);

    let sql = "update  svayam_" + b_acct_id + "_ebill.approval_status SET  `status`= " + status + " WHERE id=" + id;
    let sql1 = "update  svayam_" + b_acct_id + "_ebill.approval_status SET  `status`=  'UNDERAPPROVAL'  WHERE doc_local_no=" + doc_local_no + "and level_of_approval=" + level_of_approval;


    mysqlPool.query(sql + ";" + sql1, function (error, results) {
        if (error) {
            console.log("Error routes-->approve-->approveTask", error);
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


router.get('/getApprovalStatus:dtls', (req, res) => {
    let objectToSend = {};

    let obj = JSON.parse(req.params.dtls);

      let b_acct_id = SqlString.escape(obj.b_acct_id);
    let status = obj.status;
    let designation_cd = SqlString.escape(obj.designation_cd);
    let str = ''
for (let i = 0; i < status.length; i++) {

	str += SqlString.escape(status[i])
 if (i < status.length - 1) {
            str  += " , "
        }
}
    let sql = "Select p.order_of_approval,p.level_of_approval, p.id, p.doc_type,p.doc_desc,p.`status`,p.doc_local_no,p.remark  from svayam_"
        + b_acct_id + "_ebill.approval_status AS p JOIN svayam_"+b_acct_id+"_ebill.approval AS q ON  (p.level_of_approval=q.level_of_approval AND p.doc_type=q.doc_type) "
        + " WHERE q.designation_cd=" + designation_cd + " AND p.`status` in (" + str + ")";


    mysqlPool.query(sql, function (error, results) {
        if (error) {
            console.log("Error routes-->approve-->getApprovalStatus", error);
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

router.put('/rejecttask', (req, res) => {
    let objectToSend = {};
    let obj = req.body;

    let b_acct_id = SqlString.escape(obj.b_acct_id);
    let status = SqlString.escape(obj.status);
    let id = SqlString.escape(obj.id);

    let sql = "update  svayam_"+ b_acct_id + "_ebill.approval_status SET  `status`= " + status + " WHERE id=" + id;


    mysqlPool.query(sql, function (error, results) {
        if (error) {
            console.log("Error routes-->approve-->changeStatus", error);
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


router.post('/insertforapproval', (req, res) => {
    let obj = req.body;

    let objectToSend = {}
    let db = "svayam_" + obj.b_acct_id + "_ebill";
    let create_timestamp = SqlString.escape(moment().format('YYYY-MM-DD HH:mm:ss'))
    let data = obj.data
    let sql_insert = "insert into " + db + ".approval_status (level_of_approval,order_of_approval,doc_type,doc_desc,status,doc_local_no,create_user_id,create_timestamp) values"
    for (let i = 0; i < data.length; i++) {
    
        sql_insert +=  " ("+ SqlString.escape(data[i].level_of_approval) +","+ SqlString.escape(data[i].order_of_approval)+","+SqlString.escape(data[i].doc_type) + ","+ SqlString.escape(data[i].doc_desc) +","+SqlString.escape(data[i].status) + "," + SqlString.escape(data[i].doc_local_no) + "," + SqlString.escape(data[i].create_user_id) + ","
        + "" + create_timestamp + ") "
        if (i < data.length - 1) {
            sql_insert  += " , "
        }
    }
    mysqlPool.query(sql_insert, function (error, results) {
        if (error) {
            console.log("Error-->routes-->info-->boq-->insertforapproval-->", error)
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

