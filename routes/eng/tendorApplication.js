var express = require('express');
var router = express.Router();
var SqlString = require('sqlstring');
var propObj = require('../../config_con')
let mysqlPool = require('../../connections/mysqlConnection');
var moment = require('moment')





router.post('/createtenderApplication', (req, res) => {
    let obj = req.body
    let objectToSend = {};
console.log(req.body)
    let b_acct_id = obj["b_acct_id"]
    let svayam_tender_id = SqlString.escape(obj["svayam_tender_id"])
    let mobile_no = SqlString.escape(obj["mobile_no"])

    let firm_name = SqlString.escape(obj["firm_name"])
    let payment_status = SqlString.escape(obj["payment_status"])

    let payment_date = SqlString.escape(obj["payment_date"])
    let payment_mode = SqlString.escape(obj["payment_mode"])
    let tender_fee = SqlString.escape(obj["tender_fee"])
    let create_user_id = SqlString.escape(obj["create_user_id"])
    let challan_creation_date = SqlString.escape(obj["challan_creation_date"])
    let emd_fee = SqlString.escape(obj["emd_fee"])
    let emd_payment_status = SqlString.escape(obj["emd_payment_status"])
    let emd_payment_date = SqlString.escape(obj["emd_payment_date"])
    
    

    let create_timestamp = SqlString.escape(moment().format('YYYY-MM-DD HH:mm:ss'))
    let db = "svayam_" + b_acct_id + "_eng"


    let getQuer = "select max(challan_no) as challan_no from " + db + ".tender_application"
    let getQuer1 = "select max(emd_challan_no) as emd_challan_no from " + db + ".tender_application"
    mysqlPool.query(getQuer, function (error, results1) {
        if (error) {
            console.log("Error-->routes-->eng-->tenderApplication-->createtenderApplication", error)
            objectToSend["error"] = true;
            objectToSend["data"] = "Some error occured at server Side. Please try again later"
            res.send(objectToSend)

        }
        else{  
             mysqlPool.query(getQuer1, function (error, results3) {
            if (error) {
                console.log("Error-->routes-->eng-->tenderApplication-->createtenderApplication", error)
                objectToSend["error"] = true;
                objectToSend["data"] = "Some error occured at server Side. Please try again later"
                res.send(objectToSend)
    
            }
        else {
           
            let challan_no = 1
            if (results1[0]['challan_no'] == null) {
                challan_no = 1
            } else {
                challan_no = results1[0]['challan_no'] + 1

            }
        
       
            let emd_challan_creation_date = SqlString.escape(moment().format('YYYY-MM-DD HH:mm:ss'))
            let emd_challan_no = 1
            if (results1[0]['emd_challan_no'] == null) {
                emd_challan_no = 1
            } else {
                emd_challan_no = results1[0]['emd_challan_no'] + 1

            }
        
            let sql_insert = "INSERT INTO " + db + ".tender_application (challan_creation_date,mobile_no,svayam_tender_id, firm_name, challan_no, payment_date, payment_mode, payment_status, tender_fee, create_user_id,"
                + " create_timestamp,emd_fee,emd_payment_status,emd_payment_date,emd_challan_no,emd_challan_creation_date) values "
                + " (" + challan_creation_date + "," + mobile_no + "," + svayam_tender_id + ", " + firm_name + ", " + challan_no + ", " + payment_date + ", " + payment_mode + ", " + payment_status + ", " + tender_fee + ", " + create_user_id + ", "
                + create_timestamp +","+ emd_fee +","+ emd_payment_status +","+ emd_payment_date +","+ emd_challan_no +","+ emd_challan_creation_date +")"
            mysqlPool.query(sql_insert, function (error2, results) {
                if (error2) {
                    console.log("Error-->routes-->eng-->tenderApplication-->createtenderApplication", error2)
                    objectToSend["error"] = true;
                    objectToSend["data"] = "Some error occured at server Side. Please try again later"
                    res.send(objectToSend)

                } else {
                    objectToSend["error"] = false;
                    objectToSend["data"] = {emd_challan_no:emd_challan_no, challan_no: challan_no, id: results.insertId }
                    res.send(objectToSend)
                }

            })

        }
    })
}

    })




})

