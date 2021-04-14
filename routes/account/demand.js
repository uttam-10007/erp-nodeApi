
var express = require('express');
var router = express.Router();
var SqlString = require('sqlstring');
var propObj = require('../../config_con')
let mysqlPool = require('../../connections/mysqlConnection');
var moment = require('moment')

router.get('/getdemand:dtls', (req, res) => {

    let objectToSend = {}

    let b_acct_id = req.params.dtls;



    let sql_fetchCurr = "SELECT remark,section,org_bank_acct_no,id,party_id,DATE_FORMAT( demand_date,'%Y-%m-%d') as demand_valid_date,DATE_FORMAT( demand_date,'%Y-%m-%d') as demand_date,org_gstin,data,status,create_user_id,create_timestamp,update_user_id,update_timestamp from svayam_" + b_acct_id + "_account.demand"

    mysqlPool.query(sql_fetchCurr, function (error, results) {
        if (error) {
            console.log("Error-->routes-->account-->demand-->getdemand--", error)
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



router.post('/adddemand', (req, res) => {
    let objectToSend = {}

    let obj = req.body

    let b_acct_id = obj["b_acct_id"]

    let create_timestamp = SqlString.escape(moment().format('YYYY-MM-DD HH:mm:ss'))



    let sql = "insert into svayam_" + b_acct_id + "_account.demand (remark,section,demand_valid_date,party_id,demand_date,org_gstin,org_bank_acct_no,data,status,create_user_id,create_timestamp) values "
       + "("+ SqlString.escape(obj.remark) +"," + SqlString.escape(obj.section) + "," + SqlString.escape(obj.demand_valid_date) + "," + SqlString.escape(obj.party_id) + "," + SqlString.escape(obj.demand_date) + "," + SqlString.escape(obj.org_gstin) + "," + SqlString.escape(obj.org_bank_acct_no) + "," + SqlString.escape(obj.data) + "," + SqlString.escape(obj.status) + "," + SqlString.escape(obj.create_user_id) + "," + create_timestamp + ")"



    mysqlPool.query(sql, function (error, results) {
        if (error) {
            console.log("Error-->routes-->account-->settings-->demand-->adddemand", error)
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

router.put('/updatedemand', (req, res) => {
    let objectToSend = {}

    let obj = req.body

    let b_acct_id = obj["b_acct_id"]
    let party_id = obj["party_id"]
    let demand_date = obj["demand_date"]
    let id = obj["id"]
    let org_gstin = SqlString.escape(obj["org_gstin"])
    let data = SqlString.escape(obj["data"])
    let status = SqlString.escape(obj["status"])
    let update_user_id = SqlString.escape(obj["update_user_id"])
    let update_timestamp = SqlString.escape(moment().format('YYYY-MM-DD HH:mm:ss'))
    let org_bank_acct_no = SqlString.escape(obj["org_bank_acct_no"])
    let section = SqlString.escape(obj["section"])
    let demand_valid_date = SqlString.escape(obj["demand_valid_date"])
    let remark = SqlString.escape(obj["remark"])
    let sql = "update svayam_" + b_acct_id + "_account.demand set party_id=" + SqlString.escape(party_id) + ","
        + "demand_date=" + SqlString.escape(demand_date) + ",org_gstin=" + org_gstin
        + ",data=" + data + ",status=" + status + ",org_bank_acct_no =" + org_bank_acct_no
        + ",section =" + section + ",demand_valid_date = " + demand_valid_date+",remark ="+remark
        + ",update_user_id=" + update_user_id + ",update_timestamp=" + update_timestamp
        + " where id=" + SqlString.escape(id)


    mysqlPool.query(sql, function (error, results) {
        if (error) {
            console.log("Error-->routes-->account-->demand-->updatedemand", error)
            objectToSend["error"] = true
            objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
            res.send(objectToSend);
        } else {
            objectToSend["error"] = false
            objectToSend["data"] = " updated successfully"
            res.send(objectToSend);
        }
    })
})


router.delete('/deletedemand:dtls', (req, res) => {
    let objectToSend = {}

    let obj = JSON.parse(req.params.dtls)

    let b_acct_id = obj["b_acct_id"]
    let id = obj["id"]

    let sql = "delete from svayam_" + b_acct_id + "_account.demand where id=" + SqlString.escape(id)

    mysqlPool.query(sql, function (error, results) {
        if (error) {
            console.log("Error-->routes-->account-->demand-->deletedemand", error)
            objectToSend["error"] = true
            objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
            res.send(objectToSend);
        } else {
            objectToSend["error"] = false
            objectToSend["data"] = " deleted successfully"
            res.send(objectToSend);
        }
    })

})


router.post('/insertProcessedDemandData', (req, res) => {
    let objectToSend = {}

    let obj = req.body

    let b_acct_id = obj["b_acct_id"]
    let id = obj["id"]
    let status = SqlString.escape(obj["status"])
    let update_timestamp = SqlString.escape(moment().format('YYYY-MM-DD HH:mm:ss'))
    let update_user_id = SqlString.escape(obj["update_user_id"])
    let jrnl = obj['jrnl']
    let jrnl_keys = Object.keys(jrnl[0])
    let sql = "update svayam_" + b_acct_id + "_account.demand set status=" + status + ", update_user_id=" + update_user_id + ", "
        + " update_timestamp=" + update_timestamp + " where id in (" + id.join(",") + ")"

    let sql1 = "insert into svayam_" + b_acct_id + "_account.jv (" + jrnl_keys.join(",") + ") values "

    for (let i = 0; i < jrnl.length; i++) {
        let jrnlObj = Object.assign({}, jrnl[i])
        let str = "("

        for (let j = 0; j < jrnl_keys.length; j++) {
            str += SqlString.escape(jrnlObj[jrnl_keys[j]]) + ","
        }
        str = str.substring(0, str.length - 1) + "),"
        sql1 = sql1 + str
    }

    sql1 = sql1.substring(0, sql1.length - 1)
    mysqlPool.getConnection(function (error, mysqlCon) {
        if (error) {
            console.log("Error-->routes-->account-->demand-->insertProcessedDemandData", error)
            objectToSend["error"] = true
            objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
            res.send(objectToSend);
        } else {
            mysqlCon.beginTransaction(function (error1) {
                if (error1) {
                    console.log("Error-->routes-->account-->demand-->insertProcessedDemandData", error1)
                    objectToSend["error"] = true
                    objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
                    res.send(objectToSend);
                    mysqlCon.release()
                } else {
                    mysqlCon.query(sql + ";" + sql1, function (error2, results2) {
                        if (error2) {
                            console.log("Error-->routes-->account-->demand-->insertProcessedDemandData", error2)
                            objectToSend["error"] = true
                            objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
                            res.send(objectToSend);
                            mysqlCon.rollback()
                            mysqlCon.release()
                        } else {
                            mysqlCon.commit(function (error3) {
                                if (error3) {
                                    console.log("Error-->routes-->account-->demand-->insertProcessedDemandData", error3)
                                    objectToSend["error"] = true
                                    objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
                                    res.send(objectToSend);
                                    mysqlCon.rollback()
                                    mysqlCon.release()
                                } else {
                                    objectToSend["error"] = false
                                    objectToSend["data"] = "Processed Successfully."
                                    res.send(objectToSend);
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
