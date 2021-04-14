var express = require('express');
var router = express.Router();
var SqlString = require('sqlstring');
var propObj = require('../../config_con.js')
let mysqlPool = require('../../connections/mysqlConnection.js');
var moment = require('moment')
router.get('/getAllcancelled:dtls', (req, res) => {

    let objectToSend = {}

    let obj = JSON.parse(req.params.dtls);


    let db = "svayam_" + obj.b_acct_id + "_property";

    let sql_fetchCurr = "SELECT pro.property_status,pro.property_no,pty.property_type_code,ppi.party_name,ppi.party_id,ppi.party_email,ppi.party_phone_no,ppi.party_dob,arr.id,"
        + " arr.property_type_id,arr.scheme_code,arr.sub_scheme_code,arr.property_id ,"
        + " arr.application_amount,arr.application_challan_no,DATE_FORMAT( arr_effective_date,'%Y-%m-%d') as arr_effective_date FROM (SELECT * FROM  "
        + db + ".arrangement_info WHERE scheme_code =" + SqlString.escape(obj.scheme_code) + " "
        + "   and sub_scheme_code=" + SqlString.escape(obj.sub_scheme_code) + " AND arr_type_code ='ALLOTTED' AND arr_status_code='CANCELLED' )arr"
        + " JOIN " + db + ".party_info ppi ON ppi.party_id=arr.party_id"
 +" join " + db + ".property_info pro on arr.property_id=pro.property_id "
    +" join " + db + ".property_type_info pty on arr.property_type_id=pty.property_type_id"

    mysqlPool.query(sql_fetchCurr, function (error, results) {
        if (error) {
            console.log("Error-->routes-->property-->restore-->getAllcancelled", error)
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


router.put('/restoreAtCurrentRate', (req, res) => {
    let obj = req.body;

    let objectToSend = {}
    let db = "svayam_" + obj.b_acct_id + "_property";
    let update_timestamp = SqlString.escape(moment().format('YYYY-MM-DD HH:mm:ss'))

    let sql_update = "update " + db + ".arrangement_info set arr_status_code='ALLOTTED',update_timestamp="+update_timestamp
    +",update_user_id="+SqlString.escape(obj.update_user_id)+" where party_id="+SqlString.escape(obj.party_id)
    +" AND arr_type_code='ALLOTTED'"
    let emi_update = "update  " + db + ".party_emi set pay_status='ACTIVE',update_timestamp="+update_timestamp
    +",update_user_id="+SqlString.escape(obj.update_user_id)+" where party_id="+SqlString.escape(obj.party_id)
    +" AND pay_status='INACTIVE'"
    let property_update = "update " + db + ".property_info set  property_status='ALLOTTED',update_timestamp="+update_timestamp
    +",update_user_id="+SqlString.escape(obj.update_user_id)+" where property_id="+SqlString.escape(obj.property_id)
    
        
    mysqlPool.getConnection(function (error, mysqlCon) {
        if (error) {
            console.log("Error-->routes-->property-->restore-->restoreAtCurrentRate--", error)
            objectToSend["error"] = true
            objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
            res.send(objectToSend);
        } else {
            mysqlCon.beginTransaction(function (error4) {
                if (error4) {
                    console.log("Error-->routes-->property-->restore-->restoreAtCurrentRate--", error4)
                    objectToSend["error"] = true
                    objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
                    res.send(objectToSend);
                    mysqlCon.release();
                } else {
                    mysqlCon.query(sql_update+";"+emi_update+";"+property_update, function (error1, results) {
                        if (error1) {
                            console.log("Error-->routes-->property-->restore-->restoreAtCurrentRate--", error1)
                            objectToSend["error"] = true;
                            objectToSend["data"] = "Some error occured at server Side. Please try again later"
                            res.send(objectToSend)
                            mysqlCon.rollback();
                            mysqlCon.release()
                        } else {



                            mysqlCon.query('COMMIT', function (error2) {
                                if (error2) {
                                    console.log("Error-->routes-->property-->restore-->restoreAtCurrentRate--", error2)
                                    objectToSend["error"] = true;
                                    objectToSend["data"] = "Some error occured at server Side. Please try again later"
                                    res.send(objectToSend)
                                    mysqlCon.rollback();
                                    mysqlCon.release()
                                } else {
                                    objectToSend["error"] = false;
                                    objectToSend["data"] ='Restore Successfully!'
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


router.get('/getAllPaymentType:dtls', (req, res) => {

    let objectToSend = {}

    let obj = JSON.parse(req.params.dtls);


    let db = "svayam_" + obj.b_acct_id + "_property";

    let sql_fetchCurr =   "SELECT DISTINCT payment_type FROM " + db + ".property_type_cost WHERE property_type_id="+SqlString.escape(obj.property_type_id)

    mysqlPool.query(sql_fetchCurr, function (error, results) {
        if (error) {
            console.log("Error-->routes-->property-->restore-->getAllPaymentType", error)
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

router.post('/restoreAtNewRate', (req, res) => {
    let obj = req.body;

    let objectToSend = {}
    let db = "svayam_" + obj.b_acct_id + "_property";
    let update_timestamp = SqlString.escape(moment().format('YYYY-MM-DD HH:mm:ss'))


    let sql = "SELECT  * FROM " + db + ".property_type_cost WHERE property_type_id=" + SqlString.escape(obj.property_type_id) + " AND payment_type=" + SqlString.escape(obj.payment_type)

    mysqlPool.getConnection(function (error, mysqlCon) {
        if (error) {
            console.log("Error-->routes-->property-->restore-->restoreAtNewRate--", error)
            objectToSend["error"] = true
            objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
            res.send(objectToSend);
        } else {
            mysqlCon.beginTransaction(function (error4) {
                if (error4) {
                    console.log("Error-->routes-->property-->restore-->restoreAtNewRate--", error4)
                    objectToSend["error"] = true
                    objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
                    res.send(objectToSend);
                    mysqlCon.release();
                } else {
                    mysqlCon.query(sql, function (error15, results1) {
                        if (error15) {
                            console.log("Error-->routes-->property-->restore-->restoreAtNewRate--", error15)
                            objectToSend["error"] = true;
                            objectToSend["data"] = "Some error occured at server Side. Please try again later"
                            res.send(objectToSend)
                            mysqlCon.rollback();
                            mysqlCon.release()
                        } else {
                            let data = results1
                            let sql_update = "update  " + db + ".arrangement_info set arr_status_code='ALLOTTED',update_timestamp=" + update_timestamp
                                + ",update_user_id=" + SqlString.escape(obj.update_user_id) + " where party_id=" + SqlString.escape(obj.party_id)
                                + " AND arr_type_code='ALLOTTED'"

                            let property_update = "update " + db + ".property_info set property_status='ALLOTTED',update_timestamp=" + update_timestamp
                                + ",update_user_id=" + SqlString.escape(obj.update_user_id) + " where property_id=" + SqlString.escape(obj.property_id)

                            let emi_insert = "insert into " + db + ".party_emi (party_id,property_type_cost_id,amount,scheme_code,"
                                + "sub_scheme_code,pay_status,create_user_id,create_timestamp) values"

                            for (let i = 0; i < data.length; i++) {
                                emi_insert += "(" + SqlString.escape(obj.party_id) + "," + SqlString.escape(data[i]['property_type_cost_id']) + ","
                                    + SqlString.escape(data[i]['payment_amount']) + "," + SqlString.escape(obj.scheme_code) + ","
                                    + SqlString.escape(obj.sub_scheme_code) + ",'ACTIVE'," + SqlString.escape(obj.update_user_id) + ","
                                    + update_timestamp + ")"
                                if (i < data.length - 1) {
                                    emi_insert += ","
                                }
                            }

                            mysqlCon.query(sql_update + ";" + emi_insert + ";" + property_update, function (error1, results) {
                                if (error1) {
                                    console.log("Error-->routes-->property-->restore-->restoreAtNewRate--", error1)
                                    objectToSend["error"] = true;
                                    objectToSend["data"] = "Some error occured at server Side. Please try again later"
                                    res.send(objectToSend)
                                    mysqlCon.rollback();
                                    mysqlCon.release()
                                } else {



                                    mysqlCon.query('COMMIT', function (error2) {
                                        if (error2) {
                                            console.log("Error-->routes-->property-->restore-->restoreAtNewRate--", error2)
                                            objectToSend["error"] = true;
                                            objectToSend["data"] = "Some error occured at server Side. Please try again later"
                                            res.send(objectToSend)
                                            mysqlCon.rollback();
                                            mysqlCon.release()
                                        } else {
                                            objectToSend["error"] = false;
                                            objectToSend["data"] = 'Restore Successfully!'
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
module.exports = router;