router.get('/getTenderApplications:dtls', (req, res) => {
    let objectToSend = {}

    let obj = JSON.parse(req.params.dtls)

    let b_acct_id = obj["b_acct_id"]

    let db = "svayam_" + b_acct_id + "_eng"

    let sql_fetch = "select DATE_FORMAT(emd_challan_creation_date,'%Y-%m-%d') as emd_challan_creation_date,emd_challan_no,DATE_FORMAT(emd_payment_date,'%Y-%m-%d') as emd_payment_date,emd_payment_status,emd_fee,tender_fill_status,technical_document_data,financial_document_id,nic_tender_id,technical_status,technical_marks,offer_value,financial_status,rank,id,mobile_no,svayam_tender_id, firm_name, challan_no,DATE_FORMAT(challan_creation_date,'%Y-%m-%d') as  challan_creation_date,"
        + "DATE_FORMAT(payment_date,'%Y-%m-%d') as  payment_date, payment_mode, payment_status, tender_fee, create_user_id, "
        + "DATE_FORMAT(create_timestamp,'%Y-%m-%d %H:%i:%S') as create_timestamp,DATE_FORMAT(update_timestamp,'%Y-%m-%d %H:%i:%S') as update_timestamp,update_user_id"
        + " from " + db + ".tender_application"
    let flag = false
    if (obj["svayam_tender_id"] != undefined) {
        sql_fetch += " where svayam_tender_id=" + SqlString.escape(obj["svayam_tender_id"])
        flag = true
    }
    if (obj["mobile_no"] != undefined) {
        if (flag == true) {
            sql_fetch += " and mobile_no=" + SqlString.escape(obj["mobile_no"])

        } else {
            sql_fetch += " where mobile_no=" + SqlString.escape(obj["mobile_no"])

        }

    }

    if (obj["payment_status"] != undefined) {
        if (flag == true) {
            sql_fetch += " and payment_status=" + SqlString.escape(obj["payment_status"])

        } else {
            sql_fetch += " where payment_status=" + SqlString.escape(obj["payment_status"])

        }

    }
    if (obj["nic_tender_id"] != undefined) {
        if (flag == true) {
            sql_fetch += " and nic_tender_id=" + SqlString.escape(obj["nic_tender_id"])

        } else {
            sql_fetch += " where nic_tender_id=" + SqlString.escape(obj["nic_tender_id"])

        }

    }

    mysqlPool.query(sql_fetch, function (error2, results) {
        if (error2) {
            console.log("Error-->routes-->eng-->tenderApplications-->getTenderApplications", error2)
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

router.put('/updateTenderApplication', (req, res) => {
    let objectToSend = {}
    let obj = req.body

    let mobile_no = SqlString.escape(obj["mobile_no"])

    let id = SqlString.escape(obj["id"])
    let b_acct_id = obj["b_acct_id"]
    let svayam_tender_id = SqlString.escape(obj["svayam_tender_id"])
    let firm_name = SqlString.escape(obj["firm_name"])
    let challan_no = SqlString.escape(obj["challan_no"])
    let payment_date = SqlString.escape(obj["payment_date"])
    let payment_mode = SqlString.escape(obj["payment_mode"])
    let payment_status = SqlString.escape(obj["payment_status"])
    let challan_creation_date = SqlString.escape(obj["challan_creation_date"])
    let emd_fee = SqlString.escape(obj["emd_fee"])
    let emd_payment_status = SqlString.escape(obj["emd_payment_status"])
    let emd_payment_date = SqlString.escape(obj["emd_payment_date"])
    let tender_fee = SqlString.escape(obj["tender_fee"])
    let update_user_id = SqlString.escape(obj["update_user_id"])
    let emd_challan_creation_date = SqlString.escape(obj["emd_challan_creation_date"])
    let update_timestamp = SqlString.escape(moment().format('YYYY-MM-DD HH:mm:ss'))

    let db = "svayam_" + b_acct_id + "_eng"
   
    let sql_upd = "update " + db + ".tender_application set challan_creation_date=" + challan_creation_date + ",mobile_no=" + mobile_no + ",svayam_tender_id=" + svayam_tender_id + ",firm_name=" + firm_name + ",challan_no=" + challan_no + ",payment_date=" + payment_date + ",payment_mode=" + payment_mode + ","
        + "payment_status=" + payment_status + ",tender_fee=" + tender_fee + ",update_user_id=" + update_user_id
        + ",emd_fee=" + emd_fee + ",emd_payment_status=" + emd_payment_status + ",emd_payment_date=" + emd_payment_date+",emd_challan_creation_date ="+emd_challan_creation_date
        + ",update_timestamp=" + update_timestamp + " where id=" + id

    mysqlPool.query(sql_upd, function (error2, results) {
        if (error2) {
            console.log("Error-->routes-->eng-->tenderApplication-->updateTenderApplication", error2)
            objectToSend["error"] = true;
            objectToSend["data"] = "Some error occured at server Side. Please try again later"
            res.send(objectToSend)

        } else {
            objectToSend["error"] = false;
            objectToSend["data"] = "Application updated Successfully"
            res.send(objectToSend)
        }

    })


})




router.delete('/deleteTenderApplication:dtls', (req, res) => {
    let objectToSend = {}
    let obj = JSON.parse(req.params.dtls)


    let id = SqlString.escape(obj["id"])
    let b_acct_id = obj["b_acct_id"]

    let db = "svayam_" + b_acct_id + "_eng"

    let sql = "delete from " + db + ".tender_application  where id=" + id



    mysqlPool.getConnection(function (error, mysqlCon) {

        if (error) {
            console.log("Error-->routes-->eng-->tenderApplication-->deleteTenderApplication", error);
            objectToSend["error"] = true;
            objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
            res.send(objectToSend)
        } else {
            mysqlCon.beginTransaction(function (error1) {
                if (error1) {
                    console.log("Error-->routes-->eng-->tenderApplication-->deleteTenderApplication", error1);
                    objectToSend["error"] = true;
                    objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
                    res.send(objectToSend)
                    mysqlCon.release()
                } else {
                    mysqlCon.query(sql, function (error2, results2) {
                        if (error2) {
                            console.log("Error-->routes-->eng-->tenderApplication-->deleteTenderApplication", error2);
                            objectToSend["error"] = true;
                            objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
                            res.send(objectToSend)
                            mysqlCon.rollback();
                            mysqlCon.release()
                        } else {

                            mysqlCon.commit(function (error3) {
                                if (error3) {
                                    console.log("Error-->routes-->eng-->tenderApplication-->deleteTenderApplication", error3);
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


module.exports = router;