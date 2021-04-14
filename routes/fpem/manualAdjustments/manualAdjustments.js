var express = require('express');
var router = express.Router();
var propObj = require('../../../config_con')
var mysqlPool = require('../../../connections/mysqlConnection');
var SqlString = require('sqlstring');


router.get('/postManualEntry:dtls', (req, res) => {
    let objectToSend = {}

    //let obj=req.body

    //let acct_id=obj.acct_id
    let acct_id = req.params.dtls
    let sql_selectAndLockId = "Select * from " + propObj.svayamUserDbName + ".manual_records_id where acct_id=" + acct_id + " for update"

    mysqlPool.getConnection(function (error1, mysqlCon) {
        if (error1) {
            console.log("Error-->routes-->manualAdjustments-->manualAdjustments-->postManualEntry--", error1)
            objectToSend["error"] = true
            objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
            res.send(objectToSend);
        } else {
            mysqlCon.beginTransaction(function (error2) {
                if (error2) {
                    console.log("Error-->routes-->manualAdjustments-->manualAdjustments-->postManualEntry--", error2)
                    objectToSend["error"] = true
                    objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
                    res.send(objectToSend);
                    mysqlCon.release();
                } else {
                    mysqlCon.query(sql_selectAndLockId, function (error3, results3) {

                        if (error3) {
                            console.log("Error-->routes-->manualAdjustments-->manualAdjustments-->postManualEntry--", error3)
                            objectToSend["error"] = true
                            objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
                            res.send(objectToSend);
                            mysqlCon.rollback();
                            mysqlCon.release();
                        } else {



                            let sql_updateId = "update " + propObj.svayamUserDbName + ".manual_records_id set jrnl_id=jrnl_id+1 where acct_id=" + acct_id
                            mysqlCon.query(sql_updateId, function (error4, results4) {
                                if (error4) {
                                    console.log("Error-->routes-->manualAdjustments-->manualAdjustments-->postManualEntry--", error4)
                                    objectToSend["error"] = true
                                    objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
                                    res.send(objectToSend);
                                    mysqlCon.rollback();
                                    mysqlCon.release();
                                } else {
                                    mysqlCon.commit(function (error5) {
                                        if (error5) {
                                            console.log("Error-->routes-->manualAdjustments-->manualAdjustments-->postManualEntry--", error4)
                                            objectToSend["error"] = true
                                            objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
                                            res.send(objectToSend);
                                            mysqlCon.rollback();
                                            mysqlCon.release();
                                        } else {
                                            console.log("LOCK RELEASED")
                                            objectToSend["error"] = false
                                            objectToSend["data"] = "Commit complete"
                                            res.send(objectToSend);
                                            mysqlCon.release();
                                        }
                                    })
                                }
                            })

                        }
                    })
                }
            })
        }
    })



})


router.post('/postjournal', function (req, res) {

    var obj = req.body;

    var objectToSend = {};
    let args = "";
 

    let query = "insert into svayam_" + obj.b_acct_id + "_data.activity_status (activity_type,activity_msg,activity_status,detailed_msg) values"
        + " ('MAD','Records scheduled for manual adjustment','SCHEDULED','Records scheduled for manual adjustment')";

    mysqlPool.query(query, function (error, results) {
        if (error) {
            console.log("Error-->routes-->manualAdjustments-->manualAdjustments-->manualEvent--", error);
            objectToSend["error"] = true;
            objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
            res.end(JSON.stringify(objectToSend))
        } else {
            let activity_status_id = results.insertId;
            //obj["activity_status_id"] = act_stat_id
            if (obj["records"] == undefined) {
                args = JSON.stringify(obj)
                args = SqlString.escape(args)
                args = args.substring(1, args.length - 1)
            } else {


                //obj["records"] = JSON.stringify(obj["records"])
                args = SqlString.escape(JSON.stringify(obj))
                args = args.substring(1, args.length - 1)

            }
            const exec = require('child_process').exec;
            exec('java -jar jars/ProcessData.jar  ' + activity_status_id + '  ' +obj.b_acct_id + ' "'+ args + '" ', function (err, stdout, stderr) {
                if (err) {

                    console.log("Error-->routes-->manualAdjustments-->manualAdjustments-->manualEvent--", err);
                    objectToSend["error"] = true;
                    objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
                    res.end(JSON.stringify(objectToSend))

                } else {
                    
                }
                if (stderr) {
                    console.log("Error-->routes-->manualAdjustments-->manualAdjustments-->manualEvent--STDERR", stderr);
                }

            });
            objectToSend["error"] = false;
                    objectToSend["data"] = "Request Submitted"
                    res.end(JSON.stringify(objectToSend))
        }
    })




});

