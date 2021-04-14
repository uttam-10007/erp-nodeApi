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


router.get('/getbud:dtls', (req, res) => {
    let objectToSend = {}


    let obj = JSON.parse(req.params.dtls)

    let db = "svayam_" + obj.b_acct_id + "_ebill";

    let sql_fetchCurr = "Select * from " + db + ".bud"



    mysqlPool.query(sql_fetchCurr, function (error, results) {
        if (error) {
            console.log("Error-->routes-->info-->bud-->getbud--", error)
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


router.post('/createbud', (req, res) => {
    let obj = req.body;

    let objectToSend = {}
    let db = "svayam_" + obj.b_acct_id + "_ebill";
    let create_timestamp = SqlString.escape(moment().format('YYYY-MM-DD HH:mm:ss'))

    let sql_insert = "insert into " + db + ".bud (bud_cd,bud_desc,bud_amt,create_user_id,create_timestamp) values"
        + " ("+ SqlString.escape(obj.bud_cd) +","+ SqlString.escape(obj.bud_desc) +","+SqlString.escape(obj.bud_amt)+","
        + SqlString.escape(obj.create_user_id) + "," + create_timestamp + ") "

    mysqlPool.query(sql_insert, function (error, results) {
        if (error) {
            console.log("Error-->routes-->info-->bud-->createbud-->", error)
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

router.delete('/deletebud:dtls', (req, res) => {
    let obj = JSON.parse(req.params.dtls)
    let objectToSend = {}
    let id = obj.id

    let db = "svayam_" + obj.b_acct_id + "_ebill";


    let sql_deleteFld = "delete from " + db + ".bud where id='" + id + "'"
    mysqlPool.query(sql_deleteFld, function (error1, results1) {
        if (error1) {
            console.log("Error-->routes-->info-->bud-->deletebud-->", error1)
            objectToSend["error"] = true;
            objectToSend["data"] = "Some error occured at server Side. Please try again later"
            res.send(objectToSend)
        } else {
            objectToSend["error"] = false;
            objectToSend["data"] = "Budget deleted successfully"
            res.send(objectToSend)

        }
    })
})

router.put('/updatebud', (req, res) => {
    let obj = req.body
    let objectToSend = {}
    let update_timestamp = SqlString.escape(moment().format('YYYY-MM-DD HH:mm:ss'))

    let db = "svayam_" + obj.b_acct_id + "_ebill";
    let sql = "update " + db + ".bud set bud_desc=" + SqlString.escape(obj.bud_desc) + ",bud_amt=" + SqlString.escape(obj.bud_amt)
        + ",bud_cd=" + SqlString.escape(obj.bud_cd)
        + ",update_user_id=" + SqlString.escape(obj.update_user_id) + ",update_timestamp="
        + update_timestamp + " where id=" + SqlString.escape(obj.id) + ";"


    mysqlPool.getConnection(function (error, mysqlCon) {
        if (error) {
            console.log("Error-->routes-->info-->bud-->updatebud--", error)
            objectToSend["error"] = true
            objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
            res.send(objectToSend);
        } else {
            mysqlCon.beginTransaction(function (error1) {
                if (error1) {
                    console.log("Error-->routes-->info-->bud-->updatebud--", error1)
                    objectToSend["error"] = true
                    objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
                    res.send(objectToSend);
                    mysqlCon.release();
                } else {
                    mysqlCon.query(sql, function (error, results) {
                        if (error) {
                            console.log("Error-->routes-->info-->bud-->updatebud-->", error)
                            objectToSend["error"] = true;
                            objectToSend["data"] = "Some error occured at server Side. Please try again later"
                            res.send(objectToSend)
                            mysqlCon.rollback();
                            mysqlCon.release()
                        } else {

                            mysqlCon.query('COMMIT', function (error2) {
                                if (error2) {
                                    console.log("Error-->routes-->info-->bud-->updatebud-->", error2)
                                    objectToSend["error"] = true;
                                    objectToSend["data"] = "Some error occured at server Side. Please try again later"
                                    res.send(objectToSend)
                                    mysqlCon.rollback();
                                    mysqlCon.release()
                                } else {
                                    objectToSend["error"] = false;
                                    objectToSend["data"] = "Update Successfully"
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
