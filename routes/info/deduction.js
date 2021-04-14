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


router.get('/getded:dtls', (req, res) => {
    let objectToSend = {}


    let b_acct_id = req.params.dtls

    let db = "svayam_" + b_acct_id + "_ebill";

    let sql_fetchCurr = "Select deduction_id,ded_name,ded_type,id,apply_on,ded_amt,create_user_id,create_timestamp,update_timestamp,update_user_id from " + db + ".deduction"
   

    mysqlPool.query(sql_fetchCurr, function (error, results) {
        if (error) {
            console.log("Error-->routes-->info-->ded-->getded--", error)
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


router.post('/createded', (req, res) => {
    let obj = req.body;

    let objectToSend = {}
    let db = "svayam_" + obj.b_acct_id + "_ebill";
    let create_timestamp = SqlString.escape(moment().format('YYYY-MM-DD HH:mm:ss'))
    
            let sql_insert = "insert into " + db + ".deduction (ded_type,ded_name,apply_on,ded_amt,deduction_id,create_user_id,create_timestamp) values"
                + " ("+ SqlString.escape(obj.ded_type) +","+ SqlString.escape(obj.ded_name) +"," + SqlString.escape(obj.apply_on) + "," + SqlString.escape(obj.ded_amt) +","+ SqlString.escape(obj.deduction_id) + ","  + SqlString.escape(obj.create_user_id) + ","
                + "" + create_timestamp + ") "

            mysqlPool.query(sql_insert, function (error, results) {
                if (error) {
                    console.log("Error-->routes-->info-->ded-->createded-->", error)
                    objectToSend["error"] = true;
                    if (error.message != undefined || error.message != null) {

                        objectToSend["data"] = "Some error occured at server Side. Please try again later"

                    } else {
                        objectToSend["data"] = "Some error occured at server Side. Please try again later"
                    }

                    res.send(objectToSend)
                } else {

                    objectToSend["error"] = false;
                    objectToSend["data"] = results.insertId
                    res.send(objectToSend)
                }
            })
        

})

router.delete('/deleteded:dtls', (req, res) => {
    let obj = JSON.parse(req.params.dtls)
    let objectToSend = {}
    let id = obj.id

    let db = "svayam_" + obj.b_acct_id + "_ebill";


    let sql_deleteFld = "delete from " + db + ".deduction where id='" + id + "'"
    mysqlPool.query(sql_deleteFld, function (error1, results1) {
        if (error1) {
            console.log("Error-->routes-->info-->ded-->deleteded-->", error1)
            objectToSend["error"] = true;
            objectToSend["data"] = "Some error occured at server Side. Please try again later"
            res.send(objectToSend)
        } else {
            objectToSend["error"] = false;
            objectToSend["data"] = "ded deleted successfully"
            res.send(objectToSend)

        }
    })
})

router.put('/updateded', (req, res) => {
    let obj = req.body
    let objectToSend = {}
    let update_timestamp = SqlString.escape(moment().format('YYYY-MM-DD HH:mm:ss'))

    let db = "svayam_" + obj.b_acct_id + "_ebill";
    let sql = "update " + db + ".deduction set apply_on=" + SqlString.escape(obj.apply_on)
        +  ",ded_amt=" + SqlString.escape(obj.ded_amt)+",deduction_id ="+SqlString.escape(obj.deduction_id)
        +",ded_type ="+ SqlString.escape(obj.ded_type) + ", ded_name ="+ SqlString.escape(obj.ded_name)
        + ",update_user_id=" + SqlString.escape(obj.update_user_id) + ",update_timestamp="
        + update_timestamp + " where id=" + SqlString.escape(obj.id) + ";"




    mysqlPool.getConnection(function (error, mysqlCon) {
        if (error) {
            console.log("Error-->routes-->info-->ded-->updateded--", error)
            objectToSend["error"] = true
            objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
            res.send(objectToSend);
        } else {
            mysqlCon.beginTransaction(function (error1) {
                if (error1) {
                    console.log("Error-->routes-->info-->ded-->updateded--", error1)
                    objectToSend["error"] = true
                    objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
                    res.send(objectToSend);
                    mysqlCon.release();
                } else {
                    mysqlCon.query(sql, function (error, results) {
                        if (error) {
                            console.log("Error-->routes-->info-->ded-->updateded-->", error)
                            objectToSend["error"] = true;
                            objectToSend["data"] = "Some error occured at server Side. Please try again later"
                            res.send(objectToSend)
                            mysqlCon.rollback();
                            mysqlCon.release()
                        } else {

                            mysqlCon.query('COMMIT', function (error2) {
                                if (error2) {
                                    console.log("Error-->routes-->info-->ded-->updateded-->", error2)
                                    objectToSend["error"] = true;
                                    objectToSend["data"] = "Some error occured at server Side. Please try again later"
                                    res.send(objectToSend)
                                    mysqlCon.rollback();
                                    mysqlCon.release()
                                } else {
                                    objectToSend["error"] = false;
                                    objectToSend["data"] = "ded Update Successfully"
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
