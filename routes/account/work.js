var express = require('express');
var router = express.Router();
var SqlString = require('sqlstring');
var propObj = require('../../config_con')
let mysqlPool = require('../../connections/mysqlConnection');
var moment = require('moment')



router.get('/getworkInfo:dtls', (req, res) => {
    let objectToSend = {}

    let obj = JSON.parse(req.params.dtls)

    let b_acct_id = obj["b_acct_id"]
    let id = obj["id"]

    let party_id = obj["party_id"]

    let sql = "Select id,work_order_no,work_desc,DATE_FORMAT(work_start_dt,'%Y-%m-%d') as work_start_dt,"
        + "DATE_FORMAT(work_end_dt,'%Y-%m-%d') as work_end_dt,party_id,work_order_amt,runnig_bill_no,create_user_id,update_user_id "
        + "from svayam_" + b_acct_id + "_account.work"

    let flag = true;
    if (id != undefined) {
        if (flag) {
            sql += " where id=" + SqlString.escape(id)
            flag = false;
        } else {
            sql += " and id=" + SqlString.escape(id)
        }
    }

    if (party_id != undefined) {
        if (flag) {
            sql += " where party_id=" + SqlString.escape(party_id)
            flag = false;
        } else {
            sql += " and party_id=" + SqlString.escape(party_id)
        }
    }

    mysqlPool.query(sql, function (error, results) {
        if (error) {
            console.log("Error-->routes-->account-->work-->getworkInfo--", error)
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


router.post('/createWork', (req, res) => {
    let objectToSend = {}

    let obj = req.body

    let b_acct_id = obj["b_acct_id"]

    let party_id = SqlString.escape(obj["party_id"])
    let work_order_no = SqlString.escape(obj["work_order_no"])
    let work_desc = SqlString.escape(obj["work_desc"])
    let work_start_dt = SqlString.escape(obj["work_start_dt"])
    let work_end_dt = SqlString.escape(obj["work_end_dt"])
    let work_order_amt = SqlString.escape(obj["work_order_amt"])
    let runnig_bill_no = SqlString.escape(obj["runnig_bill_no"])

    let create_user_id = SqlString.escape(obj["create_user_id"])
    let create_timestamp = SqlString.escape(moment().format('YYYY-MM-DD HH:mm:ss'))

    let sql = "insert into svayam_" + b_acct_id + "_account.work (party_id,work_order_no,work_desc,work_start_dt,work_end_dt,work_order_amt,"
        + "runnig_bill_no,create_user_id,create_timestamp) values"
        + "(" + party_id + "," + work_order_no + "," + work_desc + "," + work_start_dt + "," + work_end_dt + "," + work_order_amt 
        + "," + runnig_bill_no + "," + create_user_id + "," + create_timestamp + ")"

    mysqlPool.query(sql, function (error, results) {
        if (error) {
            console.log()
            console.log("Error-->routes-->account-->work-->createWork--", error)
            objectToSend["error"] = true
            objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
            res.send(objectToSend);
        } else {
            objectToSend["error"] = false
            objectToSend["data"] = results.insertId
            res.send(objectToSend);
        }
    })


})



router.put('/updateWork', (req, res) => {
    let objectToSend = {}

    let obj = req.body

    let b_acct_id = obj["b_acct_id"]
    let id = SqlString.escape(obj["id"])
    let party_id = SqlString.escape(obj["party_id"])
    let work_order_no = SqlString.escape(obj["work_order_no"])
    let work_desc = SqlString.escape(obj["work_desc"])
    let work_start_dt = SqlString.escape(obj["work_start_dt"])
    let work_end_dt = SqlString.escape(obj["work_end_dt"])
    let work_order_amt = SqlString.escape(obj["work_order_amt"])
    let runnig_bill_no = SqlString.escape(obj["runnig_bill_no"])

    let update_user_id = SqlString.escape(obj["update_user_id"])
    let update_timestamp = SqlString.escape(moment().format('YYYY-MM-DD HH:mm:ss'))

    let sql = "update svayam_" + b_acct_id + "_account.work set party_id=" + party_id + ",work_order_no=" + work_order_no + ",work_desc=" + work_desc + ","
        + "work_start_dt=" + work_start_dt + ",work_end_dt=" + work_end_dt + ",work_order_amt=" + work_order_amt + ",runnig_bill_no=" + runnig_bill_no + ",update_user_id=" + update_user_id + ",update_timestamp=" + update_timestamp + " where id=" + id

    mysqlPool.query(sql, function (error, results) {
        if (error) {
            console.log("Error-->routes-->account-->challan-->updateWork--", error)
            objectToSend["error"] = true
            objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
            res.send(objectToSend);
        } else {
            objectToSend["error"] = false
            objectToSend["data"] = "Work Updated Successfully"
            res.send(objectToSend);
        }
    })

})


router.delete('/deleteWork:dtls',(req,res)=>{
    let objectToSend={}

    let obj=JSON.parse(req.params.dtls)

    let b_acct_id=obj["b_acct_id"]
    let id=SqlString.escape(obj["id"])

    let sql="delete from svayam_"+b_acct_id+"_account.work where id="+id

    mysqlPool.query(sql, function (error, results) {
        if (error) {
            console.log("Error-->routes-->account-->work-->deleteWork--", error)
            objectToSend["error"] = true
            objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
            res.send(objectToSend);
        } else {
            objectToSend["error"] = false
            objectToSend["data"] = "Work Deleted Successfully"
            res.send(objectToSend);
        }
    })
    
})



module.exports = router;
