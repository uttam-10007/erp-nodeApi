var express = require('express');
var router = express.Router();
var propObj = require('../../../config_con.js')
var mysqlPool = require('../../../connections/mysqlConnection.js');


var SqlString = require('sqlstring');
var moment = require('moment')


router.post('/insertApprovalLevel', (req, res) => {
    let obj = req.body;

    let objectToSend = {}
    let db = "svayam_" + obj.b_acct_id + "_ebill";
    let create_timestamp = SqlString.escape(moment().format('YYYY-MM-DD HH:mm:ss'))
    let data = obj.data
    let sql_insert = "insert into " + db + ".level_of_appr (sent_to_vendor,level_of_approval,role_cd,doc_type,create_user_id,create_timestamp) values"
    for (let i = 0; i < data.length; i++) {
    let level=i+1
        sql_insert +=  " ("+ SqlString.escape(data[i].sent_to_vendor)+","+ SqlString.escape(level) +","+ SqlString.escape(data[i].role_cd)+","
        +SqlString.escape(obj.doc_type) + "," + SqlString.escape(obj.create_user_id) + ","
        + "" + create_timestamp + ") "
        if (i < data.length - 1) {
            sql_insert  += " , "
        }
    }
    mysqlPool.query(sql_insert, function (error, results) {
        if (error) {
            console.log("Error-->routes-->administration-->level_of_appr-->insertforapproval-->", error)
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

router.put('/updateApprovalLevel', (req, res) => {
    let obj = req.body;

    let objectToSend = {}
    let db = "svayam_" + obj.b_acct_id + "_ebill";
    let update_timestamp = SqlString.escape(moment().format('YYYY-MM-DD HH:mm:ss'))
    let data = obj.data
    let sql_del="delete from " + db + ".level_of_appr where doc_type="+SqlString.escape(obj.doc_type) 
    let sql_insert = "insert into " + db + ".level_of_appr (sent_to_vendor,level_of_approval,role_cd,doc_type,update_user_id,update_timestamp) values"
    for (let i = 0; i < data.length; i++) {
    let level=i+1
        sql_insert +=  " ("+ SqlString.escape(data[i].sent_to_vendor)+","+ SqlString.escape(level) +","+ SqlString.escape(data[i].role_cd)+","
        +SqlString.escape(obj.doc_type) + "," + SqlString.escape(obj.update_user_id) + ","
        + "" + update_timestamp + ") "
        if (i < data.length - 1) {
            sql_insert  += " , "
        }
    }
    mysqlPool.getConnection(function(error1,mysqlCon){
        if(error1){
            console.log("Error routes-->administration-->level_of_appr-->updateApprovalLevel", error1);
            objectToSend["error"] = true;
            objectToSend["data"] = "Server Side error! Please try again later. If problem persists, contact support"
            res.send(objectToSend)
        }else{
            mysqlCon.beginTransaction(function(error2){
                if(error2){
                    console.log("Error routes-->administration-->level_of_appr-->updateApprovalLevel", error2);
                    objectToSend["error"] = true;
                    objectToSend["data"] = "Server Side error! Please try again later. If problem persists, contact support"
                    res.send(objectToSend)
                    mysqlCon.release()
                }else{
                    mysqlCon.query(sql_del+";"+sql_insert,function(error3,results3){
                        if(error3){
                            console.log("Error routes-->administration-->level_of_appr-->updateApprovalLevel", error3);
                            objectToSend["error"] = true;
                            objectToSend["data"] = "Server Side error! Please try again later. If problem persists, contact support"
                            res.send(objectToSend)
                            mysqlCon.rollback()
                            mysqlCon.release()
                        }else{
                            mysqlCon.commit(function(error4){
                                if(error4){
                                    console.log("Error routes-->administration-->level_of_appr-->updateApprovalLevel", error4);
                                    objectToSend["error"] = true;
                                    objectToSend["data"] = "Server Side error! Please try again later. If problem persists, contact support"
                                    res.send(objectToSend)
                                    mysqlCon.rollback()
                                    mysqlCon.release()
                                }else{
                                    objectToSend["error"] = false;
                                    objectToSend["data"] = "Updated successfully"
                                    res.send(objectToSend)
                                    mysqlCon.release()
                                   
                                }
                            })
                        }
                    })
                }
            })
        }
    })

})



router.get('/getApprovalLevels:dtls', (req, res) => {
    let objectToSend = {};

    let obj = JSON.parse(req.params.dtls);

    let b_acct_id = SqlString.escape(obj.b_acct_id);

    let sql = "Select * from svayam_" + b_acct_id + "_ebill.level_of_appr order by id";
    
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

module.exports=router;
