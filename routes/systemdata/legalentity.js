var express = require('express');
var router = express.Router();
var SqlString = require('sqlstring');
var propObj = require('../../config_con.js')
let mysqlPool = require('../../connections/mysqlConnection.js');
var moment = require('moment')

router.get('/getcurrentlegalentity:dtls', (req, res) => {

    let objectToSend = {}

    let obj = JSON.parse(req.params.dtls);


    let db = propObj.erpsystemdata

    let sql_fetchCurr = "SELECT le.* FROM "+ db +".legal_entity_parent lp JOIN "+ db +".legal_entity le ON lp.le_id=le.le_id"
    +" WHERE le.valid_from < CURRENT_TIMESTAMP() AND le.valid_upto>= CURRENT_TIMESTAMP() AND le.txn_end>CURRENT_TIMESTAMP() "
    if(obj.contact_email != undefined){
        sql_fetchCurr +=  " AND le.contact_email=" + SqlString.escape(obj.contact_email)  
    }
    if(obj.phone_no != undefined){
        sql_fetchCurr +=  " AND le.phone_no=" + SqlString.escape(obj.phone_no)  
    }
   
   // +"join "+ db +".property_info pr on pr.property_id = ar.property_id join "+ db +".property_type_info pt on pt.property_type_id = ar.property_type_id "
    mysqlPool.query(sql_fetchCurr, function (error, results) {
        if (error) {
            console.log("Error-->routes-->systemdata-->legalentity-->getcurrentlegalentity", error)
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

router.get('/getcurrentidentity:dtls', (req, res) => {

    let objectToSend = {}

    let obj = JSON.parse(req.params.dtls);


    let db = propObj.erpsystemdata

    let sql_fetchCurr = "SELECT le.* FROM "+ db +".identity_parent lp JOIN "+ db +".identity le ON lp.ident_id=le.ident_id"
    +" WHERE le.valid_from < CURRENT_TIMESTAMP() AND le.valid_upto>= CURRENT_TIMESTAMP() AND le.txn_end>CURRENT_TIMESTAMP() "
    /* if(obj.contact_email != undefined){
        sql_fetchCurr +=  " AND le.contact_email=" + SqlString.escape(obj.contact_email)  
    }
    if(obj.phone_no != undefined){
        sql_fetchCurr +=  " AND le.phone_no=" + SqlString.escape(obj.phone_no)  
    } */
   
   // +"join "+ db +".property_info pr on pr.property_id = ar.property_id join "+ db +".property_type_info pt on pt.property_type_id = ar.property_type_id "
    mysqlPool.query(sql_fetchCurr, function (error, results) {
        if (error) {
            console.log("Error-->routes-->systemdata-->legalentity-->getcurrentidentity ", error)
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


router.get('/gethistoryidentity:dtls', (req, res) => {

    let objectToSend = {}

    let obj = JSON.parse(req.params.dtls);


    let db = propObj.erpsystemdata

    let sql_fetchCurr ="select * from "+ db +".legal_entity " 
    if(obj.contact_email != undefined){
        sql_fetchCurr +=   " AND le.contact_email=" + SqlString.escape(obj.contact_email)  
    }
    if(obj.phone_no != undefined){
        sql_fetchCurr +=   +" AND le.phone_no=" + SqlString.escape(obj.phone_no)  
    }
    sql_fetchCurr+=  " order by valid_from" 
    mysqlPool.query(sql_fetchCurr, function (error, results) {
        if (error) {
            console.log("Error-->routes-->systemdata-->legalentity-->gethistorylegalentity", error)
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

router.get('/gethistorylegalentity:dtls', (req, res) => {

    let objectToSend = {}

    let obj = JSON.parse(req.params.dtls);


    let db = propObj.erpsystemdata

    let sql_fetchCurr ="select * from "+ db +".identity " 
   /*  if(obj.contact_email != undefined){
        sql_fetchCurr +=   " AND le.contact_email=" + SqlString.escape(obj.contact_email)  
    }
    if(obj.phone_no != undefined){
        sql_fetchCurr +=   +" AND le.phone_no=" + SqlString.escape(obj.phone_no)  
    } */
    sql_fetchCurr+=  " order by valid_from" 
    mysqlPool.query(sql_fetchCurr, function (error, results) {
        if (error) {
            console.log("Error-->routes-->systemdata-->legalentity-->gethistorylegalentity", error)
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
router.post('/createindentity', (req, res) => {
    let obj = req.body;

    let objectToSend = {}
    let db = propObj.erpsystemdata
    let create_timestamp = SqlString.escape(moment().format('YYYY-MM-DD HH:mm:ss'))
    let contact_email = SqlString.escape(obj.contact_email)
    let contact_phone = SqlString.escape(obj.contact_phone)
   
    let dataidentity = obj['dataidentity']
    let data = obj['data']

    let sql = "insert into " + db + ".legal_entity_parent (contact_email,contact_phone) values "
        +"("+contact_email+","+contact_phone+")"

      mysqlPool.getConnection(function (error, mysqlCon) {
        if (error) {
            console.log("Error-->routes-->systemdata-->legalentity-->createindentity--", error)
            objectToSend["error"] = true
            objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
            res.send(objectToSend);
        } else {
            mysqlCon.beginTransaction(function (error4) {
                if (error4) {
                    console.log("Error-->routes-->systemdata-->legalentity-->createindentity--", error4)
                    objectToSend["error"] = true
                    objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
                    res.send(objectToSend);
                    mysqlCon.release();
                } else {
                    mysqlCon.query(sql, function (error1, results1) {
                        if (error1) {
                            console.log("Error-->routes-->systemdata-->legalentity-->createindentity--", error1)
                            objectToSend["error"] = true;
                            objectToSend["data"] = "Some error occured at server Side. Please try again later"
                            res.send(objectToSend)
                            mysqlCon.rollback();
                            mysqlCon.release()
                        } else {
                            var le_id = results[0].insertId
                            let sqlle = "insert into " + db + ".legal_entity_parent (le_id,contact_email,phone_no,login_user_id,party_name,nick_name,legal_name,party_type,valid_from) values "
        +"("+SqlString.escape(obj.le_id)+","+contact_email+","+contact_phone+","+SqlString.escape(obj.login_user_id)+","+SqlString.escape(obj.party_name)+","+SqlString.escape(obj.nick_name)+","+ SqlString.escape(obj.legal_name) +","+ SqlString.escape(obj.party_type) +","+ create_timestamp +")"

                           
                    
                            mysqlCon.query(sqlle, function (error1, results) {
                                if (error1) {
                                    console.log("Error-->routes-->systemdata-->legalentity-->createindentity--", error1)
                                    objectToSend["error"] = true;
                                    objectToSend["data"] = "Some error occured at server Side. Please try again later"
                                    res.send(objectToSend)
                                    mysqlCon.rollback();
                                    mysqlCon.release()
                                } else {
                                    let sql1 = "insert into " + db + ".identity_parent (le_id,valid_ident_key_id,ident_to_verify) values "
                            for (let i = 0; i < data.length; i++) {
                                sql1+= "("+SqlString.escape(le_id)+","+SqlString.escape(data[i].valid_ident_key_id)+","+SqlString.escape(data[i].ident_to_verify)+")"
                    
                     if (i < data.length - 1) {
                                sql1 += " , "
                            }
                    
                            }
                                    mysqlCon.query(sqlid, function (error1, results3) {
                                        if (error1) {
                                            console.log("Error-->routes-->systemdata-->legalentity-->createindentity--", error1)
                                            objectToSend["error"] = true;
                                            objectToSend["data"] = "Some error occured at server Side. Please try again later"
                                            res.send(objectToSend)
                                            mysqlCon.rollback();
                                            mysqlCon.release()
                                        } else {
                                            var lent_id = []
                                            lent_id.push(results3[0].insertId)
                                            lent_id.push(results3[1].insertId)
                                           
                                            let sql1 = "insert into " + db + ".identity (ident_id,le_id,valid_ident_key_id,ident_to_verify,ident_verify_method,ident_verify_secret_type,ident_verify_secret,life_cycle_status,user_id,valid_from) values "
                                            for (let i = 0; i < dataidentity.length; i++) {
                                                sql1+= "("+SqlString.escape(dataidentity[i].ident_id)+","+SqlString.escape(le_id)+","+SqlString.escape(dataidentity[i].valid_ident_key_id)+","+SqlString.escape(dataidentity[i].ident_to_verify)+","+SqlString.escape(dataidentity[i].ident_verify_method)+","+SqlString.escape(dataidentity[i].ident_verify_secret_type)+","+SqlString.escape(dataidentity[i].ident_verify_secret)+","+SqlString.escape(dataidentity[i].life_cycle_status)+","+SqlString.escape(dataidentity[i].user_id)+","+create_timestamp+")"
                                    
                                     if (i < dataidentity.length - 1) {
                                                sql1 += " , "
                                            }
                                    
                                            }
                                            mysqlCon.query(sqlid, function (error1, results) {
                                                if (error1) {
                                                    console.log("Error-->routes-->systemdata-->legalentity-->createindentity--", error1)
                                                    objectToSend["error"] = true;
                                                    objectToSend["data"] = "Some error occured at server Side. Please try again later"
                                                    res.send(objectToSend)
                                                    mysqlCon.rollback();
                                                    mysqlCon.release()
                                                } else {
                            mysqlCon.query('COMMIT', function (error2) {
                                if (error2) {
                                    console.log("Error-->routes-->systemdata-->legalentity-->createindentity--", error2)
                                    objectToSend["error"] = true;
                                    objectToSend["data"] = "Some error occured at server Side. Please try again later"
                                    res.send(objectToSend)
                                    mysqlCon.rollback();
                                    mysqlCon.release()
                                } else {
                                    objectToSend["error"] = false;
                                    objectToSend["data"] = results.insertId
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

                        }
                    })
                }
            })
        }


    })
})


module.exports = router;