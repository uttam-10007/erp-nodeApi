var express = require('express');
var router = express.Router();
var propObj = require('../../config_con')
var SqlString = require('sqlstring');

try {
    var mysqlPool = require('../../connections/mysqlConnection.js');
} catch (ex) {
    console.log("Error-->routes-->signup-->require--", ex)
}


router.post('/createprocess', (req, res) => {
    let obj = req.body;

    let objectToSend = {}
    let db = "svayam_" + obj.b_acct_id + "_md";

    let sql_insert = "insert into " + db + ".process_info (process_code,process_name,is_active) values"
        + " (" + SqlString.escape(obj.process_code) + "," + SqlString.escape(obj.process_name) + "," + SqlString.escape(obj.is_active) + ") "

    mysqlPool.query(sql_insert, function (error, results) {
        if (error) {
            console.log("Error-->routes-->metadata-->process-->createProcess", error)
            objectToSend["error"] = true;
            if (error.message != undefined || error.message != null) {
                if (error.message.includes("Duplicate")) {
                    objectToSend["data"] = "Possible duplicates"
                } else {
                    objectToSend["data"] = "Some error occured at server Side. Please try again later"
                }
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

router.delete('/deleteprocess:dtls', (req, res) => {
    let obj = JSON.parse(req.params.dtls)
    let objectToSend = {}
    let process_code = obj.process_code

    let db = "svayam_" + obj.b_acct_id + "_md";

    let sql_deleteFld = "delete from " + db + ".process_info where process_code='" + process_code + "'"
    mysqlPool.query(sql_deleteFld, function (error1, results1) {
        if (error1) {
            console.log("Error-->routes-->metadata-->process-->deleteProcess", error)
            objectToSend["error"] = true;
            objectToSend["data"] = "Some error occured at server Side. Please try again later"
            res.send(objectToSend)
        } else {
            objectToSend["error"] = false;
            objectToSend["data"] = "Process deleted successfully"
            res.send(objectToSend)
        }
    })
})

router.put('/updateprocess', (req, res) => {
    let obj = req.body
    let db = "svayam_" + obj.b_acct_id + "_md";

    let objectToSend = {}

    let sql = "update " + db + ".process_info set process_code=" + SqlString.escape(obj.process_code) + ",process_name=" + SqlString.escape(obj.process_name) + ","
        + "is_active=" + SqlString.escape(obj.is_active) + " where process_code=" + SqlString.escape(obj.old_process_code) + ";"




    mysqlPool.getConnection(function (error, mysqlCon) {
        if (error) {
            console.log("Error-->routes-->metadata-->process-->updateProcess", error)
            objectToSend["error"] = true
            objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
            res.send(objectToSend);
        } else {
            mysqlCon.beginTransaction(function (error1) {
                if (error1) {
                    console.log("Error-->routes-->metadata-->process-->updateProcess", error1)
                    objectToSend["error"] = true
                    objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
                    res.send(objectToSend);
                    mysqlCon.release();
                } else {
                    mysqlCon.query(sql, function (error, results) {
                        if (error) {
                            console.log("Error-->routes-->metadata-->process-->updateProcess", error)
                            objectToSend["error"] = true;
                            objectToSend["data"] = "Some error occured at server Side. Please try again later"
                            res.send(objectToSend)
                            mysqlCon.rollback();
                            mysqlCon.release()
                        } else {

                            mysqlCon.query('COMMIT', function (error2) {
                                if (error2) {
                                    console.log("Error-->routes-->metadata-->process-->updateProcess", error2)
                                    objectToSend["error"] = true;
                                    objectToSend["data"] = "Some error occured at server Side. Please try again later"
                                    res.send(objectToSend)
                                    mysqlCon.rollback();
                                    mysqlCon.release()
                                } else {
                                    objectToSend["error"] = false;
                                    objectToSend["data"] = "Process Updated Successfully"
                                    res.send(objectToSend)
                                }

                            })

                        }
                    })
                }
            })
        }


    })






})








module.exports=router;