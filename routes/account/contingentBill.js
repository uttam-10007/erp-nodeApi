var express = require('express');
var router = express.Router();
var SqlString = require('sqlstring');
var propObj = require('../../config_con')
let mysqlPool = require('../../connections/mysqlConnection');
var moment = require('moment')

router.get('/getAllContingentBills:dtls', (req, res) => {
    let objectToSend = {}

    let obj = JSON.parse(req.params.dtls)

    let b_acct_id = obj["b_acct_id"]
    let cb_status = obj["cb_status"]
    let source_code = obj["source_code"]


    let sql = "Select id,cb_id,cb_description,cb_amount,DATE_FORMAT(cb_date,'%Y-%m-%d')  as cb_date,cb_status,source_local_no,"
        + "source_code,data, create_user_id,update_user_id,"
        + "DATE_FORMAT(create_timestamp,'%Y-%m-%d %H:%i:%S') as create_timestamp,"
        + "DATE_FORMAT(update_timestamp,'%Y-%m-%d %H:%i:%S') as update_timestamp "
        + " from  svayam_" + b_acct_id + "_account.cb_records "

    let flag = true;
    if (cb_status != undefined) {
        sql += " where cb_status=" + SqlString.escape(cb_status);
        flag = false
    }
    if (source_code != undefined) {
        if (flag) {
            sql += " where source_code=" + SqlString.escape(source_code)
        } else {
            sql += " and source_code=" + SqlString.escape(source_code)
        }
    }

    sql = "Select cb_id,cb_description,cb_status,source_code,cb_date,data from (" + sql + ")x group by cb_id,cb_description,cb_status,source_code,cb_date "

    mysqlPool.query(sql, function (error, results) {
        if (error) {
            console.log("Error-->routes-->account-->contingentBill-->getAllContingentBills--", error)
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

router.get('/getMaxContingentBills:dtls', (req, res) => {
    let objectToSend = {}

    let obj = JSON.parse(req.params.dtls)

    let b_acct_id = obj["b_acct_id"]



    let sql = "Select max(cb_id) AS cb_id from  svayam_" + b_acct_id + "_account.cb_records"


    mysqlPool.query(sql, function (error, results) {
        if (error) {
            console.log("Error-->routes-->account-->contingentBill-->getMaxContingentBills--", error)
            objectToSend["error"] = true
            objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
            res.send(objectToSend);
        } else {
            objectToSend["error"] = false
            objectToSend["data"] = results
            res.send(objectToSend);
        }
    })
});

router.get('/getContingentBill:dtls', (req, res) => {

    let objectToSend = {}

    let obj = JSON.parse(req.params.dtls)

    let b_acct_id = obj["b_acct_id"]

    let cb_id = SqlString.escape(obj["cb_id"])

    let sql = "Select id,cb_id,cb_description,cb_amount,DATE_FORMAT(cb_date,'%Y-%m-%d')  as cb_date,cb_status,source_local_no,"
        + "source_code,data, create_user_id,update_user_id,"
        + "DATE_FORMAT(create_timestamp,'%Y-%m-%d %H:%i:%S') as create_timestamp,"
        + "DATE_FORMAT(update_timestamp,'%Y-%m-%d %H:%i:%S') as update_timestamp "
        + " from  svayam_" + b_acct_id + "_account.cb_records  where cb_id=" + cb_id



    mysqlPool.query(sql, function (error, results) {
        if (error) {
            console.log("Error-->routes-->account-->contingentBill-->getContingentBill--", error)
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




router.post('/createContingentBill', (req, res) => {
    let obj = req.body;
    let objectToSend = {}
    let b_acct_id = obj["b_acct_id"]
    let cb_description = SqlString.escape(obj["cb_description"])
    let cb_amount = SqlString.escape(obj["cb_amount"])
    let cb_date = SqlString.escape(obj["cb_date"])
    let cb_status = SqlString.escape(obj["cb_status"])
    let source_local_no = SqlString.escape(obj["source_local_no"])
    let source_code = SqlString.escape(obj["source_code"])
    let data = obj["data"];
    let create_user_id = SqlString.escape(obj["create_user_id"])
    let create_timestamp = SqlString.escape(moment().format('YYYY-MM-DD HH:mm:ss'));


    
    let cb_id = '';
    let sql_insert = '';

    let sql = "Select max(cb_id) AS cb_id from  svayam_" + b_acct_id + "_account.cb_records";
    mysqlPool.query(sql, function (error, results) {
        if (error) {
            console.log("Error-->routes-->account-->contingentBill-->createContingentBill--", error)
            objectToSend["error"] = true
            objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
            res.send(objectToSend);
        } else {

            cb_id = results[0]['cb_id'];
            if (cb_id == null) {
                cb_id = 1;
            } else {
                cb_id = parseInt(cb_id) + 1;
            }

            sql_insert += "insert into svayam_" + b_acct_id + "_account.cb_records (cb_id,cb_description,cb_amount,cb_date,cb_status,source_local_no,source_code,"
            + "data,create_user_id,create_timestamp) values"

            for (let i = 0; i < data.length; i++) {
                if (i < data.length - 1) {

                   
                    sql_insert += " (" + cb_id + "," + cb_description + "," + cb_amount + "," + cb_date + "," + cb_status + "," + source_local_no
                        + "," + source_code + "," + SqlString.escape(data[i]) + "," + create_user_id + "," + create_timestamp + "),"

                } else {

                    sql_insert += "(" + cb_id + "," + cb_description + "," + cb_amount + "," + cb_date + "," + cb_status + "," + source_local_no
                        + "," + source_code + "," + SqlString.escape(data[i]) + "," + create_user_id + "," + create_timestamp + ")"
                }
            }


            mysqlPool.query(sql_insert, function (error1, results1) {
                if (error1) {
                    console.log("Error-->routes-->account-->contingentBill-->createContingentBill--", error1)
                    objectToSend["error"] = true
                    objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
                    res.send(objectToSend);
                } else {
                    objectToSend["error"] = false
                    objectToSend["data"] = results1
                    res.send(objectToSend);
                }
            })
        }
    })

})
router.put('/changeCbStatus', (req, res) => {
    let objectToSend = {}

    let obj = req.body

    let b_acct_id = obj["b_acct_id"]
    let cb_status = SqlString.escape(obj["cb_status"])
    let cb_id = SqlString.escape(obj["cb_id"])
    let update_user_id = SqlString.escape(obj["update_user_id"])
    let update_timestamp = SqlString.escape(moment().format('YYYY-MM-DD HH:mm:ss'))

    let sql = "update svayam_" + b_acct_id + "_account.cb_records set cb_status=" + cb_status + ", update_user_id=" + update_user_id + ", "
        + " update_timestamp=" + update_timestamp + " where cb_id in (" + cb_id.join(",")+")"

    mysqlPool.query(sql, function (error, results) {
        if (error) {
            console.log("Error-->routes-->account-->contingentBill-->changeCbStatus--", error)
            objectToSend["error"] = true
            objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
            res.send(objectToSend);
        } else {
            objectToSend["error"] = false
            objectToSend["data"] = "CB " + cb_status
            res.send(objectToSend);
        }
    })
})

router.delete('/deleteContingentBill:dtls', (req, res) => {
    let objectToSend = {}

    let obj = JSON.parse(req.params.dtls)
    let cb_id = SqlString.escape(obj["cb_id"])
    let b_acct_id = obj["b_acct_id"]

    let sql = "delete from svayam_" + b_acct_id + "_account.cb_records where cb_id=" + cb_id
    mysqlPool.query(sql, function (error, results) {
        if (error) {
            console.log("Error-->routes-->account-->contingentBill-->deleteContinentBill--", error)
            objectToSend["error"] = true
            objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
            res.send(objectToSend);
        } else {
            objectToSend["error"] = false
            objectToSend["data"] = "CB Deleted"
            res.send(objectToSend);
        }
    })
})


 


module.exports = router
