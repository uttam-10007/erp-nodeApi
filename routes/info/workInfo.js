var express = require('express');
var router = express.Router();
var propObj = require('../../config_con')
var SqlString = require('sqlstring');
var moment = require('moment')

try {
    var mysqlPool = require('../../connections/mysqlConnection.js');
} catch (ex) {
    console.log("Error-->routes-->signup-->require--", ex)
}



router.get('/getWorkFromtender:dtls', (req, res) => {
    let objectToSend = {}


    let obj = JSON.parse(req.params.dtls)

    let db = "svayam_" + obj.b_acct_id + "_ebill";

    let sql_fetchCurr = "Select wi.agr_no,wi.agr_amt,DATE_FORMAT(wi.agr_dt,'%Y-%m-%d') as agr_dt,DATE_FORMAT(wi.sanction_date,'%Y-%m-%d') as sanction_date,"
   +" wi.sanction_by,wi.party_id,data,DATE_FORMAT( wi.ext_date,'%Y-%m-%d') as ext_date,DATE_FORMAT( wi.end_date,'%Y-%m-%d') as end_date,"
   +"  DATE_FORMAT( wi.start_date,'%Y-%m-%d') as start_date,wi.id,wi.work_order_no,wi.work_order_name,wi.work_order_value,"
   +"  DATE_FORMAT( wi.work_order_dt,'%Y-%m-%d') as work_order_dt,wi.tender_ref_no,wi.tender_nic_id,wi.project_cd,wi.budget_cd,wi.budget_name,"
   +"  wi.budget_value,wi.create_user_id,wi.create_timestamp,wi.update_timestamp,wi.update_user_id FROM (SELECT work_id from " + db 
   + ".tender WHERE tender_id="+SqlString.escape(obj.tender_id)+") td JOIN  " + db + ".work_info wi ON td.work_id=wi.id"



    mysqlPool.query(sql_fetchCurr, function (error, results) {
        if (error) {
            console.log("Error-->routes-->info-->WorkInfo-->getWorkFromtender--", error)
            objectToSend["error"] = true
            objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
            res.send(objectToSend);
        } else {
            objectToSend["error"] = false
            objectToSend["data"] = results
            res.send(objectToSend);
        }
    })

})


router.get('/getWorkInfo:dtls', (req, res) => {
    let objectToSend = {}


    let obj = JSON.parse(req.params.dtls)

    let db = "svayam_" + obj.b_acct_id + "_ebill";

    let sql_fetchCurr = "Select agr_no,agr_amt,DATE_FORMAT(agr_dt,'%Y-%m-%d') as agr_dt,DATE_FORMAT(sanction_date,'%Y-%m-%d') as sanction_date,sanction_by,party_id,data,DATE_FORMAT( ext_date,'%Y-%m-%d') as ext_date,DATE_FORMAT( end_date,'%Y-%m-%d') as end_date,DATE_FORMAT( start_date,'%Y-%m-%d') as start_date,id,work_order_no,work_order_name,work_order_value,DATE_FORMAT( work_order_dt,'%Y-%m-%d') as work_order_dt,tender_ref_no,tender_nic_id,project_cd,budget_cd,budget_name,budget_value,create_user_id,create_timestamp,update_timestamp,update_user_id from " + db + ".work_info"

    if(obj['party_id']!=undefined){
         sql_fetchCurr +=" where party_id="+SqlString.escape(obj['party_id']) 
    }

console.log(sql_fetchCurr)
    mysqlPool.query(sql_fetchCurr, function (error, results) {
        if (error) {
            console.log("Error-->routes-->info-->WorkInfo-->getWorkInfo--", error)
            objectToSend["error"] = true
            objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
            res.send(objectToSend);
        } else {
            objectToSend["error"] = false
            objectToSend["data"] = results
            res.send(objectToSend);
        }
    })

})


router.post('/createWorkInfo', (req, res) => {
    let obj = req.body;

    let objectToSend = {}
    let db = "svayam_" + obj.b_acct_id + "_ebill";
    let create_timestamp = SqlString.escape(moment().format('YYYY-MM-DD HH:mm:ss'))

    let sql_insert = "insert into " + db + ".work_info (agr_no,agr_amt,agr_dt,sanction_date,sanction_by,party_id,start_date,end_date,ext_date,data,work_order_no,work_order_name,work_order_value,work_order_dt,tender_ref_no,tender_nic_id,project_cd,budget_cd,budget_name,budget_value,create_user_id,create_timestamp) values"
        + " ("+ SqlString.escape(obj.agr_no) +","+ SqlString.escape(obj.agr_amt) +","+SqlString.escape(obj.agr_dt)+","+SqlString.escape(obj.sanction_date) +","+ SqlString.escape(obj.sanction_by) +","+SqlString.escape(obj.party_id)+","+SqlString.escape(obj.start_date)+","+SqlString.escape(obj.end_date)+"," +SqlString.escape(obj.ext_date)+","+ SqlString.escape(obj.data)+","+ SqlString.escape(obj.work_order_no) + "," + SqlString.escape(obj.work_order_name) + "," + SqlString.escape(obj.work_order_value) + "," + SqlString.escape(obj.work_order_dt) + ","
         + SqlString.escape(obj.tender_ref_no) + "," + SqlString.escape(obj.tender_nic_id) + "," + SqlString.escape(obj.project_cd) + ","+ SqlString.escape(obj.budget_cd) +","+ SqlString.escape(obj.budget_name)+","+ SqlString.escape(obj.budget_value)+","
        + SqlString.escape(obj.create_user_id) + "," + create_timestamp + ") "
console.log(sql_insert)
    mysqlPool.query(sql_insert, function (error, results) {
        if (error) {
            console.log("Error-->routes-->info-->WorkInfo-->createField-->", error)
            objectToSend["error"] = true;

            objectToSend["data"] = "Some error occured at server Side. Please try again later"


            res.send(objectToSend)
        } else {

            objectToSend["error"] = false;
            objectToSend["data"] = results.insertId
            res.send(objectToSend)
        }
    })

})

