var express = require('express');
var router = express.Router();
var SqlString = require('sqlstring');
var propObj = require('../../config_con.js')
let mysqlPool = require('../../connections/mysqlConnection.js');
var moment = require('moment')





router.get('/getAllPropertyTypeInfo:dtls', (req, res) => {

    let objectToSend = {}

    let obj = JSON.parse(req.params.dtls);


    let db = "svayam_" + obj.b_acct_id + "_property";

    let sql_fetchCurr = "SELECT property_type_id,property_type_code,length,width,estimated_cost,additional_cost,premium_amount,final_amount,"
        + "no_of_property,scheme_code,sub_scheme_code,measurement_unit,quota_code,sub_quota_code,amount_per,cancellation_amount_per,"
        + "create_user_id,update_user_id,subsidised_or_non_subsidised,residential_or_commercial,"
        + "DATE_FORMAT(create_timestamp,'%Y-%m-%d %H:%i:%S') as create_timestamp,DATE_FORMAT(update_timestamp,'%Y-%m-%d %H:%i:%S') as "
        + "update_timestamp from " + db + ".property_type_info where scheme_code=" + SqlString.escape(obj.scheme_code)
        + " And sub_scheme_code=" + SqlString.escape(obj.sub_scheme_code)




    mysqlPool.query(sql_fetchCurr, function (error, results) {
        if (error) {
            console.log("Error-->routes-->property-->getAllPropertyTypeInfo-->", error)
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




router.post('/createPropertyTypeInfo', (req, res) => {
    let obj = req.body;

    let objectToSend = {}
    let db = "svayam_" + obj.b_acct_id + "_property";
    let create_timestamp = SqlString.escape(moment().format('YYYY-MM-DD HH:mm:ss'))
    let dataArr = obj['data']
    let sql_insert = "insert into " + db + ".property_type_info(property_type_code,length,width,estimated_cost,additional_cost,premium_amount,final_amount,"
        + "no_of_property,scheme_code,sub_scheme_code,measurement_unit,quota_code,sub_quota_code,amount_per,cancellation_amount_per,"
        + "create_user_id,subsidised_or_non_subsidised,residential_or_commercial,"
        + "create_timestamp) values"
        + " (" + SqlString.escape(obj.property_type_code) + "," + SqlString.escape(obj.length) + "," + SqlString.escape(obj.width) + ","
        + SqlString.escape(obj.estimated_cost) + "," + SqlString.escape(obj.additional_cost) + "," + SqlString.escape(obj.premium_amount) + ","
        + SqlString.escape(obj.final_amount) + "," + SqlString.escape(obj.no_of_property) + "," + SqlString.escape(obj.scheme_code) + ","
        + SqlString.escape(obj.sub_scheme_code) + "," + SqlString.escape(obj.measurement_unit) + "," + SqlString.escape(obj.quota_code) + ","
        + SqlString.escape(obj.sub_quota_code) + "," + SqlString.escape(obj.amount_per) + "," + SqlString.escape(obj.cancellation_amount_per) + ","
        + SqlString.escape(obj.create_user_id) + "," + SqlString.escape(obj.subsidised_or_non_subsidised) + "," + SqlString.escape(obj.residential_or_commercial) + ","
        + create_timestamp + ") "

    mysqlPool.getConnection(function (error, mysqlCon) {
        if (error) {
            console.log("Error-->routes-->property-->property_type_info-->createPropertyTypeInfo", error)
            objectToSend["error"] = true
            objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
            res.send(objectToSend);
        } else {
            mysqlCon.beginTransaction(function (error1) {
                if (error1) {
                    console.log("Error-->routes-->property-->property_type_info-->createPropertyTypeInfo", error1)
                    objectToSend["error"] = true
                    objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
                    res.send(objectToSend);
                    mysqlCon.release();
                } else {
                    mysqlCon.query(sql_insert, function (error2, results) {
                        if (error2) {
                            console.log("Error-->routes-->property-->property_type_info-->createPropertyTypeInfo", error2)
                            objectToSend["error"] = true;
                            objectToSend["data"] = "Some error occured at server Side. Please try again later"
                            res.send(objectToSend)
                            mysqlCon.rollback();
                            mysqlCon.release()
                        } else {
                            let property_type_id=results.insertId


                            if(dataArr.length==0){
                                mysqlCon.query('COMMIT', function (error211) {
                                    if (error211) {
                                        console.log("Error-->routes-->property-->property_type_info-->createPropertyTypeInfo", error211)
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
                            }else{
                                

                            let costInsert = "insert into " + db + ".property_type_cost (property_type_id,payment_type,payment_amount,create_user_id,create_timestamp) values";
                                  for (let i = 0; i < dataArr.length; i++) {
                                costInsert += " (" + SqlString.escape(property_type_id) + "," + SqlString.escape(dataArr[i].payment_type) + "," + SqlString.escape(dataArr[i].payment_amount)
                                            + "," + SqlString.escape(obj.create_user_id) + "," + create_timestamp + ") "
                              
                                if (i != dataArr.length - 1) {
                                    costInsert += ","

                                }
                            }
                            mysqlCon.query(costInsert , function (errorr, results) {
                                if (errorr) {
                                    console.log("Error-->routes-->property-->property_type_info-->createPropertyTypeInfo", errorr)
                                    objectToSend["error"] = true;
                                    objectToSend["data"] = "Some error occured at server Side. Please try again later"
                                    res.send(objectToSend)
                                    mysqlCon.rollback();
                                    mysqlCon.release()
                                } else {
                                    mysqlCon.query('COMMIT', function (error21) {
                                        if (error21) {
                                            console.log("Error-->routes-->property-->property_type_info-->createPropertyTypeInfo", error21)
                                            objectToSend["error"] = true;
                                            objectToSend["data"] = "Some error occured at server Side. Please try again later"
                                            res.send(objectToSend)
                                            mysqlCon.rollback();
                                            mysqlCon.release()
                                        } else {
                                            objectToSend["error"] = false;
                                            objectToSend["data"] = "Created Successfully"
                                            res.send(objectToSend)
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


})



router.get('/getPropertyTypeCost:dtls', (req, res) => {

    let objectToSend = {}

    let obj = JSON.parse(req.params.dtls);


    let db = "svayam_" + obj.b_acct_id + "_property";

    let sql_fetchCurr = "SELECT property_type_id,property_type_cost_id,payment_type,payment_amount,"
        + "create_user_id,update_user_id,DATE_FORMAT(create_timestamp,'%Y-%m-%d %H:%i:%S') as create_timestamp,DATE_FORMAT(update_timestamp,'%Y-%m-%d %H:%i:%S') as "
        + "update_timestamp from " + db + ".property_type_cost where property_type_id=" + SqlString.escape(obj.property_type_id)




    mysqlPool.query(sql_fetchCurr, function (error, results) {
        if (error) {
            console.log("Error-->routes-->property-->getPropertyTypeCost-->", error)
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



router.get('/getAllPropertyTypeCost:dtls', (req, res) => {

    let objectToSend = {}

    let obj = JSON.parse(req.params.dtls);


    let db = "svayam_" + obj.b_acct_id + "_property";

    let sql_fetchCurr = "SELECT c.property_type_id,c.property_type_cost_id,c.payment_type,c.payment_amount"
        + " from " + db + ".property_type_cost c join "+db+".property_type_info t on t.property_type_id=c.property_type_id where scheme_code=" + SqlString.escape(obj.scheme_code)+" and sub_scheme_code="+SqlString.escape(obj.sub_scheme_code)



    mysqlPool.query(sql_fetchCurr, function (error, results) {
        if (error) {
            console.log("Error-->routes-->property-->getPropertyTypeCost-->", error)
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

router.put('/updatePropertyTypeInfo', (req, res) => {
    let obj = req.body;

    let objectToSend = {}
    let db = "svayam_" + obj.b_acct_id + "_property";
    let update_timestamp = SqlString.escape(moment().format('YYYY-MM-DD HH:mm:ss'))
    let dataArr = obj['data']
    let sql_update = "update " + db + ".property_type_info  set property_type_code=" + SqlString.escape(obj.property_type_code) + ",length=" + SqlString.escape(obj.length) 
    + ",width=" + SqlString.escape(obj.width) + ",estimated_cost=" + SqlString.escape(obj.estimated_cost) + ",additional_cost=" + SqlString.escape(obj.additional_cost) 
    + ",premium_amount=" + SqlString.escape(obj.premium_amount) + ",final_amount="+ SqlString.escape(obj.final_amount) + ","
        + "no_of_property="+ SqlString.escape(obj.no_of_property) + ",scheme_code=" + SqlString.escape(obj.scheme_code) + ",sub_scheme_code="+ SqlString.escape(obj.sub_scheme_code) 
        + ",measurement_unit=" + SqlString.escape(obj.measurement_unit) + ",quota_code=" + SqlString.escape(obj.quota_code) + ",sub_quota_code="+ SqlString.escape(obj.sub_quota_code) 
        + ",amount_per=" + SqlString.escape(obj.amount_per) + ",cancellation_amount_per=" + SqlString.escape(obj.cancellation_amount_per) + ","
        + "update_user_id=" + SqlString.escape(obj.update_user_id) + ",subsidised_or_non_subsidised=" + SqlString.escape(obj.subsidised_or_non_subsidised) 
        + ",residential_or_commercial=" + SqlString.escape(obj.residential_or_commercial) + ","
        + "update_timestamp=" + update_timestamp + " where  property_type_id="+SqlString.escape(obj.property_type_id)
        
       
let deleteQuery="delete from " + db + ".property_type_cost where property_type_id="+SqlString.escape(obj.property_type_id)
    mysqlPool.getConnection(function (error, mysqlCon) {
        if (error) {
            console.log("Error-->routes-->property-->property_type_info-->updatePropertyTypeInfo", error)
            objectToSend["error"] = true
            objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
            res.send(objectToSend);
        } else {
            mysqlCon.beginTransaction(function (error1) {
                if (error1) {
                    console.log("Error-->routes-->property-->property_type_info-->updatePropertyTypeInfo", error1)
                    objectToSend["error"] = true
                    objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
                    res.send(objectToSend);
                    mysqlCon.release();
                } else {
                    mysqlCon.query(sql_update+";"+deleteQuery, function (error2, results) {
                        if (error2) {
                            console.log("Error-->routes-->property-->property_type_info-->updatePropertyTypeInfo", error2)
                            objectToSend["error"] = true;
                            objectToSend["data"] = "Some error occured at server Side. Please try again later"
                            res.send(objectToSend)
                            mysqlCon.rollback();
                            mysqlCon.release()
                        } else {
                                         if(dataArr.length==0){
                                mysqlCon.query('COMMIT', function (error211) {
                                    if (error211) {
                                        console.log("Error-->routes-->property-->property_type_info-->updatePropertyTypeInfo", error211)
                                        objectToSend["error"] = true;
                                        objectToSend["data"] = "Some error occured at server Side. Please try again later"
                                        res.send(objectToSend)
                                        mysqlCon.rollback();
                                        mysqlCon.release()
                                    } else {
                                        objectToSend["error"] = false;
                                        objectToSend["data"] = "Updated Successfully"
                                        res.send(objectToSend)
                                    }

                                }) 
                            }else{
                                

                            let costInsert = "insert into " + db + ".property_type_cost (property_type_id,payment_type,payment_amount,update_user_id,update_timestamp) values";
                                  for (let i = 0; i < dataArr.length; i++) {
                                costInsert += " (" + SqlString.escape(obj.property_type_id) + "," + SqlString.escape(dataArr[i].payment_type) + "," + SqlString.escape(dataArr[i].payment_amount)
                                            + "," + SqlString.escape(obj.update_user_id) + "," + update_timestamp + ") "
                              
                                if (i != dataArr.length - 1) {
                                    costInsert += ","

                                }
                            }
                            mysqlCon.query(costInsert , function (errorr, results) {
                                if (errorr) {
                                    console.log("Error-->routes-->property-->property_type_info-->updatePropertyTypeInfo", errorr)
                                    objectToSend["error"] = true;
                                    objectToSend["data"] = "Some error occured at server Side. Please try again later"
                                    res.send(objectToSend)
                                    mysqlCon.rollback();
                                    mysqlCon.release()
                                } else {
                                    mysqlCon.query('COMMIT', function (error21) {
                                        if (error21) {
                                            console.log("Error-->routes-->property-->property_type_info-->updatePropertyTypeInfo", error21)
                                            objectToSend["error"] = true;
                                            objectToSend["data"] = "Some error occured at server Side. Please try again later"
                                            res.send(objectToSend)
                                            mysqlCon.rollback();
                                            mysqlCon.release()
                                        } else {
                                            objectToSend["error"] = false;
                                            objectToSend["data"] = "Updated Successfully"
                                            res.send(objectToSend)
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


})






module.exports = router;
