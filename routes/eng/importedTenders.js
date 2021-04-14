var express = require('express');
var router = express.Router();
var SqlString = require('sqlstring');
var propObj = require('../../config_con')
let mysqlPool = require('../../connections/mysqlConnection');
var moment = require('moment')





router.post('/createimportedTender', (req, res) => {
    let obj = req.body
    let objectToSend = {};

    let b_acct_id = obj["b_acct_id"]
    let svayam_tender_id = SqlString.escape(obj["svayam_tender_id"])
    let nic_tender_id = SqlString.escape(obj["nic_tender_id"])
    let tender_ref_no = SqlString.escape(obj["tender_ref_no"])
    let nic_tender_sale_end_date = SqlString.escape(obj["nic_tender_sale_end_date"])
    let no_of_applicants = SqlString.escape(obj["no_of_applicants"])
    let create_user_id = SqlString.escape(obj["create_user_id"])
    let create_timestamp = SqlString.escape(moment().format('YYYY-MM-DD HH:mm:ss'))
    let result_status = SqlString.escape(obj["result_status"])

    let db = "svayam_" + b_acct_id + "_eng"
    let data = obj["data"]

    let queriesArr = []
    let sql_insert = "INSERT INTO " + db + ".imported_tender (result_status,nic_tender_id,svayam_tender_id, tender_ref_no, no_of_applicants,  nic_tender_sale_end_date, create_user_id,"
        + " create_timestamp) values "
        + " (" +result_status+","+ nic_tender_id + "," + svayam_tender_id + ", " + tender_ref_no + ", " + no_of_applicants + ", " + nic_tender_sale_end_date + ", " + create_user_id + ", "
        + create_timestamp + ")"

    for (let i = 0; i < data.length; i++) {

        let query = "update " + db + ".tender_application set tender_fill_status=" + SqlString.escape(data[i]['tender_fill_status'])
            + ",technical_document_data=" + SqlString.escape(data[i]['technical_document_data'])
            + ",financial_document_id=" + SqlString.escape(data[i]['financial_document_id'])
            + ",nic_tender_id=" + nic_tender_id
            + " where id=" + SqlString.escape(data[i]['id'])
        queriesArr.push(query)
    }




    mysqlPool.getConnection(function (error, mysqlCon) {

        if (error) {
            console.log("Error-->routes-->eng-->importedTenders-->createimportedTender", error);
            objectToSend["error"] = true;
            objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
            res.send(objectToSend)
        } else {
            mysqlCon.beginTransaction(function (error1) {
                if (error1) {
                    console.log("Error-->routes-->eng-->importedTenders-->createimportedTender", error1);
                    objectToSend["error"] = true;
                    objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
                    res.send(objectToSend)
                    mysqlCon.release()
                } else {
                    mysqlCon.query(sql_insert + ";" + queriesArr.join(";"), function (error2, results2) {
                        if (error2) {
                            console.log("Error-->routes-->eng-->importedTenders-->createimportedTender", error2);
                            objectToSend["error"] = true;
                            objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
                            res.send(objectToSend)
                            mysqlCon.rollback();
                            mysqlCon.release()
                        } else {

                            mysqlCon.commit(function (error3) {
                                if (error3) {
                                    console.log("Error-->routes-->eng-->importedTenders-->createimportedTender", error3);
                                    objectToSend["error"] = true;
                                    objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
                                    res.send(objectToSend)
                                    mysqlCon.rollback();
                                    mysqlCon.release()
                                } else {
                                    objectToSend["error"] = false;
                                    objectToSend["data"] = "Created successfully! "
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

router.get('/getimportedTenderss:dtls', (req, res) => {
    let objectToSend = {}

    let obj = JSON.parse(req.params.dtls)

    let b_acct_id = obj["b_acct_id"]

    let db = "svayam_" + b_acct_id + "_eng"

    let sql_fetch = "select id,nic_tender_id,svayam_tender_id,tender_ref_no,DATE_FORMAT(result_end_date,'%Y-%m-%d') as  result_end_date,DATE_FORMAT(result_start_date,'%Y-%m-%d') as  result_start_date,"
        + "DATE_FORMAT(nic_tender_sale_end_date,'%Y-%m-%d') as  nic_tender_sale_end_date, no_of_applicants, result_status, tender_application_id, create_user_id, "
        + "DATE_FORMAT(create_timestamp,'%Y-%m-%d %H:%i:%S') as create_timestamp,DATE_FORMAT(update_timestamp,'%Y-%m-%d %H:%i:%S') as update_timestamp,update_user_id"
        + " from " + db + ".imported_tender"
   

    mysqlPool.query(sql_fetch, function (error2, results) {
        if (error2) {
            console.log("Error-->routes-->eng-->importedTenderss-->getimportedTenderss", error2)
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

router.put('/updateimportedTenders', (req, res) => {
    let objectToSend = {}
    let obj = req.body

    let nic_tender_id = SqlString.escape(obj["nic_tender_id"])

    let id = SqlString.escape(obj["id"])
    let b_acct_id = obj["b_acct_id"]
    let svayam_tender_id = SqlString.escape(obj["svayam_tender_id"])
    let tender_ref_no = SqlString.escape(obj["tender_ref_no"])
    let no_of_applicants = SqlString.escape(obj["no_of_applicants"])
    let result_start_date = SqlString.escape(obj["result_start_date"])
    let result_end_date = SqlString.escape(obj["result_end_date"])
    let nic_tender_sale_end_date = SqlString.escape(obj["nic_tender_sale_end_date"])
    let result_status = SqlString.escape(obj["result_status"])
    let tender_application_id = SqlString.escape(obj["tender_application_id"])


    let tender_fee = SqlString.escape(obj["tender_fee"])
    let update_user_id = SqlString.escape(obj["update_user_id"])

    let update_timestamp = SqlString.escape(moment().format('YYYY-MM-DD HH:mm:ss'))

    let db = "svayam_" + b_acct_id + "_eng"

    let sql_upd = "update " + db + ".imported_tender set nic_tender_id=" + nic_tender_id + ",svayam_tender_id=" + svayam_tender_id 
    + ",tender_ref_no=" + tender_ref_no + ",no_of_applicants=" + no_of_applicants +",tender_application_id="+tender_application_id
    + ",result_start_date=" + result_start_date + ",result_end_date=" + result_end_date + ",result_status="+result_status
        + ",nic_tender_sale_end_date=" + nic_tender_sale_end_date + ",update_user_id=" + update_user_id
        + ",update_timestamp=" + update_timestamp + " where id=" + id

        let data = obj["data"]

        let queriesArr = []

        for (let i = 0; i < data.length; i++) {

            let query = "update " + db + ".tender_application set tender_fill_status=" + SqlString.escape(data[i]['tender_fill_status'])
                + ",technical_document_data=" + SqlString.escape(data[i]['technical_document_data'])
                + ",financial_document_id=" + SqlString.escape(data[i]['financial_document_id'])
                + ",nic_tender_id=" + nic_tender_id
                + ",technical_status=" + SqlString.escape(data[i]['technical_status'])
                + ",technical_marks=" + SqlString.escape(data[i]['technical_marks'])
                + ",offer_value=" + SqlString.escape(data[i]['offer_value'])
                + ",financial_status=" + SqlString.escape(data[i]['financial_status'])
                + ",rank=" + SqlString.escape(data[i]['rank'])
                 + " where id=" + SqlString.escape(data[i]['id'])
            queriesArr.push(query)
        }

 
        mysqlPool.getConnection(function (error, mysqlCon) {

            if (error) {
                console.log("Error-->routes-->eng-->importedTenders-->updateimportedTenders", error);
                objectToSend["error"] = true;
                objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
                res.send(objectToSend)
            } else {
                mysqlCon.beginTransaction(function (error1) {
                    if (error1) {
                        console.log("Error-->routes-->eng-->importedTenders-->updateimportedTenders", error1);
                        objectToSend["error"] = true;
                        objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
                        res.send(objectToSend)
                        mysqlCon.release()
                    } else {
                        mysqlCon.query(sql_upd + ";" + queriesArr.join(";"), function (error2, results2) {
                            if (error2) {
                                console.log("Error-->routes-->eng-->importedTenders-->updateimportedTenders", error2);
                                objectToSend["error"] = true;
                                objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
                                res.send(objectToSend)
                                mysqlCon.rollback();
                                mysqlCon.release()
                            } else {
    
                                mysqlCon.commit(function (error3) {
                                    if (error3) {
                                        console.log("Error-->routes-->eng-->importedTenders-->updateimportedTenders", error3);
                                        objectToSend["error"] = true;
                                        objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
                                        res.send(objectToSend)
                                        mysqlCon.rollback();
                                        mysqlCon.release()
                                    } else {
                                        objectToSend["error"] = false;
                                        objectToSend["data"] = "Updated successfully! "
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




router.delete('/deleteimportedTender:dtls', (req, res) => {
    let objectToSend = {}
    let obj = JSON.parse(req.params.dtls)


    let id = SqlString.escape(obj["id"])
    let b_acct_id = obj["b_acct_id"]

    let db = "svayam_" + b_acct_id + "_eng"

    let sql = "delete from " + db + ".imported_tender  where id=" + id



    mysqlPool.getConnection(function (error, mysqlCon) {

        if (error) {
            console.log("Error-->routes-->eng-->importedTenders-->deleteimportedTender", error);
            objectToSend["error"] = true;
            objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
            res.send(objectToSend)
        } else {
            mysqlCon.beginTransaction(function (error1) {
                if (error1) {
                    console.log("Error-->routes-->eng-->importedTenders-->createimpodeleteimportedTenderrtedTender", error1);
                    objectToSend["error"] = true;
                    objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
                    res.send(objectToSend)
                    mysqlCon.release()
                } else {
                    mysqlCon.query(sql, function (error2, results2) {
                        if (error2) {
                            console.log("Error-->routes-->eng-->importedTenders-->deleteimportedTender", error2);
                            objectToSend["error"] = true;
                            objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
                            res.send(objectToSend)
                            mysqlCon.rollback();
                            mysqlCon.release()
                        } else {

                            mysqlCon.commit(function (error3) {
                                if (error3) {
                                    console.log("Error-->routes-->eng-->importedTenders-->deleteimportedTender", error3);
                                    objectToSend["error"] = true;
                                    objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
                                    res.send(objectToSend)
                                    mysqlCon.rollback();
                                    mysqlCon.release()
                                } else {
                                    objectToSend["error"] = false;
                                    objectToSend["data"] = "Deleted successfully! "
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

router.get('/gettendersForResult:dtls', (req, res) => {
    let objectToSend = {}

    let obj = JSON.parse(req.params.dtls)

    let b_acct_id = obj["b_acct_id"]

    let db = "svayam_" + b_acct_id + "_eng"

    let sql_fetch = "SELECT im.nic_tender_id,DATE_FORMAT(im.result_start_date,'%Y-%m-%d') as result_start_date,DATE_FORMAT(im.result_end_date,'%Y-%m-%d') as result_end_date,im.svayam_tender_id,"
   + "   te.tender_desc,te.tender_name"
   + "  FROM " + db + ".imported_tender im JOIN " + db + ".tender te on im.svayam_tender_id=te.svayam_tender_id"
   + "   WHERE im.result_status='ALLOTED'"
    mysqlPool.query(sql_fetch, function (error2, results) {
        if (error2) {
            console.log("Error-->routes-->eng-->importedTenderss-->gettendersForResult", error2)
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

router.get('/gettenderResult:dtls', (req, res) => {
    let objectToSend = {}

    let obj = JSON.parse(req.params.dtls)

    let b_acct_id = obj["b_acct_id"]

    let db = "svayam_" + b_acct_id + "_eng"

    let sql_fetch = "SELECT it.nic_tender_id,it.tender_ref_no,DATE_FORMAT(it.nic_tender_sale_end_date,'%Y-%m-%d') as  nic_tender_sale_end_date,"
   +"DATE_FORMAT(it.result_start_date,'%Y-%m-%d') as result_start_date,DATE_FORMAT(it.result_end_date,'%Y-%m-%d') as result_end_date,"
   + "  it.tender_application_id,ta.firm_name,ta.rank,tt.tender_name,tt.tender_desc ,ta.financial_status,ta.id AS application_id"  
   + "  FROM " + db + ".imported_tender it JOIN " + db + ".tender_application ta on ta.svayam_tender_id=it.svayam_tender_id"
   + "  JOIN ( select * from " + db + ".tender where svayam_tender_id= "+SqlString.escape(obj['svayam_tender_id'])+") tt ON tt.svayam_tender_id=it.svayam_tender_id"
   +"  WHERE ta.financial_status='QUAIFIED' ORDER BY ta.rank"

    mysqlPool.query(sql_fetch, function (error2, results) {
        if (error2) {
            console.log("Error-->routes-->eng-->importedTenderss-->gettenderResult", error2)
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

module.exports = router;