router.delete('/deleteWorkInfo:dtls', (req, res) => {
    let obj = JSON.parse(req.params.dtls)
    let objectToSend = {}
    let id = obj.id

    let db = "svayam_" + obj.b_acct_id + "_ebill";


    let sql_deleteFld = "delete from " + db + ".work_info where id='" + id + "'"
    mysqlPool.query(sql_deleteFld, function (error1, results1) {
        if (error1) {
            console.log("Error-->routes-->info-->WorkInfo-->deleteWorkInfo-->", error1)
            objectToSend["error"] = true;
            objectToSend["data"] = "Some error occured at server Side. Please try again later"
            res.send(objectToSend)
        } else {
            objectToSend["error"] = false;
            objectToSend["data"] = "Work Info deleted successfully"
            res.send(objectToSend)

        }
    })
})

router.put('/updateWorkInfo', (req, res) => {
    let obj = req.body
    let objectToSend = {}
    let update_timestamp = SqlString.escape(moment().format('YYYY-MM-DD HH:mm:ss'))

    let db = "svayam_" + obj.b_acct_id + "_ebill";
    let sql = "update " + db + ".work_info set work_order_no=" + SqlString.escape(obj.work_order_no)
        + ",work_order_name=" + SqlString.escape(obj.work_order_name) + ",work_order_value=" + SqlString.escape(obj.work_order_value)
        + ",work_order_dt=" + SqlString.escape(obj.work_order_dt) +",data ="+SqlString.escape(obj.data)+",ext_date ="+SqlString.escape(obj.ext_date)
        + ",tender_ref_no=" + SqlString.escape(obj.tender_ref_no) + ",tender_nic_id=" + SqlString.escape(obj.tender_nic_id)
        + ",project_cd=" + SqlString.escape(obj.project_cd)+",end_date ="+SqlString.escape(obj.end_date)+",start_date = "+SqlString.escape(obj.start_date)
        + ",sanction_date=" + SqlString.escape(obj.sanction_date)+",sanction_by ="+SqlString.escape(obj.sanction_by)+",party_id = "+SqlString.escape(obj.party_id)
        + ",budget_cd=" + SqlString.escape(obj.budget_cd) + ",budget_name=" + SqlString.escape(obj.budget_name)
        + ",budget_value=" + SqlString.escape(obj.budget_value)
        + ",agr_amt=" + SqlString.escape(obj.agr_amt) + ",agr_dt=" + SqlString.escape(obj.agr_dt)
        + ",agr_no=" + SqlString.escape(obj.agr_no)
        + ",update_user_id=" + SqlString.escape(obj.update_user_id) + ",update_timestamp="
        + update_timestamp + " where id=" + SqlString.escape(obj.id) + ";"


    mysqlPool.getConnection(function (error, mysqlCon) {
        if (error) {
            console.log("Error-->routes-->info-->WorkInfo-->updateWorkInfo--", error)
            objectToSend["error"] = true
            objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
            res.send(objectToSend);
        } else {
            mysqlCon.beginTransaction(function (error1) {
                if (error1) {
                    console.log("Error-->routes-->info-->WorkInfo-->updateWorkInfo--", error1)
                    objectToSend["error"] = true
                    objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
                    res.send(objectToSend);
                    mysqlCon.release();
                } else {
                    mysqlCon.query(sql, function (error, results) {
                        if (error) {
                            console.log("Error-->routes-->info-->WorkInfo-->updateWorkInfo-->", error)
                            objectToSend["error"] = true;
                            objectToSend["data"] = "Some error occured at server Side. Please try again later"
                            res.send(objectToSend)
                            mysqlCon.rollback();
                            mysqlCon.release()
                        } else {

                            mysqlCon.query('COMMIT', function (error2) {
                                if (error2) {
                                    console.log("Error-->routes-->info-->WorkInfo-->updateWorkInfo-->", error2)
                                    objectToSend["error"] = true;
                                    objectToSend["data"] = "Some error occured at server Side. Please try again later"
                                    res.send(objectToSend)
                                    mysqlCon.rollback();
                                    mysqlCon.release()
                                } else {
                                    objectToSend["error"] = false;
                                    objectToSend["data"] = "WorkInfo Update Successfully"
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



module.exports = router;
