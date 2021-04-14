var express = require('express');
var router = express.Router();
var propObj = require('../../config_con')
var SqlString = require('sqlstring');

try {
    var mysqlPool = require('../../connections/mysqlConnection.js');
} catch (ex) {
    console.log("Error-->routes-->signup-->require--", ex)
}


router.get('/getrecord:dtls', (req, res) => {

    let objectToSend = {}

    let obj = JSON.parse(req.params.dtls);

    
    let db = "svayam_" + obj.b_acct_id + "_md";

    let sql_fetchCurr = "Select * from " + db + ". record_info where record_type = " + SqlString.escape(obj.record_type)+""

    mysqlPool.query(sql_fetchCurr, function (error, results) {
        if (error) {
            console.log("Error-->routes-->metadata-->records-->getrecord--", error)
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








router.get('/getrecorddtl:dtls', (req, res) => {

    let objectToSend = {}


    let obj = JSON.parse(req.params.dtls);

    let db = "svayam_" + obj.b_acct_id + "_md";

    let sql_fetchFldCode = "Select field_code  from " + db + ".record_xref_field where record_code=" + SqlString.escape(obj.record_code)+" ORDER BY col_seq_no"


    mysqlPool.query(sql_fetchFldCode, function (error, results) {
        if (error) {
            console.log("Error-->routes-->metadata-->records-->getrecorddtl--", error)
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

router.post('/updateSystemRecords', (req, res) => {
    let obj = req.body;

    let objectToSend = {}
    let db = "svayam_" + obj.b_acct_id + "_md";

let db1 = "svayam_" + obj.b_acct_id + "_account";
    mysqlPool.getConnection(function (error1, mysqlCon) {
        if (error1) {
            console.log("Error-->routes-->metadata-->records-->updateSyatemRecords---", error1)
            objectToSend["error"] = true
            objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
            res.send(objectToSend);
        } else {
            mysqlCon.beginTransaction(function (error2) {
                if (error2) {
                    console.log("Error-->routes-->metadata--->referenceRecords-->--updateeventlayout", error2)
                    objectToSend["error"] = true
                    objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
                    res.send(objectToSend);
                    mysqlCon.release();
                }
                else {
                    let sql_delete = "delete from " + db + ".record_xref_field where record_code = " + SqlString.escape(obj.record_code)
                    mysqlPool.query(sql_delete, function (error3, results3) {
                        if (error3) {
                            console.log("Error-->routes-->metadata-->records-->updateSyatemRecords----->", error3)
                            objectToSend["error"] = true;
                            objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
                            res.send(objectToSend)
                            mysqlCon.rollback();
                            mysqlCon.release()
                        } else {

                            let sql_insert = "insert into " + db + ".record_xref_field (record_code,field_code,col_seq_no) values"

                            for (let i = 0; i < obj.data.length; i++) {
                                sql_insert += " (" + SqlString.escape(obj.record_code) + "," + SqlString.escape(obj.data[i].field_code) + "," + i + ") "
                                if (i != obj.data.length - 1) {
                                    sql_insert += " ,"
                                }
                            }
                            mysqlPool.query(sql_insert, function (error4, results4) {
                                if (error4) {
                                    console.log("Error-->routes-->metadata-->records-->updateSyatemRecords----->", error4)
                                    objectToSend["error"] = true;
                                    objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."

                                    res.send(objectToSend)
                                    mysqlCon.rollback();
                                    mysqlCon.release()
                                } else {
                                    let record_technical_name = obj['record_technical_name']
                                    let deleteQuery = "drop table if exists  " + db1 + "." + record_technical_name
                                    mysqlPool.query(deleteQuery, function (error5, results5) {
                                        if (error5) {
                                            console.log("Error-->routes-->metadata-->records-->updateSyatemRecords----->", error5)
                                            objectToSend["error"] = true;
                                            objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."

                                            res.send(objectToSend)
                                            mysqlCon.rollback();
                                            mysqlCon.release()
                                        } else {
                                            let auto = []
                                            let createQuery = " CREATE TABLE " + db1 + "." + record_technical_name + " ( "

                                            for (let i = 0; i < obj.data.length; i++) {
                                                if (obj.data[i]['datatype_code'] == 'auto_increment') {
                                                    createQuery += "`"+obj.data[i]['field_technical_name'] + "` BIGINT(20) NOT NULL AUTO_INCREMENT,"
                                                    auto.push(obj.data[i])

                                                } else {
                                                    createQuery += "`"+obj.data[i]['field_technical_name'] + "` " + obj.data[i]['datatype_code'] + " NULL DEFAULT NULL,"

                                                }
                                                // if (i != obj.data.length - 1) {
                                                //     sql_insert += " ,"
                                                // }
                                            }
                                            if(auto.length>0){
                                                createQuery += " INDEX `"+auto[0]['field_technical_name'] + "` (`"+auto[0]['field_technical_name'] + "`) )COLLATE='utf8_unicode_ci';" 
                                            }else{
                                                createQuery =createQuery.substring(0,createQuery.length-1)
                                                createQuery += ")COLLATE='utf8_unicode_ci';"
                                            }
                                            mysqlPool.query(createQuery, function (error7, results7) {
                                                if (error7) {
                                                    console.log("Error-->routes-->metadata-->records-->updateSyatemRecords----->", error7)
                                                    objectToSend["error"] = true;
                                                    objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."

                                                    res.send(objectToSend)
                                                    mysqlCon.rollback();
                                                    mysqlCon.release()
                                                } else {

                                                    mysqlCon.commit(function (error6) {
                                                        if (error6) {
                                                            console.log("Error-->routes-->metadata-->records-->updateSyatemRecords---", error6)
                                                            objectToSend["error"] = true
                                                            objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
                                                            res.send(objectToSend);
                                                            mysqlCon.rollback();
                                                            mysqlCon.release()
                                                        } else {
                                                            objectToSend["error"] = false;
                                                            objectToSend["data"] = 'Updated Sucessfully'
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

                        }
                    })
                }
            })

        }
    })
})


module.exports=router;
