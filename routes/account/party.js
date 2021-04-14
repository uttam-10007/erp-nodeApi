var express = require('express');
var router = express.Router();
var SqlString = require('sqlstring');
var propObj = require('../../config_con')
let mysqlPool = require('../../connections/mysqlConnection');
var moment = require('moment')

router.get('/getPartyInfo:dtls', (req, res) => {

    let objectToSend = {}

    let obj = JSON.parse(req.params.dtls)

    let b_acct_id = obj["b_acct_id"]
    let id = obj["id"];
    let party_legal_name = obj["party_legal_name"]
    let party_origination_source_code = obj["party_origination_source_code"]
    let party_type_code = obj["party_type_code"]
    let party_gst_no = obj["party_gst_no"]
    let party_adhaar_no = obj["party_adhaar_no"]
    let party_pan_no = obj["party_pan_no"]
    let party_phone_no = obj["party_phone_no"]
    let party_email = obj["party_email"]
    let party_local_no = obj["party_local_no"]

    let sql = "Select id,party_id,party_legal_name,party_origination_source_code,party_type_code,party_gst_no,party_adhaar_no,party_pan_no,party_phone_no,"
        + "party_email,party_city,party_district,party_addr_line1,party_addr_line2,party_state,party_country,"
        + "party_pin_code,party_bank_acct_no,party_bank_code,party_branch_code,party_ifsc_code,party_local_no,create_user_id,update_user_id,"
        + "DATE_FORMAT(create_timestamp,'%Y-%m-%d %H:%i:%S') as create_timestamp,DATE_FORMAT(update_timestamp,'%Y-%m-%d %H:%i:%S') as update_timestamp"
        + " from svayam_" + b_acct_id + "_account.party_info "

    let flag = true

    if (id != undefined) {
        if (flag) {
            sql += "where id=" + SqlString.escape(id)
            flag = false;
        } else {
            sql += " or id=" + SqlString.escape(id)
        }
    }
    if (party_legal_name != undefined) {
        party_legal_name = "%" + party_legal_name + "%";
        if (flag) {
            sql += "where party_legal_name like " + SqlString.escape(party_legal_name);
            flag = false;
        } else {
            sql += " or party_legal_name like %" + SqlString.escape(party_legal_name) + "%"
        }
    }
    if (party_origination_source_code != undefined) {
        if (flag) {
            sql += "where party_origination_source_code=" + SqlString.escape(party_origination_source_code)
            flag = false;
        } else {
            sql += " or party_origination_source_code=" + SqlString.escape(party_origination_source_code)
        }
    }
    if (party_type_code != undefined) {
        if (flag) {
            sql += "where party_type_code=" + SqlString.escape(party_type_code)
            flag = false;
        } else {
            sql += " or party_type_code=" + SqlString.escape(party_type_code)
        }
    }
    if (party_gst_no != undefined) {
        if (flag) {
            sql += "where party_gst_no=" + SqlString.escape(party_gst_no)
            flag = false;
        } else {
            sql += " or party_gst_no=" + SqlString.escape(party_gst_no)
        }
    }
    if (party_adhaar_no != undefined) {
        if (flag) {
            sql += "where party_adhaar_no=" + SqlString.escape(party_adhaar_no)
            flag = false;
        } else {
            sql += " or party_adhaar_no=" + SqlString.escape(party_adhaar_no)
        }
    }
    if (party_pan_no != undefined) {
        if (flag) {
            sql += "where party_pan_no=" + SqlString.escape(party_pan_no)
            flag = false;
        } else {
            sql += " or party_pan_no=" + SqlString.escape(party_pan_no)
        }
    }
    if (party_phone_no != undefined) {
        if (flag) {
            sql += "where party_phone_no=" + SqlString.escape(party_phone_no)
            flag = false;
        } else {
            sql += " or party_phone_no=" + SqlString.escape(party_phone_no)
        }
    }
    if (party_email != undefined) {
        if (flag) {
            sql += "where party_email=" + SqlString.escape(party_email)
            flag = false;
        } else {
            sql += " or party_email=" + SqlString.escape(party_email)
        }
    }
    if (party_local_no != undefined) {
        if (flag) {
            sql += "where party_local_no=" + SqlString.escape(party_local_no)
            flag = false;
        } else {
            sql += " or party_local_no=" + SqlString.escape(party_local_no)
        }
    }

    mysqlPool.query(sql, function (error, results) {
        if (error) {
            console.log("Error-->routes-->account-->party-->getPartyInfo--", error)
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
    let db = "svayam_" + obj.b_acct_id + "_account";
    let data = obj['data'];
    let create_timestamp = SqlString.escape(moment().format('YYYY-MM-DD HH:mm:ss'))

    let query = "insert into "+db+".party_info(party_id,party_legal_name,party_origination_source_code,party_type_code,party_gst_no,party_adhaar_no,"
        + "party_pan_no,party_phone_no,"
        + "party_email,party_city,party_district,party_addr_line1,party_addr_line2,party_state,party_country,"
        + "party_pin_code,party_bank_acct_no,party_bank_code,party_branch_code,party_ifsc_code,party_local_no,create_user_id,create_timestamp) values";


    for (let i = 0; i < data.length; i++) {
        if (i < data.length - 1) {
            query += "(" +SqlString.escape(data[i]['party_id']) + ","
                + SqlString.escape(data[i]['party_legal_name']) + ","
                + SqlString.escape(data[i]['party_origination_source_code'])  + ","
                + SqlString.escape(data[i]['party_type_code'] ) + ","
                + SqlString.escape(data[i]['party_gst_no'])  + ","
                + SqlString.escape(data[i]['party_adhaar_no'])  + ","
                + SqlString.escape(data[i]['party_pan_no'])  + ","
                + SqlString.escape(data[i]['party_phone_no'] ) + ","
                + SqlString.escape(data[i]['party_email'] ) + ","
                + SqlString.escape(data[i]['party_city'])  + ","
                + SqlString.escape(data[i]['party_district'])  + ","
                + SqlString.escape(data[i]['party_addr_line1'] ) + ","
                + SqlString.escape(data[i]['party_addr_line2'])  + ","
                + SqlString.escape(data[i]['party_state'])  + ","
                + SqlString.escape(data[i]['party_country'] ) + ","
                + SqlString.escape(data[i]['party_pin_code'] ) + ","
                + SqlString.escape(data[i]['party_bank_acct_no'] ) + ","
                + SqlString.escape(data[i]['party_bank_code'])  + ","
                + SqlString.escape(data[i]['party_branch_code'] ) + ","
                + SqlString.escape(data[i]['party_ifsc_code'] ) + ","
                + SqlString.escape(data[i]['party_local_no'] ) + ","
                + SqlString.escape(data[i]['create_user_id'] ) + ","
                +create_timestamp + "),"
        } else {
            query += "(" +SqlString.escape(data[i]['party_id']) + ","
            + SqlString.escape(data[i]['party_legal_name']) + ","
            + SqlString.escape(data[i]['party_origination_source_code'])  + ","
            + SqlString.escape(data[i]['party_type_code'] ) + ","
            + SqlString.escape(data[i]['party_gst_no'])  + ","
            + SqlString.escape(data[i]['party_adhaar_no'])  + ","
            + SqlString.escape(data[i]['party_pan_no'])  + ","
            + SqlString.escape(data[i]['party_phone_no'] ) + ","
            + SqlString.escape(data[i]['party_email'] ) + ","
            + SqlString.escape(data[i]['party_city'])  + ","
            + SqlString.escape(data[i]['party_district'])  + ","
            + SqlString.escape(data[i]['party_addr_line1'] ) + ","
            + SqlString.escape(data[i]['party_addr_line2'])  + ","
            + SqlString.escape(data[i]['party_state'])  + ","
            + SqlString.escape(data[i]['party_country'] ) + ","
            + SqlString.escape(data[i]['party_pin_code'] ) + ","
            + SqlString.escape(data[i]['party_bank_acct_no'] ) + ","
            + SqlString.escape(data[i]['party_bank_code'])  + ","
            + SqlString.escape(data[i]['party_branch_code'] ) + ","
            + SqlString.escape(data[i]['party_ifsc_code'] ) + ","
            + SqlString.escape(data[i]['party_local_no'] ) + ","
            + SqlString.escape(data[i]['create_user_id'] ) + ","
            + create_timestamp + ")"
        }
    }
    query += "on duplicate key update party_legal_name=values( party_legal_name) ,"
        + "party_origination_source_code=values( party_origination_source_code) ,party_type_code=values(party_type_code) ,"
        + "party_gst_no=values( party_gst_no) ,party_adhaar_no=values( party_adhaar_no) ,"
        + "party_pan_no=values( party_pan_no) ,party_phone_no=values( party_phone_no) ,"
        + "party_email=values( party_email) ,party_city=values( party_city) ,"
        + "party_district=values( party_district) ,party_addr_line1=values( party_addr_line1) ,"
        + "party_addr_line2=values( party_addr_line2) ,party_state=values( party_state) ,"
        + "party_country=values( party_country) ,party_pin_code=values( party_pin_code) ,"
        + "party_bank_acct_no=values( party_bank_acct_no) ,party_bank_code=values( party_bank_code) ,"
        + "party_branch_code=values( party_branch_code) ,party_ifsc_code=values( party_ifsc_code) ,"
        + "party_local_no=values( party_local_no) ,create_user_id=values( create_user_id)"


    mysqlPool.getConnection(function (error, mysqlCon) {
        if (error) {
            console.log("Error-->routes-->account-->party-->updatecreateparty", error)
            objectToSend["error"] = true
            objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
            res.send(objectToSend);
        } else {
            mysqlCon.beginTransaction(function (error4) {
                if (error4) {
                    console.log("Error-->routes-->account-->party-->updatecreateparty", error4)
                    objectToSend["error"] = true
                    objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
                    res.send(objectToSend);
                    mysqlCon.release();
                } else {
                    mysqlCon.query(query, function (error1, results1) {
                        if (error1) {
                            console.log("Error-->routes-->account-->party-->updatecreateparty", error1)
                            objectToSend["error"] = true;
                            objectToSend["data"] = "Some error occured at server Side. Please try again later"
                            res.send(objectToSend)
                            mysqlCon.rollback();
                            mysqlCon.release()
                        }

                        else {
                            mysqlCon.query('COMMIT', function (error2) {
                                if (error2) {
                                    console.log("Error-->routes-->account-->party-->updatecreateparty", error2)
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
    })
});

router.put('/updatePartyInfo', (req, res) => {
    let objectToSend = {}

    let obj = req.body;

    let b_acct_id = obj["b_acct_id"]
    let id = SqlString.escape(obj["id"]);
    let party_legal_name = SqlString.escape(obj["party_legal_name"])
    let party_origination_source_code = SqlString.escape(obj["party_origination_source_code"])
    let party_type_code = SqlString.escape(obj["party_type_code"])
    let party_gst_no = SqlString.escape(obj["party_gst_no"])
    let party_adhaar_no = SqlString.escape(obj["party_adhaar_no"])
    let party_pan_no = SqlString.escape(obj["party_pan_no"])
    let party_phone_no = SqlString.escape(obj["party_phone_no"])
    let party_email = SqlString.escape(obj["party_email"])
    let party_city = SqlString.escape(obj["party_city"])
    let party_district = SqlString.escape(obj["party_district"])
    let party_addr_line1 = SqlString.escape(obj["party_addr_line1"])
    let party_addr_line2 = SqlString.escape(obj["party_addr_line2"])
    let party_state = SqlString.escape(obj["party_state"])
    let party_country = SqlString.escape(obj["party_country"])
    let party_pin_code = SqlString.escape(obj["party_pin_code"])
    let party_bank_acct_no = SqlString.escape(obj["party_bank_acct_no"])
    let party_bank_code = SqlString.escape(obj["party_bank_code"])
    let party_branch_code = SqlString.escape(obj["party_branch_code"])
    let party_ifsc_code = SqlString.escape(obj["party_ifsc_code"])
    let party_local_no = SqlString.escape(obj["party_local_no"])
    let update_user_id = SqlString.escape(obj["update_user_id"])
    let update_timestamp = SqlString.escape(moment().format('YYYY-MM-DD HH:mm:ss'))

    let sql = "update svayam_" + b_acct_id + "_account.party_info set party_legal_name=" + party_legal_name + ",party_origination_source_code=" + party_origination_source_code + ", "
        + " party_type_code=" + party_type_code + ",party_gst_no=" + party_gst_no + ",party_adhaar_no=" + party_adhaar_no + ",party_pan_no=" + party_pan_no + ","
        + "party_phone_no=" + party_phone_no + ",party_email=" + party_email + ",party_city=" + party_city + ",party_district=" + party_district + ",party_addr_line1=" + party_addr_line1 + ", "
        + "party_addr_line2=" + party_addr_line2 + ",party_state=" + party_state + ",party_country=" + party_country + ","
        + "party_pin_code=" + party_pin_code + ",party_bank_acct_no=" + party_bank_acct_no + ",party_bank_code=" + party_bank_code + ","
        + "party_branch_code=" + party_branch_code + ",party_ifsc_code=" + party_ifsc_code + ",party_local_no=" + party_local_no + ",update_user_id=" + update_user_id + ",update_timestamp=" + update_timestamp + " where id=" + id

    mysqlPool.query(sql, function (error, results) {
        if (error) {
            console.log("Error-->routes-->account-->party-->updatePartyInfo--", error)
            objectToSend["error"] = true
            objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
            res.send(objectToSend);
        } else {
            objectToSend["error"] = false
            objectToSend["data"] = "Party Updated Successfully"
            res.send(objectToSend);
        }
    })

})




router.post('/createpartywithoutpartyId', (req, res) => {
    let obj = req.body;
    let objectToSend = {}
    let db = "svayam_" + obj.b_acct_id + "_account";
    let data = obj['data'];
    let create_timestamp = SqlString.escape(moment().format('YYYY-MM-DD HH:mm:ss'));

    let max_id = "SELECT MAX(party_local_no) AS party_local_no FROM " + db + ".party_info  WHERE party_origination_source_code='ACC'";


    mysqlPool.getConnection(function (error, mysqlCon) {
        if (error) {
            console.log("Error-->routes-->account-->party-->updatecreateparty", error)
            objectToSend["error"] = true
            objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
            res.send(objectToSend);
        } else {
            mysqlCon.beginTransaction(function (error4) {
                if (error4) {
                    console.log("Error-->routes-->account-->party-->updatecreateparty", error4)
                    objectToSend["error"] = true
                    objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
                    res.send(objectToSend);
                    mysqlCon.release();
                } else {
                    mysqlCon.query(max_id, function (error1, results1) {
                        if (error1) {
                            console.log("Error-->routes-->account-->party-->updatecreateparty", error1)
                            objectToSend["error"] = true;
                            objectToSend["data"] = "Some error occured at server Side. Please try again later"
                            res.send(objectToSend)
                            mysqlCon.rollback();
                            mysqlCon.release()
                        }

                        else {

                            let party_id = '';
                            let party_local_no=1;
                            if (results1[0].party_local_no == null) {
                                party_id = 'ACC1';
                                party_local_no=1;

                            } else {
                                party_id = 'ACC' + results1[0].party_local_no;
                                party_local_no=1+parseInt(results1[0].party_local_no);

                            }


                            let query = "insert into " + db + ".party_info(party_id,party_legal_name,party_origination_source_code,party_type_code,party_gst_no,party_adhaar_no,"
                                + "party_pan_no,party_phone_no,"
                                + "party_email,party_city,party_district,party_addr_line1,party_addr_line2,party_state,party_country,"
                                + "party_pin_code,party_bank_acct_no,party_bank_code,party_branch_code,party_ifsc_code,party_local_no,create_user_id,create_timestamp) values";


                            for (let i = 0; i < data.length; i++) {
                                if (i < data.length - 1) {
                                    query += "(" + SqlString.escape(party_id) + ","
                                        + SqlString.escape(data[i]['party_legal_name']) + ","
                                        + SqlString.escape(data[i]['party_origination_source_code']) + ","
                                        + SqlString.escape(data[i]['party_type_code']) + ","
                                        + SqlString.escape(data[i]['party_gst_no']) + ","
                                        + SqlString.escape(data[i]['party_adhaar_no']) + ","
                                        + SqlString.escape(data[i]['party_pan_no']) + ","
                                        + SqlString.escape(data[i]['party_phone_no']) + ","
                                        + SqlString.escape(data[i]['party_email']) + ","
                                        + SqlString.escape(data[i]['party_city']) + ","
                                        + SqlString.escape(data[i]['party_district']) + ","
                                        + SqlString.escape(data[i]['party_addr_line1']) + ","
                                        + SqlString.escape(data[i]['party_addr_line2']) + ","
                                        + SqlString.escape(data[i]['party_state']) + ","
                                        + SqlString.escape(data[i]['party_country']) + ","
                                        + SqlString.escape(data[i]['party_pin_code']) + ","
                                        + SqlString.escape(data[i]['party_bank_acct_no']) + ","
                                        + SqlString.escape(data[i]['party_bank_code']) + ","
                                        + SqlString.escape(data[i]['party_branch_code']) + ","
                                        + SqlString.escape(data[i]['party_ifsc_code']) + ","
                                        + SqlString.escape(party_local_no) + ","
                                        + SqlString.escape(data[i]['create_user_id']) + ","
                                        + create_timestamp + "),"
                                } else {
                                    query += "(" + SqlString.escape(party_id) + ","
                                        + SqlString.escape(data[i]['party_legal_name']) + ","
                                        + SqlString.escape(data[i]['party_origination_source_code']) + ","
                                        + SqlString.escape(data[i]['party_type_code']) + ","
                                        + SqlString.escape(data[i]['party_gst_no']) + ","
                                        + SqlString.escape(data[i]['party_adhaar_no']) + ","
                                        + SqlString.escape(data[i]['party_pan_no']) + ","
                                        + SqlString.escape(data[i]['party_phone_no']) + ","
                                        + SqlString.escape(data[i]['party_email']) + ","
                                        + SqlString.escape(data[i]['party_city']) + ","
                                        + SqlString.escape(data[i]['party_district']) + ","
                                        + SqlString.escape(data[i]['party_addr_line1']) + ","
                                        + SqlString.escape(data[i]['party_addr_line2']) + ","
                                        + SqlString.escape(data[i]['party_state']) + ","
                                        + SqlString.escape(data[i]['party_country']) + ","
                                        + SqlString.escape(data[i]['party_pin_code']) + ","
                                        + SqlString.escape(data[i]['party_bank_acct_no']) + ","
                                        + SqlString.escape(data[i]['party_bank_code']) + ","
                                        + SqlString.escape(data[i]['party_branch_code']) + ","
                                        + SqlString.escape(data[i]['party_ifsc_code']) + ","
                                        + SqlString.escape(party_local_no) + ","
                                        + SqlString.escape(data[i]['create_user_id']) + ","
                                        + create_timestamp + ")"
                                }
                            }
                            query += "on duplicate key update party_legal_name=values( party_legal_name) ,"
                                + "party_origination_source_code=values( party_origination_source_code) ,party_type_code=values(party_type_code) ,"
                                + "party_gst_no=values( party_gst_no) ,party_adhaar_no=values( party_adhaar_no) ,"
                                + "party_pan_no=values( party_pan_no) ,party_phone_no=values( party_phone_no) ,"
                                + "party_email=values( party_email) ,party_city=values( party_city) ,"
                                + "party_district=values( party_district) ,party_addr_line1=values( party_addr_line1) ,"
                                + "party_addr_line2=values( party_addr_line2) ,party_state=values( party_state) ,"
                                + "party_country=values( party_country) ,party_pin_code=values( party_pin_code) ,"
                                + "party_bank_acct_no=values( party_bank_acct_no) ,party_bank_code=values( party_bank_code) ,"
                                + "party_branch_code=values( party_branch_code) ,party_ifsc_code=values( party_ifsc_code) ,"
                                + "party_local_no=values( party_local_no) ,create_user_id=values( create_user_id)"


                            mysqlCon.query(query, function (error2, results2) {
                                if (error2) {
                                    console.log("Error-->routes-->account-->party-->updatecreateparty", error2)
                                    objectToSend["error"] = true;
                                    objectToSend["data"] = "Some error occured at server Side. Please try again later"
                                    res.send(objectToSend)
                                    mysqlCon.rollback();
                                    mysqlCon.release()
                                }

                                else {
                                    mysqlCon.query('COMMIT', function (error3) {
                                        if (error3) {
                                            console.log("Error-->routes-->account-->party-->updatecreateparty", error3)
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


            })
        }
    })
});






module.exports = router;
