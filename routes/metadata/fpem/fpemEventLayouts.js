var express = require('express');
var router = express.Router();
var SqlString = require('sqlstring');
var propObj = require('../../../config_con.js')
let mysqlPool = require('../../../connections/mysqlConnection.js')




router.post('/createFpemEventLayout', (req, res) => {
    let obj = req.body
    let objectToSend = {}
    let db = "svayam_" + obj.b_acct_id + "_md";

    let sql = "insert into " + db + ".record_info (record_code,record_business_name,record_technical_name,domain_code,record_type,status) values "
        + "(" + SqlString.escape(obj.record_code) + "," + SqlString.escape(obj.record_business_name) + "," + SqlString.escape(obj.record_technical_name) + ","
        + SqlString.escape(obj.domain_code) + ",'fpem_event_layout',0);"

    mysqlPool.getConnection(function (error, mysqlCon) {
        if (error) {
            console.log("Error-->routes-->metadata-->fpem-->FpemEventLayout-->createFpemEventLayout--", error)
            objectToSend["error"] = true
            objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
            res.send(objectToSend);
        } else {
            mysqlCon.beginTransaction(function (error1) {
                if (error1) {
                    console.log("Error-->routes-->metadata-->fpem-->FpemEventLayout-->createFpemEventLayout--", error1)
                    objectToSend["error"] = true
                    objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
                    res.send(objectToSend);
                    mysqlCon.release();
                } else {
                    mysqlCon.query(sql, function (error2, results2) {
                        if (error2) {
                            console.log("Error-->routes-->metadata-->fpem-->FpemEventLayout-->createFpemEventLayout--", error2)
                            objectToSend["error"] = true;
                            objectToSend["data"] = "Some error occured at server Side. Please try again later"
                            res.send(objectToSend)
                            mysqlCon.rollback();
                            mysqlCon.release()
                        } else {
                            let xrefQuery = "insert into " + db + ".record_xref_field  (record_code,field_code,section_of_record,col_seq_no) values "
                            let fields = obj.fields;
                            
                            for (let i = 0; i < fields.length; i++) {
                                xrefQuery += "(" + SqlString.escape(obj.record_code) + "," + SqlString.escape(fields[i]['field_code']) + ","+SqlString.escape(fields[i]['section_of_record'])+"," + i + ")";

                                if (i != fields.length - 1) {
                                    xrefQuery += ","
                                }

                            }
                            mysqlCon.query(xrefQuery, function (error3, results2) {
                                if (error3) {
                                    console.log("Error-->routes-->metadata-->fpem-->FpemEventLayout-->createFpemEventLayout--", error3)
                                    objectToSend["error"] = true;
                                    objectToSend["data"] = "Some error occured at server Side. Please try again later"
                                    res.send(objectToSend)
                                    mysqlCon.rollback();
                                    mysqlCon.release()
                                } else {
                                    mysqlCon.query('COMMIT', function (error4) {
                                        if (error4) {
                                            console.log("Error-->routes-->metadata-->fpem-->FpemEventLayout-->createFpemEventLayout--", error4)
                                            objectToSend["error"] = true;
                                            objectToSend["data"] = "Some error occured at server Side. Please try again later"
                                            res.send(objectToSend)
                                            mysqlCon.rollback();
                                            mysqlCon.release()
                                        } else {
                                            objectToSend["error"] = false;
                                            objectToSend["data"] = "Fpem Event Layout Created Successfully!"
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

router.delete('/deleteFpemEventLayout:dtls', (req, res) => {
    let obj = JSON.parse(req.params.dtls)
    let objectToSend = {}
    let db = "svayam_" + obj.b_acct_id + "_md";

    let sql = "delete from " + db + ".record_info where record_code="+SqlString.escape(obj.record_code);
    let xrefDel = "delete from " + db + ".record_xref_field where record_code="+SqlString.escape(obj.record_code);

    mysqlPool.getConnection(function (error, mysqlCon) {
        if (error) {
            console.log("Error-->routes-->metadata-->fpem-->FpemEventLayout-->deleteFpemEventLayout--", error)
            objectToSend["error"] = true
            objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
            res.send(objectToSend);
        } else {
            mysqlCon.beginTransaction(function (error1) {
                if (error1) {
                    console.log("Error-->routes-->metadata-->fpem-->FpemEventLayout-->deleteFpemEventLayout--", error1)
                    objectToSend["error"] = true
                    objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
                    res.send(objectToSend);
                    mysqlCon.release();
                } else {
                    mysqlCon.query(sql+";"+xrefDel, function (error2, results2) {
                        if (error2) {
                            console.log("Error-->routes-->metadata-->fpem-->FpemEventLayout-->deleteFpemEventLayout--", error2)
                            objectToSend["error"] = true;
                            objectToSend["data"] = "Some error occured at server Side. Please try again later"
                            res.send(objectToSend)
                            mysqlCon.rollback();
                            mysqlCon.release()
                        } else {
                        
                                    mysqlCon.query('COMMIT', function (error4) {
                                        if (error4) {
                                            console.log("Error-->routes-->metadata-->fpem-->FpemEventLayout-->deleteFpemEventLayout--", error4)
                                            objectToSend["error"] = true;
                                            objectToSend["data"] = "Some error occured at server Side. Please try again later"
                                            res.send(objectToSend)
                                            mysqlCon.rollback();
                                            mysqlCon.release()
                                        } else {
                                            objectToSend["error"] = false;
                                            objectToSend["data"] = "Fpem Event Layout Deleted Successfully!"
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


router.get('/getFpemEventLayouts:dtls', (req, res) => {

    let objectToSend = {}

    
    let b_acct_id = req.params.dtls;
    let db="svayam_"+b_acct_id+"_md";

    let sql_fetchCurr = "select r.record_code,r.record_business_name,r.record_technical_name,r.domain_code,r.record_type,r.parent_record_code,r.`status`,"
    +" group_concat(x.field_code order by x.col_seq_no) field_code,group_concat(x.section_of_record order by x.col_seq_no) section_of_record,"
    +" group_concat(fi.field_business_name order by x.col_seq_no) as field_business_name,group_concat(fi.field_technical_name order by x.col_seq_no) as field_technical_name"         
    +" from "+db+".record_info r join "+db+".record_xref_field x on r.record_code=x.record_code join "+db+".field_info fi on x.field_code=fi.field_code "
    +" where r.record_type='fpem_event_layout' group by r.record_code,r.record_business_name,r.record_technical_name,r.domain_code,r.record_type,r.parent_record_code,r.`status`"

    mysqlPool.query(sql_fetchCurr, function (error, results) {
        if (error) {
            console.log("Error-->routes-->metadata-->fpem-->FpemEventLayout-->getFpemEventLayouts--", error)
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


router.put('/updateFpemEventLayout', (req, res) => {

    let objectToSend = {}

    let obj = req.body;

    let db = "svayam_" + obj.b_acct_id + "_md";
    let sql = "update " + db + ".record_info set record_code=" + SqlString.escape(obj.record_code) + ", record_business_name=" + SqlString.escape(obj.record_business_name) + ", record_technical_name=" + SqlString.escape(obj.record_technical_name) +  " where record_code=" + SqlString.escape(obj.old_record_code) + "; "
    sql += "delete from " + db + ".record_xref_field where record_code=" + SqlString.escape(obj.old_record_code) + ";"
    
    sql +=   "insert into " + db + ".record_xref_field  (record_code,field_code,section_of_record,col_seq_no) values "
    let fields = obj.fields;
    for (let i = 0; i < fields.length; i++) {
        sql += "(" + SqlString.escape(obj.record_code) + "," + SqlString.escape(fields[i]['field_code']) + ","+SqlString.escape(fields[i]['section_of_record'])+"," + i + ")";

        if (i != fields.length - 1) {
            sql += ","
        }

    }


    mysqlPool.getConnection(function (error, mysqlCon) {
        if (error) {
            console.log("Error-->routes-->metadata-->fpem-->FpemEventLayout-->updateFpemEventLayout--", error)
            objectToSend["error"] = true
            objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
            res.send(objectToSend);
        } else {
            mysqlCon.beginTransaction(function (error1) {
                if (error1) {
                    console.log("Error-->routes-->metadata-->fpem-->FpemEventLayout-->updateFpemEventLayout--", error1)
                    objectToSend["error"] = true
                    objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
                    res.send(objectToSend);
                    mysqlCon.release();
                } else {
                    mysqlCon.query(sql, function (error, results) {
                        if (error) {
                            console.log("Error-->routes-->metadata-->fpem-->FpemEventLayout-->updateFpemEventLayout--", error)
                            objectToSend["error"] = true;
                            objectToSend["data"] = "Some error occured at server Side. Please try again later"
                            res.send(objectToSend)
                            mysqlCon.rollback();
                            mysqlCon.release()
                        } else {
                            mysqlCon.commit(function (error4) {
                                if (error4) {
                                    console.log("Error-->routes-->metadata-->fpem-->FpemEventLayout-->updateFpemEventLayout--", error4)
                                    objectToSend["error"] = true
                                    objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
                                    res.send(objectToSend);
                                    mysqlCon.rollback();
                                    mysqlCon.release()
                                } else {
                                    objectToSend["error"] = false;
                                    objectToSend["data"] = "Event Layout updated successfully"
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