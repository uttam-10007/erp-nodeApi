var express = require('express');
var router = express.Router();
var SqlString = require('sqlstring');
var propObj = require('../../config_con.js')
let mysqlPool = require('../../connections/mysqlConnection.js');
var moment = require('moment')





router.get('/getdataforgeneraterefund:dtls', (req, res) => {

    let objectToSend = {}

    let obj = JSON.parse(req.params.dtls);


    let db = "svayam_" + obj.b_acct_id + "_property";

    let sql_fetchCurr =  "SELECT ppi.party_name,ppi.party_id,ppi.party_email,ppi.party_phone_no,ppi.party_dob,ppi.party_acct_no,ppi.party_bank_name, "
    +" ppi.party_branch_name,ppi.party_ifsc_code,arr.application_amount,arr.application_challan_no FROM "
    +"(SELECT * FROM  "+db+".arrangement_info WHERE scheme_code = "+SqlString.escape(obj.scheme_code)+" and sub_scheme_code="
    +SqlString.escape(obj.sub_scheme_code)+" AND arr_type_code ='APPLIED' and arr_status_code = 'APPLICATION_APPROVED' and party_id not in(select party_id FROM "+db+".arrangement_info where scheme_code = "
    +SqlString.escape(obj.scheme_code)+" AND sub_scheme_code="+SqlString.escape(obj.sub_scheme_code)+" AND (arr_status_code ='ALLOTTED' or arr_status_code='ALLOTMENT_PENDING') )) arr"
    +" JOIN "+db+".party_info ppi ON ppi.party_id=arr.party_id"

    mysqlPool.query(sql_fetchCurr, function (error, results) {
        if (error) {
            console.log("Error-->routes-->property-->refund-->getdataforgeneraterefund--", error)
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
router.post('/generaterefund', (req, res) => {
    let obj = req.body
    let db = "svayam_" + obj.b_acct_id + "_property";

    let objectToSend = {}
    let update_timestamp = SqlString.escape(moment().format('YYYY-MM-DD HH:mm:ss'))
    let party_id=obj.party_id
    let update_user_id= SqlString.escape(obj.update_user_id) 
    
    let sql_insert = "update "+db+".arrangement_info set application_amt_refund_status='DONE',arr_status_code ='REFUNDED',update_user_id="
    +update_user_id+",update_timestamp="+update_timestamp+" where party_id in ('"+party_id.join("','")+"') and arr_type_code ='APPLIED'" 

    mysqlPool.getConnection(function (error, mysqlCon) {
        if (error) {
            console.log("Error-->routes-->property-->refund-->generaterefund", error)
            objectToSend["error"] = true
            objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
            res.send(objectToSend);
        } else {
            mysqlCon.beginTransaction(function (error1) {
                if (error1) {
                    console.log("Error-->routes-->property-->refund-->generaterefund", error1)
                    objectToSend["error"] = true
                    objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
                    res.send(objectToSend);
                    mysqlCon.release();
                } else {
                    mysqlCon.query(sql_insert, function (error, results) {
                        if (error) {
                            console.log("Error-->routes-->property-->refund-->generaterefund", error)
                            objectToSend["error"] = true;
                            objectToSend["data"] = "Some error occured at server Side. Please try again later"
                            res.send(objectToSend)
                            mysqlCon.rollback();
                            mysqlCon.release()
                        } else {

                            mysqlCon.query('COMMIT', function (error2) {
                                if (error2) {
                                    console.log("Error-->routes-->property-->refund-->generaterefund", error2)
                                    objectToSend["error"] = true;
                                    objectToSend["data"] = "Some error occured at server Side. Please try again later"
                                    res.send(objectToSend)
                                    mysqlCon.rollback();
                                    mysqlCon.release()
                                } else {
                                    objectToSend["error"] = false;
                                    objectToSend["data"] = "Refunded Successfully"
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

router.get('/getrefunds:dtls', (req, res) => {

    let objectToSend = {}

    let obj = JSON.parse(req.params.dtls);


    let db = "svayam_" + obj.b_acct_id + "_property";

    let sql_fetchCurr = "SELECT ppi.party_name,ppi.party_id,ppi.party_email,ppi.party_phone_no,ppi.party_dob,ppi.party_acct_no,ppi.party_bank_name, "
    +" ppi.party_branch_name,ppi.party_ifsc_code,arr.application_amount,arr.application_challan_no FROM "
    +"(SELECT * FROM  "+db+".arrangement_info WHERE scheme_code = "+SqlString.escape(obj.scheme_code)+" and sub_scheme_code="
    +SqlString.escape(obj.sub_scheme_code)+" AND arr_type_code ='APPLIED' and arr_status_code = 'REFUNDED') arr"
    +" JOIN "+db+".party_info ppi ON ppi.party_id=arr.party_id"
    mysqlPool.query(sql_fetchCurr, function (error, results) {
        if (error) {
            console.log("Error-->routes-->property-->refund-->getrefunds--", error)
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



// router.put('/updatepaymentstatus', (req, res) => {
//     let obj = req.body
//     let db = "svayam_" + obj.b_acct_id + "_property";
//     let update_timestamp = SqlString.escape(moment().format('YYYY-MM-DD HH:mm:ss'))

//     let objectToSend = {}
//     var today = new Date();
//     var date = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
//     let sql = "update " + db + ".refund set "
//     +"update_user_id=" + SqlString.escape(obj.update_user_id) +","
//     +"update_timestamp=" + update_timestamp +","
//     +"payment_date=" + SqlString.escape(date) +",payment_status='REFUNDED' where refund_id in ( " + obj.refund_id.join() + " ) ;"

    

//     mysqlPool.getConnection(function (error, mysqlCon) {
//         if (error) {
//             console.log("Error-->routes-->property-->updatepaymentstatus", error)
//             objectToSend["error"] = true
//             objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
//             res.send(objectToSend);
//         } else {
//             mysqlCon.beginTransaction(function (error1) {
//                 if (error1) {
//                     console.log("Error-->routes-->property-->updatepaymentstatus", error1)
//                     objectToSend["error"] = true
//                     objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
//                     res.send(objectToSend);
//                     mysqlCon.release();
//                 } else {
//                     mysqlCon.query(sql, function (error, results) {
//                         if (error) {
//                             console.log("Error-->routes-->property-->updatepaymentstatus", error)
//                             objectToSend["error"] = true;
//                             objectToSend["data"] = "Some error occured at server Side. Please try again later"
//                             res.send(objectToSend)
//                             mysqlCon.rollback();
//                             mysqlCon.release()
//                         } else {

//                             mysqlCon.query('COMMIT', function (error2) {
//                                 if (error2) {
//                                     console.log("Error-->routes-->property-->updatepaymentstatus", error2)
//                                     objectToSend["error"] = true;
//                                     objectToSend["data"] = "Some error occured at server Side. Please try again later"
//                                     res.send(objectToSend)
//                                     mysqlCon.rollback();
//                                     mysqlCon.release()
//                                 } else {
//                                     objectToSend["error"] = false;
//                                     objectToSend["data"] = "Updated Successfully"
//                                     res.send(objectToSend)
//                                 }

//                             })

//                         }
//                     })
//                 }
//             })
//         }


//     })


// })


// router.put('/updaterefund', (req, res) => {
//     let obj = req.body
//     let db = "svayam_" + obj.b_acct_id + "_property";
//     let update_timestamp = SqlString.escape(moment().format('YYYY-MM-DD HH:mm:ss'))

//     let objectToSend = {}

//     let sql = "update " + db + ".refund set "
//     +"txn_amt=" + SqlString.escape(obj.txn_amt)+ ","
//     +"payment_status=" + SqlString.escape(obj.payment_status) + ","
//     +"update_user_id=" + SqlString.escape(obj.update_user_id) +","
//     +"update_timestamp=" + update_timestamp +","
//     +"party_name=" + SqlString.escape(obj.party_name) + ","
//     +"party_bank_name=" + SqlString.escape(obj.party_bank_name) + ","
//     +"party_branch_name=" + SqlString.escape(obj.party_branch_name) + ","
//     +"party_ifsc_code=" + SqlString.escape(obj.party_ifsc_code) + ","
//     +"party_account_no=" + SqlString.escape(obj.party_account_no) + ","
//     +"txn_id=" + SqlString.escape(obj.txn_id) +  " where refund_id=" + SqlString.escape(obj.refund_id) + ";"




//     mysqlPool.getConnection(function (error, mysqlCon) {
//         if (error) {
//             console.log("Error-->routes-->property-->refund-->updaterefund", error)
//             objectToSend["error"] = true
//             objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
//             res.send(objectToSend);
//         } else {
//             mysqlCon.beginTransaction(function (error1) {
//                 if (error1) {
//                     console.log("Error-->routes-->property-->refund-->updaterefund", error1)
//                     objectToSend["error"] = true
//                     objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
//                     res.send(objectToSend);
//                     mysqlCon.release();
//                 } else {
//                     mysqlCon.query(sql, function (error, results) {
//                         if (error) {
//                             console.log("Error-->routes-->property-->refund-->updaterefund", error)
//                             objectToSend["error"] = true;
//                             objectToSend["data"] = "Some error occured at server Side. Please try again later"
//                             res.send(objectToSend)
//                             mysqlCon.rollback();
//                             mysqlCon.release()
//                         } else {

//                             mysqlCon.query('COMMIT', function (error2) {
//                                 if (error2) {
//                                     console.log("Error-->routes-->property-->refund-->updaterefund", error2)
//                                     objectToSend["error"] = true;
//                                     objectToSend["data"] = "Some error occured at server Side. Please try again later"
//                                     res.send(objectToSend)
//                                     mysqlCon.rollback();
//                                     mysqlCon.release()
//                                 } else {
//                                     objectToSend["error"] = false;
//                                     objectToSend["data"] = "Updated Successfully"
//                                     res.send(objectToSend)
//                                 }

//                             })

//                         }
//                     })
//                 }
//             })
//         }


//     })






// })

module.exports = router;










module.exports = router;
