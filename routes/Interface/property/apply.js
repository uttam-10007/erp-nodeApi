var express = require('express');
var router = express.Router();
var SqlString = require('sqlstring');
var propObj = require('../../../config_con')
let mysqlPool = require('../../../connections/mysqlConnection');
var moment=require('moment')



router.get('/getRegDetails:dtls', (req, res) => {

    let objectToSend = {}

 

    let obj = JSON.parse(req.params.dtls);


    let db = "svayam_" + obj.b_acct_id + "_property";

    let sql_fetchCurr = "Select ar.arr_type_code,ar.arr_effective_date,ar.party_id,ar.scheme_code,ar.arr_id,si.scheme_name,ss.sub_scheme_name, "
    +"ar.sub_scheme_code ,p.party_name,p.party_email,p.party_phone_no,p.party_father_name,p.vertical_reservation "
    +"FROM ( select * FROM "+db+".arrangement where arr_type_code = 'BOOKPURCHASE' AND arr_id="+obj.arr_id+" AND scheme_code="+SqlString.escape(obj.scheme_code)+" AND sub_scheme_code="+SqlString.escape(obj.sub_scheme_code)+" AND arr_status_code='BOOKLET_PURCHASED') ar "
    +"JOIN "+db+".party_info p ON ar.party_id=p.party_id  JOIN "+db+".scheme_info si ON ar.scheme_code=si.scheme_code"
    +" JOIN "+db+".sub_scheme ss ON ar.sub_scheme_code=ss.sub_scheme_code"
    mysqlPool.query(sql_fetchCurr, function (error, results) {
        if (error) {
            console.log("Error-->routes-->interface-->property-->apply-->getRegDetails--", error)
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

router.get('/getAllpropertytype:dtls', (req, res) => {

    let objectToSend = {}

    let obj = JSON.parse(req.params.dtls);


    let db = "svayam_" + obj.b_acct_id + "_property";


    let sql_fetchCurr = "SELECT distinct pr.*,pri.property_info_desc,pri.property_type,pri.property_type_code,pri.house_type_code,"
        + " pri.size,pri.total_amount FROM (SELECT DISTINCT pp.property_info_code,pp.scheme_code,pp.sub_scheme_code,"
        + " pf.reservation_category_code,pf.application_amount_percentage FROM  " + db + ".property pp  JOIN ("
        + "   SELECT DISTINCT * from  " + db + ".property_registration_fees WHERE reservation_category_code=(SELECT distinct reservation_category_code"
        + "    FROM  " + db + ".reservation_category WHERE reservation_category_code=(SELECT vertical_reservation FROM  " + db + ".party_info WHERE party_id=" + SqlString.escape(obj.party_id) + ")  "
        + "     )) pf ON pp.scheme_code=pf.scheme_code AND pp.sub_scheme_code=pf.sub_scheme_code"
        + "      WHERE pp.scheme_code=" + SqlString.escape(obj.scheme_code) + " AND pp.sub_scheme_code=" + SqlString.escape(obj.sub_scheme_code)
        + "  ) pr JOIN  " + db + ".property_info pri on  pr.property_info_code=pri.property_info_code"


       
console.log(sql_fetchCurr)
    mysqlPool.query(sql_fetchCurr, function (error, results) {
        if (error) {
            console.log("Error-->routes-->interface-->property-->apply-->getAllpropertytype--", error)
            objectToSend["error"] = true
            objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
            res.send(objectToSend);
        } else {
            objectToSend["error"] = false
            objectToSend["data"] = results
            res.send(objectToSend);
        }
    })
});



router.get('/getnomineeinfo:dtls', (req, res) => {

    let objectToSend = {}

    let obj = JSON.parse(req.params.dtls);


    let db = "svayam_" + obj.b_acct_id + "_property";

    let sql_fetchCurr = "Select * from " + db + ".nominee_info where party_id="+SqlString.escape(obj.party_id)

    mysqlPool.query(sql_fetchCurr, function (error, results) {
        if (error) {
            console.log("Error-->routes-->interface-->property-->apply-->getnomineeinfo--", error)
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

router.post('/createnomineeinfo', (req, res) => {
    let obj = req.body;

    let objectToSend = {}
    let db = "svayam_" + obj.b_acct_id + "_property";
    let create_timestamp = SqlString.escape(moment().format('YYYY-MM-DD HH:mm:ss'))

    let sql_insert = "insert into " + db + ".nominee_info (nominee_phone_no,nominee_email,nominee_name,relation_code,id_type_code,nominee_id_no,party_id,create_timestamp) values"
        + " (" + SqlString.escape(obj.nominee_phone_no) + "," + SqlString.escape(obj.nominee_email) + "," + SqlString.escape(obj.nominee_name) + "," + SqlString.escape(obj.relation_code) + "," + SqlString.escape(obj.id_type_code) + "," + SqlString.escape(obj.nominee_id_no) + "," + SqlString.escape(obj.party_id) + ","  + create_timestamp + ") "

    mysqlPool.query(sql_insert, function (error, results) {
        if (error) {
            console.log("Error-->routes-->interface-->property-->apply-->createnomineeinfo-->", error)
            objectToSend["error"] = true;
            if (error.message != undefined || error.message != null) {
                if (error.message.includes("already exists")) {
                    objectToSend["data"] = "Possible duplicates"
                } else {
                    objectToSend["data"] = "Some error occured at server Side. Please try again later"
                }
            } else {
                objectToSend["data"] = "Some error occured at server Side. Please try again later"
            }

            res.send(objectToSend)
        } else {

            objectToSend["error"] = false;
            objectToSend["data"] = results.insertId
            res.send(objectToSend)
        }
    })

})



router.get('/getaccountinfo:dtls', (req, res) => {

    let objectToSend = {}

    let obj = JSON.parse(req.params.dtls);


    let db = "svayam_" + obj.b_acct_id + "_property";

    let sql_fetchCurr = "Select * from " + db + ".account_info where party_id="+SqlString.escape(obj.party_id)


    mysqlPool.query(sql_fetchCurr, function (error, results) {
        if (error) {
            console.log("Error-->routes-->interface-->property-->apply-->getaccountinfo--", error)
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

router.post('/createaccountinfo', (req, res) => {
    let obj = req.body;

    let objectToSend = {}
    let db = "svayam_" + obj.b_acct_id + "_property";
    let create_timestamp = SqlString.escape(moment().format('YYYY-MM-DD HH:mm:ss'))

    let sql_insert = "insert into " + db + ".account_info (party_bank_name,party_branch_name,party_ifsc_code,party_account_no,party_id,create_timestamp) values"
        + " (" + SqlString.escape(obj.party_bank_name) + "," + SqlString.escape(obj.party_branch_name) + "," + SqlString.escape(obj.party_ifsc_code) + "," + SqlString.escape(obj.party_account_no) + "," + SqlString.escape(obj.party_id) + ","  + create_timestamp + ") "

    mysqlPool.query(sql_insert, function (error, results) {
        if (error) {
            console.log("Error-->routes-->property-->property_master_data-->createaccountinfo-->", error)
            objectToSend["error"] = true;
            if (error.message != undefined || error.message != null) {
                if (error.message.includes("already exists")) {
                    objectToSend["data"] = "Possible duplicates"
                } else {
                    objectToSend["data"] = "Some error occured at server Side. Please try again later"
                }
            } else {
                objectToSend["data"] = "Some error occured at server Side. Please try again later"
            }

            res.send(objectToSend)
        } else {

            objectToSend["error"] = false;
            objectToSend["data"] = results.insertId
            res.send(objectToSend)
        }
    })

})





router.post('/addApplication', (req, res) => {
    let obj = req.body;

    let objectToSend = {}
    let db = "svayam_" + obj.b_acct_id + "_property";
    let create_timestamp = SqlString.escape(moment().format('YYYY-MM-DD HH:mm:ss'))
    let txn_date=SqlString.escape(obj.txn_date)

    let sql_insert = "SELECT * FROM " + db + ".arrangement where arr_id = " + SqlString.escape(obj.arr_id) + " and  arr_type_code = 'APPLIED' limit 1"

    mysqlPool.getConnection(function (error, mysqlCon) {
        if (error) {
            console.log("Error-->routes-->property-->party_info-->addApplication", error)
            objectToSend["error"] = true
            objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
            res.send(objectToSend);
        } else {
            mysqlCon.beginTransaction(function (error4) {
                if (error4) {
                    console.log("Error-->routes-->property-->party_info-->addApplication", error4)
                    objectToSend["error"] = true
                    objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
                    res.send(objectToSend);
                    mysqlCon.release();
                } else {
                    mysqlCon.query(sql_insert, function (error1, results1) {
                        if (error1) {
                            console.log("Error-->routes-->property-->party_info-->addApplication", error1)
                            objectToSend["error"] = true;
                            objectToSend["data"] = "Some error occured at server Side. Please try again later"
                            res.send(objectToSend)
                            mysqlCon.rollback();
                            mysqlCon.release()
                        } else {
                            if (results1.length != 0) {
                                mysqlCon.query('COMMIT', function (error2) {
                                    if (error2) {
                                        console.log("Error-->routes-->property-->party_info-->addApplication", error2)
                                        objectToSend["error"] = true;
                                        objectToSend["data"] = "Some error occured at server Side. Please try again later"
                                        res.send(objectToSend)
                                        mysqlCon.rollback();
                                        mysqlCon.release()
                                    } else {
                                        objectToSend["error"] = false;
                                        objectToSend["data"] = "Already Applied from this arrangement id!"
                                        res.send(objectToSend)
                                    }

                                })

                            }
                            else {
                                let sql_insert3 = "insert into " + db + ".arrangement( arr_id,arr_type_code,arr_effective_date,party_id,scheme_code,sub_scheme_code,property_type_code,size,property_info_code,house_type_code,arr_status_code,create_timestamp) values"
                                    + " (  " + SqlString.escape(obj.arr_id) + ",'APPLIED' ," + txn_date + "," + SqlString.escape(obj.party_id) + ","
                                    + SqlString.escape(obj.scheme_code) + "," + SqlString.escape(obj.sub_scheme_code) + ","
                                    + SqlString.escape(obj.property_type_code) + "," + SqlString.escape(obj.size) + "," + SqlString.escape(obj.property_info_code) + ","
                                    + SqlString.escape(obj.house_type_code) + " , 'APPLICATION_APPROVAL_PENDING', "  + create_timestamp + ") "



                                mysqlCon.query(sql_insert3, function (error31, results3) {
                                    if (error31) {
                                        console.log("Error-->routes-->property-->party_info-->addApplication", error31)
                                        objectToSend["error"] = true;
                                        objectToSend["data"] = "Some error occured at server Side. Please try again later"
                                        res.send(objectToSend)
                                        mysqlCon.rollback();
                                        mysqlCon.release()
                                    }
                                    else {
                                        let sql_insert4 = "insert into " + db + ".txn(arr_id,arr_type_code,txn_amt,txn_mode_code,txn_date,challan_id,txn_gateway_id,txn_desc,acct_head_code,txn_entry_type_code,create_timestamp) values"
                                            + " (" + SqlString.escape(obj.arr_id) + ",  'APPLIED' ," + SqlString.escape(obj.txn_amt) + ","
                                            + " 'CHALLAN' ," + txn_date+ "," + SqlString.escape(obj.challan_id) + ","
                                            + SqlString.escape(obj.txn_gateway_id) + ", " + SqlString.escape(obj.txn_desc) + " , 'APPLIED' , 'Manual' , " + create_timestamp + ") "


                                        mysqlCon.query(sql_insert4, function (error3, results3) {
                                            if (error3) {
                                                console.log("Error-->routes-->property-->party_info-->addApplication", error3)
                                                objectToSend["error"] = true;
                                                objectToSend["data"] = "Some error occured at server Side. Please try again later"
                                                res.send(objectToSend)
                                                mysqlCon.rollback();
                                                mysqlCon.release()
                                            }
                                            else {


                                                mysqlCon.query('COMMIT', function (error2) {
                                                    if (error2) {
                                                        console.log("Error-->routes-->property-->party_info-->addApplication", error2)
                                                        objectToSend["error"] = true;
                                                        objectToSend["data"] = "Some error occured at server Side. Please try again later"
                                                        res.send(objectToSend)
                                                        mysqlCon.rollback();
                                                        mysqlCon.release()
                                                    } else {
                                                        objectToSend["error"] = false;
                                                        objectToSend["data"] = "Added Successfully"
                                                        res.send(objectToSend)
                                                    }

                                                })
                                            }
                                        })
                                    }
                                })
                            }

                        }
                    })
                }
            })
        }


    })
});






router.get('/getApplication:dtls', (req, res) => {

    let objectToSend = {}

    let obj = JSON.parse(req.params.dtls);


    let db = "svayam_" + obj.b_acct_id + "_property";
    let sql_fetchCurr = "Select pri.property_type,ar.arr_type_code,ar.sub_scheme_code,ar.create_timestamp,ar.update_timestamp,ar.create_user_id, "
    +"ar.update_user_id ,DATE_FORMAT(ar.arr_effective_date,'%Y-%m-%d') as arr_effective_date,ar.party_id,ar.scheme_code,ar.arr_id, "
    +"ar.property_type_code,ar.size,ar.property_info_code,ar.house_type_code,ar.arr_status_code,tx.txn_id,tx.arr_type_code,tx.txn_mode_code, "
    +"tx.txn_amt,tx.txn_date,DATE_FORMAT(tx.txn_date,'%Y-%m-%d') as txn_date,tx.challan_id,tx.txn_gateway_id,tx.txn_desc,tx.acct_head_code, "
    +"tx.txn_entry_type_code FROM  (SELECT * FROM  " 
    + db + ".arrangement WHERE arr_id = " + SqlString.escape(obj.arr_id) + " AND arr_type_code ='APPLIED') ar JOIN  " 
    + db + ".txn tx ON tx.arr_id=ar.arr_id and ar.arr_type_code=tx.arr_type_code JOIN "+ db + ".property_info pri ON pri.property_info_code=ar.property_info_code";
    mysqlPool.query(sql_fetchCurr, function (error, results) {
        if (error) {
            console.log("Error-->routes-->interface-->property-->apply-->getApplication--", error)
            objectToSend["error"] = true
            objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
            res.send(objectToSend);
        } else {
            objectToSend["error"] = false
            objectToSend["data"] = results
            res.send(objectToSend);
        }
    })
});




router.delete('/deleteNominee:dtls', (req, res) => {

    let objectToSend = {}

    let obj = JSON.parse(req.params.dtls);


    let db = "svayam_" + obj.b_acct_id + "_property";
    let sql_fetchCurr = "delete from "+ db + ".nominee_info where nominee_id="+obj.nominee_id;
    mysqlPool.query(sql_fetchCurr, function (error, results) {
        if (error) {
            console.log("Error-->routes-->interface-->property-->apply-->deleteNominee--", error)
            objectToSend["error"] = true
            objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
            res.send(objectToSend);
        } else {
            objectToSend["error"] = false
            objectToSend["data"] = "Deleted Successfully!"
            res.send(objectToSend);
        }
    })
});
module.exports=router;
