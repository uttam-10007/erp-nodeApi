var express = require('express');
var router = express.Router();
var propObj = require('../../../config_con')
var SqlString = require('sqlstring');
var moment = require('moment')

try {
    var mysqlPool = require('../../../connections/mysqlConnection.js');
} catch (ex) {
    console.log("Error-->routes-->signup-->require--", ex)
}


router.get('/getdeviation:dtls', (req, res) => {
    let objectToSend = {}


    let obj = JSON.parse(req.params.dtls)

    let db = "svayam_" + obj.b_acct_id + "_ebill";

    let sql_fetchCurr = "Select * from " + db + ".deviation"
    if (obj["work_order_id"] != undefined) {

        sql_fetchCurr += " where work_order_id =" + SqlString.escape(obj.work_order_id)

    }


    mysqlPool.query(sql_fetchCurr, function (error, results) {
        if (error) {
            console.log("Error-->routes-->info-->deviation-->getdeviation--", error)
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


router.post('/createdeviation', (req, res) => {
    let obj = req.body;

    let objectToSend = {}
    let db = "svayam_" + obj.b_acct_id + "_ebill";
    let create_timestamp = SqlString.escape(moment().format('YYYY-MM-DD HH:mm:ss'))

    let sql_insert = "insert into " + db + ".deviation (status,amount,dev_percentage,dev_amount,data,dev_date,dev_desc,dev_no,work_order_id,project_cd,boq_no,create_user_id,create_timestamp) values"
        + " ("+ SqlString.escape(obj.status) +","+ SqlString.escape(obj.amount) +","+ SqlString.escape(obj.dev_percentage) +","+ SqlString.escape(obj.dev_amount) +","+SqlString.escape(obj.data)+"," +SqlString.escape(obj.dev_date)+","+ SqlString.escape(obj.dev_desc) + "," + SqlString.escape(obj.dev_no) + "," + SqlString.escape(obj.work_order_id) + "," + SqlString.escape(obj.project_cd) + ","
        + SqlString.escape(obj.boq_no) + "," 
        + SqlString.escape(obj.create_user_id) + "," + create_timestamp + ") "

    mysqlPool.query(sql_insert, function (error, results) {
        if (error) {
            console.log("Error-->routes-->info-->deviation-->createdeviation-->", error)
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
router.get('/getLastdeviation:dtls', (req, res) => {
    let objectToSend = {}


    let obj = JSON.parse(req.params.dtls)

    let db = "svayam_" + obj.b_acct_id + "_ebill";

    let sql_fetchCurr = "SELECT *  FROM " + db + ".deviation WHERE dev_no = (SELECT max(dev_no) AS dev_no FROM " + db + ".deviation WHERE work_order_id="+SqlString.escape(obj.work_order_id)+") and work_order_id="+SqlString.escape(obj.work_order_id)
    
   

    mysqlPool.query(sql_fetchCurr, function (error, results) {
        if (error) {
            console.log("Error-->routes-->info-->deviation-->getLastdeviation--", error)
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

router.delete('/deletedeviation:dtls', (req, res) => {
    let obj = JSON.parse(req.params.dtls)
    let objectToSend = {}
    let id = obj.id

    let db = "svayam_" + obj.b_acct_id + "_ebill";


    let sql_deleteFld = "delete from " + db + ".deviation where id='" + id + "'"
    mysqlPool.query(sql_deleteFld, function (error1, results1) {
        if (error1) {
            console.log("Error-->routes-->info-->deviation-->deletedeviation-->", error1)
            objectToSend["error"] = true;
            objectToSend["data"] = "Some error occured at server Side. Please try again later"
            res.send(objectToSend)
        } else {
            objectToSend["error"] = false;
            objectToSend["data"] = " deleted successfully"
            res.send(objectToSend)

        }
    })
})

router.put('/updatedeviation', (req, res) => {
    let obj = req.body
    let objectToSend = {}
    let update_timestamp = SqlString.escape(moment().format('YYYY-MM-DD HH:mm:ss'))

    let db = "svayam_" + obj.b_acct_id + "_ebill";
    let sql = "update " + db + ".deviation set dev_desc=" + SqlString.escape(obj.dev_desc)
        +",dev_date ="+SqlString.escape(obj.dev_date)+",data ="+SqlString.escape(obj.data)+",amount ="+SqlString.escape(obj.amount)
        + ",dev_no=" + SqlString.escape(obj.dev_no) + ",work_order_id=" + SqlString.escape(obj.work_order_id)
        +",dev_amount ="+ SqlString.escape(obj.dev_amount)+",dev_percentage ="+ SqlString.escape(obj.dev_percentage)
        + ",project_cd=" + SqlString.escape(obj.project_cd) + ",boq_no=" + SqlString.escape(obj.boq_no)
        + ",update_user_id=" + SqlString.escape(obj.update_user_id) + ",update_timestamp="
        + update_timestamp + " where id=" + SqlString.escape(obj.id) + ";"


    mysqlPool.getConnection(function (error, mysqlCon) {
        if (error) {
            console.log("Error-->routes-->info-->deviation-->updatedeviation--", error)
            objectToSend["error"] = true
            objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
            res.send(objectToSend);
        } else {
            mysqlCon.beginTransaction(function (error1) {
                if (error1) {
                    console.log("Error-->routes-->info-->deviation-->updatedeviation--", error1)
                    objectToSend["error"] = true
                    objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
                    res.send(objectToSend);
                    mysqlCon.release();
                } else {
                    mysqlCon.query(sql, function (error, results) {
                        if (error) {
                            console.log("Error-->routes-->info-->deviation-->updatedeviation-->", error)
                            objectToSend["error"] = true;
                            objectToSend["data"] = "Some error occured at server Side. Please try again later"
                            res.send(objectToSend)
                            mysqlCon.rollback();
                            mysqlCon.release()
                        } else {

                            mysqlCon.query('COMMIT', function (error2) {
                                if (error2) {
                                    console.log("Error-->routes-->info-->deviation-->updatedeviation-->", error2)
                                    objectToSend["error"] = true;
                                    objectToSend["data"] = "Some error occured at server Side. Please try again later"
                                    res.send(objectToSend)
                                    mysqlCon.rollback();
                                    mysqlCon.release()
                                } else {
                                    objectToSend["error"] = false;
                                    objectToSend["data"] = "deviation Update Successfully"
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
