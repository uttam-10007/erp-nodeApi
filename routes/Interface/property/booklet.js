var express = require('express');
var router = express.Router();
var SqlString = require('sqlstring');
var propObj = require('../../../config_con')
let mysqlPool = require('../../../connections/mysqlConnection');
var moment=require('moment')

router.get('/getpartyinfo:dtls', (req, res) => {

    let objectToSend = {}

    let obj = JSON.parse(req.params.dtls);


    let db = "svayam_" + obj.b_acct_id + "_property";

    let sql_fetchCurr = "SELECT pr.party_id,pr.party_name,pr.party_email,pr.party_phone_no,DATE_FORMAT(pr.party_dob,'%Y-%m-%d') as party_dob,"
        + " pr.party_father_name,pr.party_permanent_addr_line,pr.party_permanent_addr_city,pr.party_permanent_addr_state,"
        + " pr.party_permanent_addr_pin_code,pr.party_current_addr_line,pr.party_current_addr_city,pr.party_current_addr_state,pr.vertical_reservation,"
        + " pr.party_current_addr_pin_code,pr.party_pan_no,party_aadhar_no,pr.party_gst_no,pr.create_timestamp,pr.update_timestamp"
        + " FROM  " + db + ".party_info  pr "

    if (obj.party_id != undefined) {
        sql_fetchCurr += " where party_id=" + SqlString.escape(obj.party_id)
    }

    mysqlPool.query(sql_fetchCurr, function (error, results) {
        if (error) {
            console.log("Error-->routes-->interface-->property-->booklet-->getpartyinfo", error)
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




router.get('/getBookLetPurchase:dtls', (req, res) => {

    let objectToSend = {}

    let obj = JSON.parse(req.params.dtls);


    let db = "svayam_" + obj.b_acct_id + "_property";

    let sql_fetchCurr = "SELECT arr.*,DATE_FORMAT(tx.txn_date,'%Y-%m-%d') as txn_date,tx.txn_amt,tx.challan_id "
   +" FROM (SELECT * from " + db + ".arrangement WHERE party_id="+obj.party_id+" AND arr_type_code='BOOKPURCHASE') arr JOIN " + db + ".txn tx "
   +" ON arr.arr_id=tx.arr_id AND arr.arr_type_code=tx.arr_type_code "

    

    mysqlPool.query(sql_fetchCurr, function (error, results) {
        if (error) {
            console.log("Error-->routes-->interface-->property-->booklet-->getBookLetPurchase", error)
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


router.post('/createparty', (req, res) => {
    let obj = req.body;

    let objectToSend = {}
    let db = "svayam_" + obj.b_acct_id + "_property";
    let create_timestamp = SqlString.escape(moment().format('YYYY-MM-DD HH:mm:ss'))

    let sql_insert = "insert into " + db + ".party_info (party_name,party_email,party_phone_no,party_dob,"
        + "party_father_name,party_permanent_addr_line,party_permanent_addr_city,party_permanent_addr_state,"
        + "party_permanent_addr_pin_code,party_current_addr_line,party_current_addr_city,party_current_addr_state,"
        + "party_current_addr_pin_code,party_aadhar_no,create_timestamp,vertical_reservation) values"
        + " (" + SqlString.escape(obj.party_name) + "," + SqlString.escape(obj.party_email) + "," + SqlString.escape(obj.party_phone_no) + ","
        + SqlString.escape(obj.party_dob) + "," + SqlString.escape(obj.party_father_name) + "," + SqlString.escape(obj.party_permanent_addr_line) + ","
        + SqlString.escape(obj.party_permanent_addr_city) + "," + SqlString.escape(obj.party_permanent_addr_state) + ","
        + SqlString.escape(obj.party_permanent_addr_pin_code) + "," + SqlString.escape(obj.party_current_addr_line) + ","
        + SqlString.escape(obj.party_current_addr_city) + "," + SqlString.escape(obj.party_current_addr_state) + "," + SqlString.escape(obj.party_current_addr_pin_code) + ","
        + SqlString.escape(obj.party_aadhar_no) + "," 
         + create_timestamp + ","  + SqlString.escape(obj.vertical_reservation) + " "+ ") "
    mysqlPool.getConnection(function (error, mysqlCon) {
        if (error) {
            console.log("Error-->routes-->interface-->property-->booklet-->createparty--", error)
            objectToSend["error"] = true
            objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
            res.send(objectToSend);
        } else {
            mysqlCon.beginTransaction(function (error4) {
                if (error4) {
                    console.log("Error-->routes-->interface-->property-->booklet-->createparty--", error4)
                    objectToSend["error"] = true
                    objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
                    res.send(objectToSend);
                    mysqlCon.release();
                } else {
                    mysqlCon.query(sql_insert, function (error1, results) {
                        if (error1) {
                            console.log("Error-->routes-->interface-->property-->booklet-->createparty--", error1)
                            objectToSend["error"] = true;
                            objectToSend["data"] = "Some error occured at server Side. Please try again later"
                            res.send(objectToSend)
                            mysqlCon.rollback();
                            mysqlCon.release()
                        } else {



                            mysqlCon.query('COMMIT', function (error2) {
                                if (error2) {
                                    console.log("Error-->routes-->interface-->property-->booklet-->createparty--", error2)
                                    objectToSend["error"] = true;
                                    objectToSend["data"] = "Some error occured at server Side. Please try again later"
                                    res.send(objectToSend)
                                    mysqlCon.rollback();
                                    mysqlCon.release()
                                } else {
                                    objectToSend["error"] = false;
                                    objectToSend["data"] = results.insertId
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



router.post('/bookletpurchase', (req, res) => {
    let obj = req.body;

    let objectToSend = {}
    let db = "svayam_" + obj.b_acct_id + "_property";
    let create_timestamp = SqlString.escape(moment().format('YYYY-MM-DD HH:mm:ss'))

    let sql_insert = "insert into " + db + ".arrangement( arr_status_code,arr_type_code,arr_effective_date,party_id,scheme_code,sub_scheme_code,create_timestamp) values"
    + " ( 'BOOKLET_PURCHASE_PENDING', 'BOOKPURCHASE' ," + SqlString.escape(obj.txn_date) + "," + SqlString.escape(obj.party_id) + "," + SqlString.escape(obj.scheme_code) + "," + SqlString.escape(obj.sub_scheme_code) + ","  + create_timestamp+ ") "

    mysqlPool.getConnection(function (error, mysqlCon) {
        if (error) {
            console.log("Error-->routes-->interface-->property-->booklet-->bookletpurchase", error)
            objectToSend["error"] = true
            objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
            res.send(objectToSend);
        } else {
            mysqlCon.beginTransaction(function (error4) {
                if (error4) {
                    console.log("Error-->routes-->interface-->property-->booklet-->bookletpurchase", error4)
                    objectToSend["error"] = true
                    objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
                    res.send(objectToSend);
                    mysqlCon.release();
                } else {
                    mysqlCon.query(sql_insert, function (error1, results) {
                        if (error1) {
                            console.log("Error-->routes-->interface-->property-->booklet-->bookletpurchase", error1)
                            objectToSend["error"] = true;
                            objectToSend["data"] = "Some error occured at server Side. Please try again later"
                            res.send(objectToSend)
                            mysqlCon.rollback();
                            mysqlCon.release()
                        } else {
                            arr_id = results.insertId

                            let sql_insert3 = "insert into " + db + ".txn(arr_id,arr_type_code,txn_amt,txn_mode_code,txn_date,challan_id,txn_gateway_id,txn_desc,acct_head_code,txn_entry_type_code,create_timestamp) values"
                            + " (" + SqlString.escape(arr_id) + ",  'BOOKPURCHASE' ," + SqlString.escape(obj.txn_amt) + ","
                             + " 'CHALLAN' ," + SqlString.escape(obj.txn_date) + "," + SqlString.escape(obj.challan_id) + ","
                             + SqlString.escape(obj.txn_gateway_id) + ", 'Book Purchase' , 'BOOKPURCHASE' , 'Manual',"  + create_timestamp+" ) "


                           
                            mysqlCon.query(sql_insert3, function (error3, results3) {
                                if (error3) {
                                    console.log("Error-->routes-->interface-->property-->booklet-->bookletpurchase", error3)
                                    objectToSend["error"] = true;
                                    objectToSend["data"] = "Some error occured at server Side. Please try again later"
                                    res.send(objectToSend)
                                    mysqlCon.rollback();
                                    mysqlCon.release()
                                }
                                else {


                                    mysqlCon.query('COMMIT', function (error2) {
                                        if (error2) {
                                            console.log("Error-->routes-->interface-->property-->booklet-->bookletpurchase", error2)
                                            objectToSend["error"] = true;
                                            objectToSend["data"] = "Some error occured at server Side. Please try again later"
                                            res.send(objectToSend)
                                            mysqlCon.rollback();
                                            mysqlCon.release()
                                        } else {
                                            objectToSend["error"] = false;
                                            objectToSend["data"] = arr_id
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



router.get('/getReservationCategories:dtls', (req, res) => {

    let objectToSend = {}

    let b_acct_id = req.params.dtls;


    let db = "svayam_" + b_acct_id + "_property";

    let sql_fetchCurr = "Select * from " + db + ".reservation_category "

    mysqlPool.query(sql_fetchCurr, function (error, results) {
        if (error) {
            console.log("Error-->routes-->interface-->property-->booklet-->getVerticalReservationCategories--", error)
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

router.post('/bookletpurchaseNewold', (req, res) => {
    let obj = req.body;
let b_acct_id=obj.b_acct_id
    let objectToSend = {}
    let db = "svayam_" + obj.b_acct_id + "_property";
    let create_timestamp = SqlString.escape(moment().format('YYYY-MM-DD HH:mm:ss'))


    let partyQuery = "insert into " + db + ".party_info (party_name,party_email,party_phone_no,party_dob,"
        + "party_father_name,party_permanent_addr_line,party_permanent_addr_city,party_permanent_addr_state,"
        + "party_permanent_addr_pin_code,party_current_addr_line,party_current_addr_city,party_current_addr_state,"
        + "party_current_addr_pin_code,party_aadhar_no,create_timestamp,vertical_reservation) values"
        + " (" + SqlString.escape(obj.party_name) + "," + SqlString.escape(obj.party_email) + "," + SqlString.escape(obj.party_phone_no) + ","
        + SqlString.escape(obj.party_dob) + "," + SqlString.escape(obj.party_father_name) + "," + SqlString.escape(obj.party_permanent_addr_line) + ","
        + SqlString.escape(obj.party_permanent_addr_city) + "," + SqlString.escape(obj.party_permanent_addr_state) + ","
        + SqlString.escape(obj.party_permanent_addr_pin_code) + "," + SqlString.escape(obj.party_current_addr_line) + ","
        + SqlString.escape(obj.party_current_addr_city) + "," + SqlString.escape(obj.party_current_addr_state) + "," + SqlString.escape(obj.party_current_addr_pin_code) + ","
        + SqlString.escape(obj.party_aadhar_no) + ","
        + create_timestamp + "," + SqlString.escape(obj.vertical_reservation) + ") "





    mysqlPool.getConnection(function (error, mysqlCon) {
        if (error) {
            console.log("Error-->routes-->interface-->property-->booklet-->bookletpurchaseNew", error)
            objectToSend["error"] = true
            objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
            res.send(objectToSend);
        } else {
            mysqlCon.beginTransaction(function (error4) {
                if (error4) {
                    console.log("Error-->routes-->interface-->property-->booklet-->bookletpurchaseNew", error4)
                    objectToSend["error"] = true
                    objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
                    res.send(objectToSend);
                    mysqlCon.release();
                } else {
                    mysqlCon.query(partyQuery, function (error1, results) {
                        if (error1) {
                            console.log("Error-->routes-->interface-->property-->booklet-->bookletpurchaseNew", error1)
                            objectToSend["error"] = true;
                            objectToSend["data"] = "Some error occured at server Side. Please try again later"
                            res.send(objectToSend)
                            mysqlCon.rollback();
                            mysqlCon.release()
                        } else {
                            let party_id = results.insertId


                            let accountParty = "insert into svayam_" + b_acct_id + "_account.party_info(party_id,party_legal_name,party_origination_source_code,party_phone_no,"
                                + "party_email,party_addr_line1,party_local_no,create_timestamp) values "
                                + "('PRO" + party_id + "'," + SqlString.escape(obj.party_name) + ",'PRO'," + SqlString.escape(obj.party_phone_no) + "," + SqlString.escape(obj.party_email) + ","
                                + SqlString.escape(obj.party_current_addr_line) + "," + SqlString.escape(party_id) + "," + create_timestamp + ")"




                            mysqlCon.query(accountParty, function (error21, results21) {
                                if (error21) {
                                    console.log("Error-->routes-->interface-->property-->booklet-->bookletpurchaseNew", error21)
                                    objectToSend["error"] = true;
                                    objectToSend["data"] = "Some error occured at server Side. Please try again later"
                                    res.send(objectToSend)
                                    mysqlCon.rollback();
                                    mysqlCon.release()
                                }
                                else {
                                    let amount = SqlString.escape(obj["amount"])
                                    let challan_generate_date = SqlString.escape(moment().format('YYYY-MM-DD'))
                                    let challan_status = SqlString.escape(obj["challan_status"])
                                    let challan_ref = SqlString.escape(obj["challan_ref"])
                                    let challan_source = SqlString.escape(obj["challan_source"])
                                    let challan_type = SqlString.escape(obj["challan_type"]);
                                    let challan_recieve = SqlString.escape(obj['challan_recieve']);


                                    let createChallan = "insert into svayam_" + b_acct_id + "_account.dummy_challan_info (party_id,party_name,party_phone_no,party_email,amount,challan_generate_date,"
                                        + "challan_status,challan_ref,challan_source,challan_type,challan_recieve,create_timestamp) values"
                                        + "('PRO" + party_id + "'," + SqlString.escape(obj.party_name) + "," + SqlString.escape(obj.party_phone_no) + "," + SqlString.escape(obj.party_email) + "," + amount + "," + challan_generate_date + "," + challan_status + "," + challan_ref
                                        + "," + challan_source + "," + challan_type + "," + challan_recieve + "," + create_timestamp + ")"

                                    mysqlCon.query(createChallan, function (error22, results22) {
                                        if (error22) {
                                            console.log("Error-->routes-->interface-->property-->booklet-->bookletpurchaseNew", error22)
                                            objectToSend["error"] = true;
                                            objectToSend["data"] = "Some error occured at server Side. Please try again later"
                                            res.send(objectToSend)
                                            mysqlCon.rollback();
                                            mysqlCon.release()
                                        }
                                        else {
                                            let challan_id = results22.insertId
                                            let createArr = "insert into " + db + ".arrangement( arr_status_code,arr_type_code,arr_effective_date,party_id,scheme_code,sub_scheme_code,create_timestamp) values"
                                                + " ( 'BOOKLET_PURCHASE_PENDING', 'BOOKPURCHASE' ," + SqlString.escape(obj.txn_date) + "," + SqlString.escape(party_id) + "," + SqlString.escape(obj.scheme_code) + "," + SqlString.escape(obj.sub_scheme_code) + "," + create_timestamp + ") "

                                            mysqlCon.query(createArr, function (error33, results33) {
                                                if (error33) {
                                                    console.log("Error-->routes-->interface-->property-->booklet-->bookletpurchaseNew", error33)
                                                    objectToSend["error"] = true;
                                                    objectToSend["data"] = "Some error occured at server Side. Please try again later"
                                                    res.send(objectToSend)
                                                    mysqlCon.rollback();
                                                    mysqlCon.release()
                                                }
                                                else {

                                                    let arr_id = results33.insertId

                                                    let sql_insert3 = "insert into " + db + ".txn(arr_id,arr_type_code,txn_amt,txn_mode_code,txn_date,challan_id,txn_gateway_id,txn_desc,acct_head_code,txn_entry_type_code,create_timestamp) values"
                                                        + " (" + SqlString.escape(arr_id) + ",  'BOOKPURCHASE' ," + SqlString.escape(obj.amount) + ","
                                                        + " 'CHALLAN' ," + SqlString.escape(obj.txn_date) + "," + SqlString.escape(challan_id) + ","
                                                        + SqlString.escape(obj.txn_gateway_id) + ", 'Book Purchase' , 'BOOKPURCHASE' , 'Manual'," + create_timestamp + " ) "


                                                    mysqlCon.query(sql_insert3, function (error34, results34) {
                                                        if (error34) {
                                                            console.log("Error-->routes-->interface-->property-->booklet-->bookletpurchaseNew", error34)
                                                            objectToSend["error"] = true;
                                                            objectToSend["data"] = "Some error occured at server Side. Please try again later"
                                                            res.send(objectToSend)
                                                            mysqlCon.rollback();
                                                            mysqlCon.release()
                                                        }
                                                        else {
                                                            mysqlCon.query('COMMIT', function (error2) {
                                                                if (error2) {
                                                                    console.log("Error-->routes-->interface-->property-->booklet-->bookletpurchaseNew", error2)
                                                                    objectToSend["error"] = true;
                                                                    objectToSend["data"] = "Some error occured at server Side. Please try again later"
                                                                    res.send(objectToSend)
                                                                    mysqlCon.rollback();
                                                                    mysqlCon.release()
                                                                } else {
                                                                    var oo=new Object
                                                                    oo['arr_id']=arr_id
                                                                    oo['challan_id']=challan_id

                                                                    objectToSend["error"] = false;
                                                                    objectToSend["data"] = oo
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

                        }
                    })
                }
            })
        }


    })
})

router.post('/bookletpurchaseNew', (req, res) => {
    let obj = req.body;
    let objectToSend = {}
    let db = "svayam_" + obj.b_acct_id + "_property";
    let create_user_id=obj.create_user_id;
    let create_timestamp = SqlString.escape(moment().format('YYYY-MM-DD HH:mm:ss'))


    let partyQuery = "insert into " + db + ".party_info (party_name,party_email,party_phone_no,"
        + "party_father_or_husband_name,party_permanent_addr_line,create_user_id,create_timestamp) values"
        + " (" + SqlString.escape(obj.party_name) + "," + SqlString.escape(obj.party_email) + "," + SqlString.escape(obj.party_phone_no) + ","
        + SqlString.escape(obj.party_father_or_husband_name) + "," + SqlString.escape(obj.party_permanent_addr_line) + "," +  SqlString.escape(create_user_id) + "," + create_timestamp + ") "


    mysqlPool.getConnection(function (error, mysqlCon) {
        if (error) {
            console.log("Error-->routes-->interface-->property-->booklet-->bookletpurchaseNew", error)
            objectToSend["error"] = true
            objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
            res.send(objectToSend);
        } else {

            mysqlCon.beginTransaction(function (error4) {
                if (error4) {
                    console.log("Error-->routes-->interface-->property-->booklet-->bookletpurchaseNew", error4)
                    objectToSend["error"] = true
                    objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
                    res.send(objectToSend);
                    mysqlCon.release();
                } else {
                    mysqlCon.query(partyQuery, function (error1, results) {
                        if (error1) {
                            console.log("Error-->routes-->interface-->property-->booklet-->bookletpurchaseNew", error1)
                            objectToSend["error"] = true;
                            objectToSend["data"] = "Some error occured at server Side. Please try again later"
                            res.send(objectToSend)
                            mysqlCon.rollback();
                            mysqlCon.release()
                        } else {
                            let party_id = results.insertId;
                            let booklet_challan_no = 'PROPBP' + party_id;
                            let booklet_amount = obj.booklet_amount;

                            let sql2 = "insert into " + db + ".arrangement_info(booklet_challan_no,booklet_amount, arr_status_code,arr_type_code,arr_effective_date,party_id,scheme_code,sub_scheme_code,create_timestamp) values"
                                + " ('" + booklet_challan_no + "'," + booklet_amount + ",'BOOKLET_PURCHASE_PENDING', 'BOOKLETPURCHASE' ," + SqlString.escape(obj.arr_effective_date) + "," + SqlString.escape(party_id) + "," + SqlString.escape(obj.scheme_code) + "," + SqlString.escape(obj.sub_scheme_code) + "," + create_timestamp + ") "

                            mysqlCon.query(sql2, function (error21, results21) {
                                if (error21) {
                                    console.log("Error-->routes-->interface-->property-->booklet-->bookletpurchaseNew", error21)
                                    objectToSend["error"] = true;
                                    objectToSend["data"] = "Some error occured at server Side. Please try again later"
                                    res.send(objectToSend)
                                    mysqlCon.rollback();
                                    mysqlCon.release()
                                }
                                else {
                                    mysqlCon.query('COMMIT', function (error2) {
                                        if (error2) {
                                            console.log("Error-->routes-->interface-->property-->booklet-->bookletpurchaseNew", error2)
                                            objectToSend["error"] = true;
                                            objectToSend["data"] = "Some error occured at server Side. Please try again later"
                                            res.send(objectToSend)
                                            mysqlCon.rollback();
                                            mysqlCon.release()
                                        } else {
                                            var oo = new Object
                                            oo['applicant_id'] = party_id;
                                            oo['challan_id'] = booklet_challan_no

                                            objectToSend["error"] = false;
                                            objectToSend["data"] = oo
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

module.exports=router;