router.get('/getsavedrecord:dtls', (req, res) => {

    let objectToSend = {}

    let obj = JSON.parse(req.params.dtls);


    let db = "svayam_" + obj.b_acct_id + "_data";

    let sql_fetchCurr = "Select * from " + db + ". saved_record where record_type = 'jrnl'"

    mysqlPool.query(sql_fetchCurr, function (error, results) {
        if (error) {
            console.log("Error-->routes-->projectMetadata-->metadata-->getsavedrecord--", error)
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

router.post('/createsavedrecord', (req, res) => {
    let obj = req.body;

    let objectToSend = {}
    let db = "svayam_" + obj.b_acct_id + "_data";
    var record = JSON.stringify(obj["record"])

    let sql_insert = "insert into " + db + ".saved_record (record_code,record_type,record,comment) values"
        + " (" + SqlString.escape(obj.record_code) + "," + SqlString.escape(obj.record_type) + "," + SqlString.escape(record) + "," + SqlString.escape(obj.comment) + ") "

    mysqlPool.query(sql_insert, function (error, results) {
        if (error) {
            console.log("Error-->routes-->FPEM-->manualAdjustments-->createsavedrecord-->", error)
            objectToSend["error"] = true;
            if (error.detail != undefined || error.detail != null) {
                if (error.detail.includes("already exists")) {
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

router.delete('/deletesavedrecord:dtls', (req, res) => {
    let obj = JSON.parse(req.params.dtls)
    let objectToSend = {}
    //let process_code = obj.process_code

    let db = "svayam_" + obj.b_acct_id + "_data";

    let sql_deleteFld = "delete from " + db + ".saved_record where id='" + obj.id + "'"
    mysqlPool.query(sql_deleteFld, function (error1, results1) {
        if (error1) {
            console.log("Error-->routes-->FPEM-->manualAdjustments-->deletesavedrecord-->", error1)
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

router.put('/updatesavedrecord', (req, res) => {
    let obj = req.body
    let db = "svayam_" + obj.b_acct_id + "_data";

    let objectToSend = {}
    var record = JSON.stringify(obj["record"])
    let sql = "update " + db + ".saved_record set record=" + SqlString.escape(record) + ",record_code=" + SqlString.escape(obj.record_code) + ","
        + "record_type=" + SqlString.escape(obj.record_type) + ",comment=" + SqlString.escape(obj.comment) + " where id=" + SqlString.escape(obj.id) + ";"




    mysqlPool.getConnection(function (error, mysqlCon) {
        if (error) {
            console.log("Error-->routes-->FPEM-->manualAdjustments-->updatesavedrecord--", error)
            objectToSend["error"] = true
            objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
            res.send(objectToSend);
        } else {
            mysqlCon.beginTransaction(function (error1) {
                if (error1) {
                    console.log("Error-->routes-->FPEM-->updatesavedrecord--", error1)
                    objectToSend["error"] = true
                    objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
                    res.send(objectToSend);
                    mysqlCon.release();
                } else {
                    mysqlCon.query(sql, function (error, results) {
                        if (error) {
                            console.log("Error-->routes-->FPEM-->manualAdjustments-->updatesavedrecord-->", error)
                            objectToSend["error"] = true;
                            objectToSend["data"] = "Some error occured at server Side. Please try again later"
                            res.send(objectToSend)
                            mysqlCon.rollback();
                            mysqlCon.release()
                        } else {

                            mysqlCon.query('COMMIT', function (error2) {
                                if (error2) {
                                    console.log("Error-->routes-->FPEM-->manualAdjustments-->updatesavedrecord-->", error2)
                                    objectToSend["error"] = true;
                                    objectToSend["data"] = "Some error occured at server Side. Please try again later"
                                    res.send(objectToSend)
                                    mysqlCon.rollback();
                                    mysqlCon.release()
                                } else {
                                    objectToSend["error"] = false;
                                    objectToSend["data"] = "Update Successfully"
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


module.exports = router;
