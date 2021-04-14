var express = require('express');
var router = express.Router();
var SqlString = require('sqlstring');
var propObj = require('../../../config_con.js')
let mysqlPool = require('../../../connections/mysqlConnection.js')




router.post('/createBalanceFiles', (req, res) => {
    let obj = req.body
    let objectToSend = {}
    let db = "svayam_" + obj.b_acct_id + "_md";

    let sql = "insert into " + db + ".record_info (record_code,record_business_name,record_technical_name,domain_code,record_type,parent_record_code,status) values "
        + "(" + SqlString.escape(obj.record_code) + "," + SqlString.escape(obj.record_business_name) + "," + SqlString.escape(obj.record_technical_name) + ","
        + SqlString.escape(obj.domain_code) + ",'"+obj.record_type+"'," + SqlString.escape(obj.parent_record_code) + ",0);"

    mysqlPool.getConnection(function (error, mysqlCon) {
        if (error) {
            console.log("Error-->routes-->metadata-->fpem-->balanceFiles-->createBalanceFiles--", error)
            objectToSend["error"] = true
            objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
            res.send(objectToSend);
        } else {
            mysqlCon.beginTransaction(function (error1) {
                if (error1) {
                    console.log("Error-->routes-->metadata-->fpem-->balanceFiles-->createBalanceFiles--", error1)
                    objectToSend["error"] = true
                    objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
                    res.send(objectToSend);
                    mysqlCon.release();
                } else {
                    mysqlCon.query(sql, function (error2, results2) {
                        if (error2) {
                            console.log("Error-->routes-->metadata-->fpem-->balanceFiles-->createBalanceFiles--", error2)
                            objectToSend["error"] = true;
                            objectToSend["data"] = "Some error occured at server Side. Please try again later"
                            res.send(objectToSend)
                            mysqlCon.rollback();
                            mysqlCon.release()
                        } else {
                            let domain="svayam_"+obj.b_acct_id+"_"+obj.domain_db_suffix;
                            let sql_dropTable = "drop table if exists " + domain + "." + obj.record_technical_name + ";";
                            let createQuery = "create table " + domain + "." + obj.record_technical_name + " ("
                            let xrefQuery = "insert into " + db + ".record_xref_field  (record_code,field_code,parent_record_code,col_seq_no) values "
                            let fields = obj.fields;
                            for (let i = 0; i < fields.length; i++) {
                                xrefQuery += "(" + SqlString.escape(obj.record_code) + "," + SqlString.escape(fields[i]['field_code']) + ","+SqlString.escape(fields[i]['parent_record_code'])+"," + i + ")";

                                let fld_type = fields[i]['datatype'];
                                if (fields[i]['datatype_length'] != 0) {
                                    fld_type += "(" + fields[i]['datatype_length'] + ")"
                                }
                                createQuery += fields[i]['field_technical_name'] + " " + fld_type

                                if (fields[i]["is_nullable"] == 0) {
                                    createQuery += " NOT NULL";
                                }
                                if (i != fields.length - 1) {
                                    xrefQuery += ","
                                    createQuery += ","
                                }

                            }
                            createQuery += ")"
                            mysqlCon.query(xrefQuery+";"+sql_dropTable+";"+createQuery, function (error3, results2) {
                                if (error3) {
                                    console.log("Error-->routes-->metadata-->fpem-->balanceFiles-->createBalanceFiles--", error3)
                                    objectToSend["error"] = true;
                                    objectToSend["data"] = "Some error occured at server Side. Please try again later"
                                    res.send(objectToSend)
                                    mysqlCon.rollback();
                                    mysqlCon.release()
                                } else {
                                    mysqlCon.query('COMMIT', function (error4) {
                                        if (error4) {
                                            console.log("Error-->routes-->metadata-->fpem-->balanceFiles-->createBalanceFiles--", error4)
                                            objectToSend["error"] = true;
                                            objectToSend["data"] = "Some error occured at server Side. Please try again later"
                                            res.send(objectToSend)
                                            mysqlCon.rollback();
                                            mysqlCon.release()
                                        } else {
                                            objectToSend["error"] = false;
                                            objectToSend["data"] = "Balance File Created Successfully!"
                                            res.send(objectToSend)
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

router.delete('/deleteBalanceFile:dtls', (req, res) => {
    let obj = JSON.stringify(req.params.dtls)
    let objectToSend = {}
    let db = "svayam_" + obj.b_acct_id + "_md";

    let sql = "delete from " + db + ".record_info where record_code="+SqlString.escape(obj.record_code);
    let xrefDel = "delete from " + db + ".record_xref_field where record_code="+SqlString.escape(obj.record_code);

    mysqlPool.getConnection(function (error, mysqlCon) {
        if (error) {
            console.log("Error-->routes-->metadata-->fpem-->balanceFiles-->deleteBalanceFile--", error)
            objectToSend["error"] = true
            objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
            res.send(objectToSend);
        } else {
            mysqlCon.beginTransaction(function (error1) {
                if (error1) {
                    console.log("Error-->routes-->metadata-->fpem-->balanceFiles-->deleteBalanceFile--", error1)
                    objectToSend["error"] = true
                    objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
                    res.send(objectToSend);
                    mysqlCon.release();
                } else {
                    mysqlCon.query(sql+";"+xrefDel, function (error2, results2) {
                        if (error2) {
                            console.log("Error-->routes-->metadata-->fpem-->balanceFiles-->deleteBalanceFile--", error2)
                            objectToSend["error"] = true;
                            objectToSend["data"] = "Some error occured at server Side. Please try again later"
                            res.send(objectToSend)
                            mysqlCon.rollback();
                            mysqlCon.release()
                        } else {
                            let domain="svayam_"+obj.b_acct_id+"_"+obj.domain_db_suffix;
                            let sql_dropTable = "drop table if exists " + domain + "." + obj.record_technical_name + ";";
                           
                            mysqlCon.query(sql_dropTable, function (error3, results3) {
                                if (error3) {
                                    console.log("Error-->routes-->metadata-->fpem-->balanceFiles-->deleteBalanceFile--", error3)
                                    objectToSend["error"] = true;
                                    objectToSend["data"] = "Some error occured at server Side. Please try again later"
                                    res.send(objectToSend)
                                    mysqlCon.rollback();
                                    mysqlCon.release()
                                } else {
                                    mysqlCon.query('COMMIT', function (error4) {
                                        if (error4) {
                                            console.log("Error-->routes-->metadata-->fpem-->balanceFiles-->deleteBalanceFile--", error4)
                                            objectToSend["error"] = true;
                                            objectToSend["data"] = "Some error occured at server Side. Please try again later"
                                            res.send(objectToSend)
                                            mysqlCon.rollback();
                                            mysqlCon.release()
                                        } else {
                                            objectToSend["error"] = false;
                                            objectToSend["data"] = "Balance File Deleted Successfully!"
                                            res.send(objectToSend)
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


router.get('/getBalanceFiles:dtls', (req, res) => {

    let objectToSend = {}

    let obj = JSON.parse(req.params.dtls);
    let db="svayam_"+obj.b_acct_id+"_md";

    let sql_fetchCurr = "select r.record_code,r.record_business_name,r.record_technical_name,r.domain_code,r.record_type,r.parent_record_code,r.`status`,"
    +" group_concat(x.field_code order by x.col_seq_no) field_code, group_concat(x.parent_record_code order by x.col_seq_no) parent_record_code   "         
    +" from "+db+".record_info r join "+db+".record_xref_field x on r.record_code=x.record_code "
    +" where r.record_type in ('jsf','rsf') group by r.record_code,r.record_business_name,r.record_technical_name,r.domain_code,r.record_type,r.parent_record_code,r.`status`"

    mysqlPool.query(sql_fetchCurr, function (error, results) {
        if (error) {
            console.log("Error-->routes-->metadata-->babalanceFiles-->getBalanceFiles--", error)
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









module.exports = router;