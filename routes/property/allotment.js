var express = require('express');
var router = express.Router();
var SqlString = require('sqlstring');
var propObj = require('../../config_con.js')
let mysqlPool = require('../../connections/mysqlConnection.js');
var moment = require('moment')



router.get('/getAllAllotment:dtls', (req, res) => {

    let objectToSend = {}

    let obj = JSON.parse(req.params.dtls);


    let db = "svayam_" + obj.b_acct_id + "_property";

    let sql_fetchCurr = "SELECT ar.id,ar.arr_type_code,DATE_FORMAT( ar.arr_effective_date,'%Y-%m-%d') as arr_effective_date,ar.party_id,ar.scheme_code,ar.sub_scheme_code,ar.property_id,ar.booklet_amount,ar.application_amount,ar.booklet_challan_no,ar.application_challan_no,ar.arr_status_code,pt.property_type_code,pt.length,pt.width,pt.estimated_cost,pt.additional_cost"
    +",pt.premium_amount,pt.final_amount,pt.measurement_unit,pt.quota_code,pt.sub_quota_code,pt.subsidised_or_non_subsidised,pt.residential_or_commercial,pr.property_no "
    +"  FROM (select * from "+ db +".arrangement_info WHERE (arr_status_code = 'ALLOTTED' or arr_status_code='ALLOTMENT_PENDING') AND scheme_code=" + SqlString.escape(obj.scheme_code)  +" and sub_scheme_code="+SqlString.escape(obj.sub_scheme_code) +" ) ar "
    +"join "+ db +".property_info pr on pr.property_id = ar.property_id join "+ db +".property_type_info pt on pt.property_type_id = ar.property_type_id "
    mysqlPool.query(sql_fetchCurr, function (error, results) {
        if (error) {
            console.log("Error-->routes-->property-->allotment-->getAllAllotment", error)
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


router.get('/getDataForAllotment:dtls', (req, res) => {

    let objectToSend = {}

    let obj = JSON.parse(req.params.dtls);


    let db = "svayam_" + obj.b_acct_id + "_property";

    let sql_fetchCurr = "SELECT DISTINCT pr.property_no,pr.property_id FROM (SELECT * FROM "+ db +".property_info WHERE  "
    +"  property_id NOT IN (SELECT DISTINCT property_id FROM "+ db +".arrangement_info "
    +" WHERE scheme_code="+SqlString.escape(obj.scheme_code)+" AND sub_scheme_code="+SqlString.escape(obj.sub_scheme_code)+" AND arr_status_code IN ('ALLOTTED'))) pr "
    +"JOIN (SELECT * FROM "+ db +".property_type_info   WHERE scheme_code="+SqlString.escape(obj.scheme_code)+" " 
    +"AND sub_scheme_code="+SqlString.escape(obj.sub_scheme_code)+") pt ON pt.property_type_id = pr.property_type_id"
    
    let sql="SELECT arr.property_id,arr.id,concat(pp.party_name,' - ' ,arr.party_id) AS party_name,pp.party_id FROM (SELECT * FROM "+ db +".arrangement_info WHERE scheme_code="+SqlString.escape(obj.scheme_code)+"  "
   +" AND sub_scheme_code="+SqlString.escape(obj.sub_scheme_code)+"  AND id NOT IN (SELECT id FROM "+ db +".arrangement_info "
   +" WHERE scheme_code="+SqlString.escape(obj.scheme_code)+"  AND sub_scheme_code="+SqlString.escape(obj.sub_scheme_code)+" AND arr_type_code IN ('ALLOTTED') ) "
   +" AND arr_type_code='APPLIED' AND arr_status_code = 'APPLICATION_APPROVED' )arr JOIN "+ db +".party_info pp ON arr.party_id=pp.party_id"
   
    mysqlPool.query(sql_fetchCurr+";"+sql, function (error, results) {
        if (error) {
            console.log("Error-->routes-->property-->allotment-->getDataForAllotment", error)
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

router.post('/createAllotment', (req, res) => {
    let obj = req.body;

    let objectToSend = {}
    let db = "svayam_" + obj.b_acct_id + "_property";
    let create_timestamp = SqlString.escape(moment().format('YYYY-MM-DD HH:mm:ss'))

    let sql_insert = "SELECT * FROM "+ db +".arrangement_info where id = " + SqlString.escape(obj.id) +" and arr_type_code = 'APPLIED' and  arr_status_code = 'APPLICATION_APPROVED' "

    mysqlPool.getConnection(function (error, mysqlCon) {
        if (error) {
            console.log("Error-->routes-->property-->allotment-->createAllotment", error)
            objectToSend["error"] = true
            objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
            res.send(objectToSend);
        } else {
            mysqlCon.beginTransaction(function (error4) {
                if (error4) {
                    console.log("Error-->routes-->property-->allotment-->createAllotment", error4)
                    objectToSend["error"] = true
                    objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
                    res.send(objectToSend);
                    mysqlCon.release();
                } else {
                    mysqlCon.query(sql_insert, function (error1, results1) {
                        if (error1) {
                            console.log("Error-->routes-->property-->allotment-->createAllotment", error1)
                            objectToSend["error"] = true;
                            objectToSend["data"] = "Some error occured at server Side. Please try again later"
                            res.send(objectToSend)
                            mysqlCon.rollback();
                            mysqlCon.release()
                        } 
                           
                            
                           else if(results1.length != 0){
                               
                            let sql_insert3 = "insert into " + db + ".arrangement_info( property_type_id,arr_type_code,arr_effective_date,party_id,scheme_code,sub_scheme_code,property_id,booklet_amount,application_amount,booklet_challan_no,application_challan_no,arr_status_code,create_user_id,create_timestamp) values"
                            + " ( " + SqlString.escape(results1[0].property_type_id) + ",'ALLOTTED' ," + SqlString.escape(results1[0].arr_effective_date) + "," + SqlString.escape(results1[0].party_id) + "," 
                            + SqlString.escape(results1[0].scheme_code) + "," + SqlString.escape(results1[0].sub_scheme_code) + ","
                            + SqlString.escape(obj.property_id) + "," + SqlString.escape(results1[0].booklet_amount) +","
                             + SqlString.escape(results1[0].application_amount) + "," + SqlString.escape(results1[0].booklet_challan_no) +"," 
                             + SqlString.escape(results1[0].application_challan_no) +" , 'ALLOTMENT_PENDING'," + SqlString.escape(obj.create_user_id) + "," + create_timestamp + ") "
                        
                           
                           
                            mysqlCon.query(sql_insert3, function (error3, results3) {
                                if (error3) {
                                    console.log("Error-->routes-->property-->allotment-->createAllotment", error3)
                                    objectToSend["error"] = true;
                                    objectToSend["data"] = "Some error occured at server Side. Please try again later"
                                    res.send(objectToSend)
                                    mysqlCon.rollback();
                                    mysqlCon.release()
                                }
                                else{
                                let sql_insert3 = "update " + db + ".property_info set property_status= 'ALLOTTED'"  
                               
                                
                                
                                + " ,update_user_id=" + SqlString.escape(obj.create_user_id) 
                                + ", update_timestamp=" + create_timestamp
                                
                                +" where property_id=" + SqlString.escape(obj.property_id) 
                                
                                + " "
                            
                               
                               
                                mysqlCon.query(sql_insert3, function (error3, results3) {
                                    if (error3) {
                                        console.log("Error-->routes-->property-->allotment-->createAllotment", error3)
                                        objectToSend["error"] = true;
                                        objectToSend["data"] = "Some error occured at server Side. Please try again later"
                                        res.send(objectToSend)
                                        mysqlCon.rollback();
                                        mysqlCon.release()
                                    }
                                    
                                else {
                                   
        

                                    mysqlCon.query('COMMIT', function (error2) {
                                        if (error2) {
                                            console.log("Error-->routes-->property-->allotment-->createAllotment", error2)
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
                        }else{
                            mysqlCon.query('COMMIT', function (error2) {
                                if (error2) {
                                    console.log("Error-->routes-->property-->allotment-->createAllotment", error2)
                                    objectToSend["error"] = true;
                                    objectToSend["data"] = "Some error occured at server Side. Please try again later"
                                    res.send(objectToSend)
                                    mysqlCon.rollback();
                                    mysqlCon.release()
                                } else {
                                    objectToSend["error"] = false;
                                    objectToSend["data"] = "Data Not Found"
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



router.put('/updateAllotment', (req, res) => {
    let obj = req.body
    let db = "svayam_" + obj.b_acct_id + "_property";
    let update_timestamp = SqlString.escape(moment().format('YYYY-MM-DD HH:mm:ss'))

    let objectToSend = {}

                      let sql3 = "update " + db + ".arrangement_info set arr_effective_date=" + SqlString.escape(obj.arr_effective_date) 
                      + ", scheme_code=" + SqlString.escape(obj.scheme_code) 
                      + " , sub_scheme_code=" + SqlString.escape(obj.sub_scheme_code) 

                      + " , property_id=" + SqlString.escape(obj.property_id) 
                      
                      
                      + " ,update_user_id=" + SqlString.escape(obj.update_user_id) 
                      + ", update_timestamp=" + update_timestamp
                      
                      +" where id=" + SqlString.escape(obj.id) 
                      
                      + " and arr_type_code='ALLOTTED'"
                      mysqlPool.getConnection(function (error, mysqlCon) {
                        if (error) {
                            console.log("Error-->routes-->property-->allotment-->createAllotment", error)
                            objectToSend["error"] = true
                            objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
                            res.send(objectToSend);
                        } else {
                            mysqlCon.beginTransaction(function (error4) {
                                if (error4) {
                                    console.log("Error-->routes-->property-->allotment-->createAllotment", error4)
                                    objectToSend["error"] = true
                                    objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
                                    res.send(objectToSend);
                                    mysqlCon.release();
                                } else {
                                    mysqlCon.query(sql3, function (error, results3) {
                                if (error) {
                                    console.log("Error-->routes-->property-->allotment-->updateAllotment", error)
                                    objectToSend["error"] = true;
                                    objectToSend["data"] = "Some error occured at server Side. Please try again later"
                                    res.send(objectToSend)
                                    mysqlCon.rollback();
                                    mysqlCon.release()
                                } else {
                                    let sql_insert3 = "update " + db + ".property_info set property_status= 'ALLOTTED'"  
                               
                                
                                
                                + " ,update_user_id=" + SqlString.escape(obj.update_user_id) 
                                + ", update_timestamp=" + update_timestamp
                                
                                +" where property_id=" + SqlString.escape(obj.property_id) 
                                
                                + " "
                                let sql ="update " + db + ".property_info set property_status= 'UNALLOTTED'"  
                               
                                
                                
                                + " ,update_user_id=" + SqlString.escape(obj.update_user_id) 
                                + ", update_timestamp=" + update_timestamp
                                
                                +" where property_id=" + SqlString.escape(obj.old_property_id) 
                                
                                + " "
                               
                               
                                mysqlCon.query(sql_insert3 +";"+sql, function (error3, results3) {
                                    if (error3) {
                                        console.log("Error-->routes-->property-->allotment-->createAllotment", error3)
                                        objectToSend["error"] = true;
                                        objectToSend["data"] = "Some error occured at server Side. Please try again later"
                                        res.send(objectToSend)
                                        mysqlCon.rollback();
                                        mysqlCon.release()
                                    }
                                    
                                    else {
                                   
        

                                        mysqlCon.query('COMMIT', function (error2) {
                                            if (error2) {
                                                console.log("Error-->routes-->property-->allotment-->createAllotment", error2)
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

                                    })
                                }
                            })
                        }
                    })
})





router.put('/cancelAllotment', (req, res) => {
    let obj = req.body
    let db = "svayam_" + obj.b_acct_id + "_property";
    let update_timestamp = SqlString.escape(moment().format('YYYY-MM-DD HH:mm:ss'))

    let objectToSend = {}

                      let sql3 = "update " + db + ".arrangement_info set arr_status_code='CANCELLED'" 
                     

                      + " , property_id=" + SqlString.escape(obj.property_id) 
                      
                      
                      + " ,update_user_id=" + SqlString.escape(obj.update_user_id) 
                      + ", update_timestamp=" + update_timestamp
                      
                      +" where id=" + SqlString.escape(obj.id) 
                      
                      + " and arr_type_code='ALLOTTED'"

                      mysqlPool.getConnection(function (error, mysqlCon) {
                        if (error) {
                            console.log("Error-->routes-->property-->allotment-->createAllotment", error)
                            objectToSend["error"] = true
                            objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
                            res.send(objectToSend);
                        } else {
                            mysqlCon.beginTransaction(function (error4) {
                                if (error4) {
                                    console.log("Error-->routes-->property-->allotment-->createAllotment", error4)
                                    objectToSend["error"] = true
                                    objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
                                    res.send(objectToSend);
                                    mysqlCon.release();
                                } else {
                                    mysqlCon.query(sql3, function (error, results3) {
                                if (error) {
                                    console.log("Error-->routes-->property-->allotment-->updateAllotment", error)
                                    objectToSend["error"] = true;
                                    objectToSend["data"] = "Some error occured at server Side. Please try again later"
                                    res.send(objectToSend)
                                    mysqlCon.rollback();
                                    mysqlCon.release()
                                } else {
                                   
                                let sql ="update " + db + ".property_info set property_status= 'UNALLOTTED'"  
                               
                                
                                
                                + " ,update_user_id=" + SqlString.escape(obj.update_user_id) 
                                + ", update_timestamp=" + update_timestamp
                                
                                +" where property_id=" + SqlString.escape(obj.property_id) 
                                
                                + " "
                               
                               
                                mysqlCon.query(sql, function (error3, results3) {
                                    if (error3) {
                                        console.log("Error-->routes-->property-->allotment-->createAllotment", error3)
                                        objectToSend["error"] = true;
                                        objectToSend["data"] = "Some error occured at server Side. Please try again later"
                                        res.send(objectToSend)
                                        mysqlCon.rollback();
                                        mysqlCon.release()
                                    }
                                    
                                    else {
                                   
        

                                        mysqlCon.query('COMMIT', function (error2) {
                                            if (error2) {
                                                console.log("Error-->routes-->property-->allotment-->createAllotment", error2)
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

                                    })
                                }
                            })
                        }
                    })
})

router.put('/approveAllotment', (req, res) => {

    let objectToSend = {}
    let obj =req.body;
    let db = "svayam_" + obj.b_acct_id + "_property";
    let arr_status_code=SqlString.escape(obj.arr_status_code);
    let update_user_id=SqlString.escape(obj.update_user_id);
    let id=SqlString.escape(obj.id);
    let update_timestamp = SqlString.escape(moment().format('YYYY-MM-DD HH:mm:ss'))


    let sql = "update  "+db+".arrangement_info set arr_status_code="+arr_status_code+",update_user_id="+
    update_user_id+",update_timestamp="+update_timestamp+" where id="+id;

    console.log(sql)

    mysqlPool.query(sql, function (error, results) {
        if (error) {
            console.log("Error-->routes-->property-->allotment-->approveAllotment--", error)
            objectToSend["error"] = true
            objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
            res.send(objectToSend);
        } else {
            objectToSend["error"] = false
            objectToSend["data"] = 'Approved Successfully'
            res.send(objectToSend);
        }
    })
});

module.exports = router;
