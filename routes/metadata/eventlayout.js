var express = require('express');
var router = express.Router();
var SqlString = require('sqlstring');
var propObj = require('../../config_con')
let mysqlPool = require('../../connections/mysqlConnection');
var moment=require('moment')
router.get('/getip:dtls', (req, res) => {

    let objectToSend = {}


    let b_acct_id = req.params.dtls;


    let db = "svayam_" + b_acct_id + "_md";

    let sql_fetchCurr = "SELECT r.record_code,r.record_business_name,r.record_technical_name,r.domain_code,r.status,r.parent_record_code,r.reference_data_type,r.referred_field_code,"
        +" GROUP_CONCAT(d.field_code ORDER BY x.col_seq_no) AS field_code"
        + "  FROM (SELECT * FROM " + db + ".record_info WHERE record_type='IP' and domain_code='ACCOUNT') r JOIN " + db + ".record_xref_field x ON"
        +" r.record_code=x.record_code "
        + "  JOIN " + db + ".field_info d ON x.field_code=d.field_code GROUP BY r.record_code,r.record_business_name,"
        +" r.record_technical_name,r.domain_code,r.status"


    mysqlPool.query(sql_fetchCurr, function (error, results) {
        if (error) {
            console.log("Error-->routes-->metadata-->-->eventlayout-->getip--", error)
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

router.get('/getsal:dtls', (req, res) => {

    let objectToSend = {}


    let b_acct_id = req.params.dtls;


    let db = "svayam_" + b_acct_id + "_md";

    let sql_fetchCurr = "SELECT r.record_code,r.record_business_name,r.record_technical_name,r.domain_code,r.status,r.parent_record_code,r.reference_data_type,r.referred_field_code,"
        +" GROUP_CONCAT(d.field_code ORDER BY x.col_seq_no) AS field_code"
        + "  FROM (SELECT * FROM " + db + ".record_info WHERE record_type='SAL' and domain_code='ACCOUNT') r JOIN " + db + ".record_xref_field x ON"
        +" r.record_code=x.record_code "
        + "  JOIN " + db + ".field_info d ON x.field_code=d.field_code GROUP BY r.record_code,r.record_business_name,"
        +" r.record_technical_name,r.domain_code,r.status"


    mysqlPool.query(sql_fetchCurr, function (error, results) {
        if (error) {
            console.log("Error-->routes-->metadata-->-->eventlayout-->getsal--", error)
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

router.post('/createRecord', (req, res) => {

    let obj = req.body;

    let objectToSend = {}
    let db = "svayam_" + obj.b_acct_id + "_md";
   

    mysqlPool.getConnection(function (error, mysqlCon) {
        if (error) {
            console.log("Error-->routes-->metadata-->fpem-->referenceRecords-->--createRecord", error)
            objectToSend["error"] = true
            objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
            res.send(objectToSend);
        } else {
            mysqlCon.beginTransaction(function (error1) {
                if (error1) {
                    console.log("Error-->routes-->metadata-->fpem-->referenceRecords-->--createRecord", error1)
                    objectToSend["error"] = true
                    objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
                    res.send(objectToSend);
                    mysqlCon.release();
                }
                else{
    let sql_insert = "insert into " + db + ".record_info (record_code,record_business_name,record_technical_name,domain_code,record_type,referred_field_code,"
    +"reference_data_type,status) values"
    + " (" + SqlString.escape(obj.record_code) + "," + SqlString.escape(obj.record_business_name) + "," + SqlString.escape(obj.record_technical_name) 
    + "," + SqlString.escape(obj.domain_code) + "," + SqlString.escape(obj.record_type) + "," + SqlString.escape(obj.referred_field_code) + "," 
    + SqlString.escape(obj.reference_data_type) + ",'1')"
    mysqlPool.query(sql_insert, function (error, results) {
        if (error) {
            console.log("Error-->routes-->metadata-->fpem-->referenceRecords-->--createRecord-->", error)
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
            mysqlPool.query(sql_insert, function (error, results) {
                if (error) {
                    console.log("Error-->routes-->metadata-->fpem-->referenceRecords-->--createRecord-->", error)
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
                    mysqlCon.rollback();
                    mysqlCon.release()
                } else {
                   

                                    mysqlCon.commit(function (error4) {
                                        if (error4) {
                                            console.log("Error-->routes-->metadata-->fpem-->referenceRecords-->--createRecord", error4)
                                            objectToSend["error"] = true
                                            objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
                                            res.send(objectToSend);
                                            mysqlCon.rollback();
                                            mysqlCon.release()
                                        } else {
                                            console.log(results)
                                            objectToSend["error"] = false;
                                            objectToSend["data"] = results.insertId
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

})

router.get('/geteventlayout:dtls', (req, res) => {

    let objectToSend = {}


    let b_acct_id = req.params.dtls;


    let db = "svayam_" + b_acct_id + "_md";

    let sql_fetchCurr = "SELECT r.record_code,r.record_business_name,r.record_technical_name,r.domain_code,r.status,r.parent_record_code,r.reference_data_type,r.referred_field_code,"
        +" GROUP_CONCAT(d.field_code ORDER BY x.col_seq_no) AS field_code"
        + "  FROM (SELECT * FROM " + db + ".record_info WHERE record_type='EVENTLAYOUT' and domain_code='ACCOUNT') r JOIN " + db + ".record_xref_field x ON"
        +" r.record_code=x.record_code "
        + "  JOIN " + db + ".field_info d ON x.field_code=d.field_code GROUP BY r.record_code,r.record_business_name,"
        +" r.record_technical_name,r.domain_code,r.status"


    mysqlPool.query(sql_fetchCurr, function (error, results) {
        if (error) {
            console.log("Error-->routes-->metadata-->-->eventlayout-->geteventlayout--", error)
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
router.get('/getjournal:dtls', (req, res) => {

    let objectToSend = {}


    let b_acct_id = req.params.dtls;


    let db = "svayam_" + b_acct_id + "_md";

    let sql_fetchCurr = "SELECT r.record_code,r.record_business_name,r.record_technical_name,r.domain_code,r.status,r.parent_record_code,r.reference_data_type,r.referred_field_code,"
        +" GROUP_CONCAT(d.field_code ORDER BY x.col_seq_no) AS field_code"
        + "  FROM (SELECT * FROM " + db + ".record_info WHERE record_type='JOURNAL' and domain_code='ACCOUNT') r JOIN " + db + ".record_xref_field x ON"
        +" r.record_code=x.record_code "
        + "  JOIN " + db + ".field_info d ON x.field_code=d.field_code GROUP BY r.record_code,r.record_business_name,"
        +" r.record_technical_name,r.domain_code,r.status"


    mysqlPool.query(sql_fetchCurr, function (error, results) {
        if (error) {
            console.log("Error-->routes-->metadata-->-->eventlayout-->getjournal--", error)
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

router.put('/updateeventlayout', (req, res) => {
    let obj = req.body;

    let objectToSend = {}
    let db = "svayam_" + obj.b_acct_id + "_md";
   

    mysqlPool.getConnection(function (error, mysqlCon) {
        if (error) {
            console.log("Error-->routes-->metadata-->eventlayout-->--updateeventlayout", error)
            objectToSend["error"] = true
            objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
            res.send(objectToSend);
        } else {
            mysqlCon.beginTransaction(function (error1) {
                if (error1) {
                    console.log("Error-->routes-->metadata--->referenceRecords-->--updateeventlayout", error1)
                    objectToSend["error"] = true
                    objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
                    res.send(objectToSend);
                    mysqlCon.release();
                }
                else
{
    let sql_delete = "delete from " + db + ".record_xref_field where record_code = " + SqlString.escape(obj.record_code)
    mysqlPool.query(sql_delete, function (error, results) {
        if (error) {
            console.log("Error-->routes-->metadata-->eventlayout-->--updateeventlayout-->", error)
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
            mysqlCon.rollback();
            mysqlCon.release()
        } else {

            let sql_insert = "insert into " + db + ".record_xref_field (record_code,field_code,col_seq_no) values"

            for (let i = 0; i < obj.data.length; i++) {
                sql_insert += " (" + SqlString.escape(obj.record_code) + "," + SqlString.escape(obj.data[i].field_code) + "," + i + ") "
                if (i != obj.data.length - 1) {
                    sql_insert += " ,"
                }
            };

let update_sql="update "+db+".record_info set record_business_name="+SqlString.escape(obj['record_business_name'])+" where record_code = " + SqlString.escape(obj.record_code);

            mysqlPool.query(sql_insert+";"+update_sql, function (error, results) {
                if (error) {
                    console.log("Error-->routes-->metadata-->eventlayout-->--updateeventlayout-->", error)
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
                    mysqlCon.rollback();
                    mysqlCon.release()
                } else {
                   

                                    mysqlCon.commit(function (error4) {
                                        if (error4) {
                                            console.log("Error-->routes-->metadata-->eventlayout-->--updateeventlayout", error4)
                                            objectToSend["error"] = true
                                            objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
                                            res.send(objectToSend);
                                            mysqlCon.rollback();
                                            mysqlCon.release()
                                        } else {
                                            console.log(results)
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
})

router.delete('/deleteeventlayout:dtls', (req, res) => {
    let obj = JSON.parse(req.params.dtls)
    let objectToSend = {}
    let record_code = obj.record_code

    //let schema_name = obj.database
    let db = "svayam_" + obj.b_acct_id + "_md";
    let query = "delete from " + db + ".record_xref_field where record_code=" + SqlString.escape(record_code) + ";"
    query += "delete from " + db + ".record_info where record_code=" + SqlString.escape(record_code) + ";"
    /*  if (obj.res_tech_name != null) {
         query += "drop table if exists " + schema_name + "." + obj.res_tech_name + ";"
     } */


    mysqlPool.getConnection(function (error, mysqlCon) {
        if (error) {
            console.log("Error-->routes-->metadata-->eventlayout-->deleteeventlayout--", error)
            objectToSend["error"] = true
            objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
            res.send(objectToSend);
        } else {
            mysqlCon.beginTransaction(function (error12) {
                if (error12) {
                    console.log("Error-->routes-->metadata-->records-->--", error12)
                    objectToSend["error"] = true
                    objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
                    res.send(objectToSend);
                    mysqlCon.release();
                }
                mysqlCon.query(query, function (error1, results1) {
                    if (error1) {
                        console.log("Error-->routes-->metadata-->fpem-->referenceData-->referenceRecords-->deleteRecord-->", error1)
                        objectToSend["error"] = true;
                        objectToSend["data"] = "Some error occured at server Side. Please try again later"
                        res.send(objectToSend)
                        mysqlCon.rollback()
                        mysqlCon.release()
                    } else {
                      mysqlCon.commit(function (error4) {
                                        if (error4) {
                                            console.log("Error-->routes-->metadata-->eventlayout-->--deleteeventlayout", error4)
                                            objectToSend["error"] = true
                                            objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
                                            res.send(objectToSend);
                                            mysqlCon.rollback();
                                            mysqlCon.release()
                                        } else { 
                                objectToSend["error"] = false;
                                objectToSend["data"] = "Record deleted successfully"
                                res.send(objectToSend)
                                mysqlCon.release()


}
})
                            }
                       


                    
                })
            })
        }
    })
})

module.exports = router;
