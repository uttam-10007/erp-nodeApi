var express = require('express');
var router = express.Router();
var propObj = require('../../config_con')
var SqlString = require('sqlstring');

try {
    var mysqlPool = require('../../connections/mysqlConnection.js');
} catch (ex) {
    console.log("Error-->routes-->signup-->require--", ex)
}


router.get('/getsystemDatatypes', (req, res) => {
    let sql_fetchDt = "Select * from " + propObj.svayamSystemDbName + ".available_datatype";
    let objectToSend = {}
    mysqlPool.query(sql_fetchDt, function (error, results) {
        if (error) {
            console.log("Error-->routes-->metadata-->datatypes-->getDatatypes-->", error)
            objectToSend["error"] = true;
            objectToSend["data"] = "Some error occured at server Side. Please try again later"
            res.send(objectToSend)
        } else {
            objectToSend["error"] = false;
            objectToSend["data"] = results
            res.send(objectToSend)
        }
    })
})

router.get('/getdatatypes:dtls', (req, res) => {

    let objectToSend = {}

    let b_acct_id=req.params.dtls
    let db = "svayam_" + b_acct_id + "_md";

    let sql_fetchCurr = "Select * from " + db + ".datatype_info"

    mysqlPool.query(sql_fetchCurr, function (error, results) {
        if (error) {
            console.log("Error-->routes-->metadata-->datatypes-->getdatatypes--", error)
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


router.post('/createDatatype', (req, res) => {

    let objectToSend = {}

    let obj = req.body;
    let db = "svayam_" + obj.b_acct_id + "_md";
    let sql_fetchCurr = "insert into " + db + ".datatype_info (datatype_code, bus_datatype_name, datatype_name, datatype_length) values("
        + SqlString.escape(obj.datatype_code) + "," + SqlString.escape(obj.bus_datatype_name) + "," + SqlString.escape(obj.datatype_name) + "," + SqlString.escape(obj.datatype_length) + "); "

    mysqlPool.query(sql_fetchCurr, function (error, results) {
        if (error) {
            console.log("Error-->routes-->metadata-->datatypes-->createDatatype--", error)
            objectToSend["error"] = true
            if (error.message != undefined || error.message != null) {
                if (error.message.includes("already exists")) {
                    objectToSend["data"] = "Possible duplicates"
                } else {
                    objectToSend["data"] = "Some error occured at server Side. Please try again later"
                }
            } else {
                objectToSend["data"] = "Some error occured at server Side. Please try again later"
            }
            res.send(objectToSend);
        } else {
            objectToSend["error"] = false
            objectToSend["data"] = results.insertId

            res.send(objectToSend);
        }
    })
})

router.delete('/deleteDatatype:dtls', (req, res) => {
    let obj = JSON.parse(req.params.dtls)
    let objectToSend = {}
    let datatype_code = obj.datatype_code

    let db = "svayam_" + obj.b_acct_id + "_md";
    let sql_checkPresence = "Select * from " + db + ".field_info where datatype_code='" + datatype_code + "' limit 1"

    mysqlPool.query(sql_checkPresence, function (error, results) {
        if (error) {
            console.log("Error-->routes-->metadata-->datatypes-->deleteDatatype-->", error)
            objectToSend["error"] = true;
            objectToSend["data"] = "Some error occured at server Side. Please try again later"
            res.send(objectToSend)
        } else if (results.length != 0) {
            objectToSend["error"] = true;
            objectToSend["data"] = "Unable to delete datatype as it is used by some records"
            res.send(objectToSend)
        } else {
            let sql_deleteFld = "delete from " + db + ".datatype_info where datatype_code='" + datatype_code + "'"
            mysqlPool.query(sql_deleteFld, function (error1, results1) {
                if (error1) {
                    console.log("Error-->routes-->metadata-->datatypes-->deleteDatatype-->", error)
                    objectToSend["error"] = true;
                    objectToSend["data"] = "Some error occured at server Side. Please try again later"
                    res.send(objectToSend)
                } else {
                    objectToSend["error"] = false;
                    objectToSend["data"] = "Datatype deleted successfully"
                    res.send(objectToSend)
                }
            })
        }
    })
})

router.put('/updateDatatype', (req, res) => {

    let objectToSend = {}

    let obj = req.body;

    
    let db = "svayam_" + obj.b_acct_id + "_md";
    let sql = "update " + db + ".datatype_info set bus_datatype_name=" + SqlString.escape(obj.bus_datatype_name) + ", datatype_name=" + SqlString.escape(obj.datatype_name) + ",datatype_length=" + SqlString.escape(obj.datatype_length) + " where datatype_code=" + SqlString.escape(obj.datatype_code) + "; "


    mysqlPool.getConnection(function (error, mysqlCon) {
        if (error) {
            console.log("Error-->routes-->metadata-->datatypes-->-updateDatatype", error)
            objectToSend["error"] = true
            objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
            res.send(objectToSend);
        } else {
            mysqlCon.beginTransaction(function (error1) {
                if (error1) {
                    console.log("Error-->routes-->metadata-->datatypes-->-updateDatatype", error1)
                    objectToSend["error"] = true
                    objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
                    res.send(objectToSend);
                    mysqlCon.release();
                } else {
                    mysqlCon.query(sql, function (error, results) {
                        if (error) {
                            console.log("Error-->metadata-->datatypes-->updateDatatype-->", error)
                            objectToSend["error"] = true;
                            objectToSend["data"] = "Some error occured at server Side. Please try again later"
                            res.send(objectToSend)
                            mysqlCon.rollback();
                            mysqlCon.release()
                        } else {
                            mysqlCon.commit(function (error4) {
                                if (error4) {
                                    console.log("Error-->routes-->metadata-->datatypes-->-updateDatatype", error4)
                                    objectToSend["error"] = true
                                    objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."

                                    res.send(objectToSend);
                                    mysqlCon.rollback();
                                    mysqlCon.release()
                                } else {
                                    objectToSend["error"] = false;
                                    objectToSend["data"] = "Datatype Updated successfully"
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