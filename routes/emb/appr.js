var express = require('express');
var router = express.Router();
var propObj = require('../../config_con.js')
var mysqlPool = require('../../connections/mysqlConnection.js');

var SqlString = require('sqlstring');
var moment = require('moment')

router.get('/getWorkTenderId:dtls', (req, res) => {
    let objectToSend = {};

    let obj = JSON.parse(req.params.dtls);

    let b_acct_id = SqlString.escape(obj.b_acct_id);

    let sql = ""
       if(obj.doc_type=='EBILL'){
        sql="SELECT td.work_id,td.tender_id FROM svayam_" + b_acct_id + "_ebill.ebill_info t JOIN svayam_" + b_acct_id 
        + "_ebill.tender td ON t.tender_id=td.tender_id WHERE t.id="+SqlString.escape(obj.doc_local_no);
    } 
    if(obj.doc_type=='EMB'){
        sql="SELECT td.work_id,td.tender_id FROM svayam_" + b_acct_id + "_ebill.emb_info t JOIN svayam_" + b_acct_id 
        + "_ebill.tender td ON t.tender_id=td.tender_id WHERE t.id="+SqlString.escape(obj.doc_local_no);
    }           
    
    mysqlPool.query(sql, function (error, results) {
        if (error) {
            console.log("Error routes-->approve-->getWorkTenderId", error);
            objectToSend["error"] = true;
            objectToSend["data"] = "Server Side error! Please try again later. If problem persists, contact support"
            res.send(objectToSend)
        } else {
            objectToSend["error"] = false;
            objectToSend["data"] = results
            res.send(objectToSend)
        }
    })
});




router.get('/getApprbydoclocalno:dtls', (req, res) => {
    let objectToSend = {};

    let obj = JSON.parse(req.params.dtls);

    let b_acct_id = SqlString.escape(obj.b_acct_id);

    let sql = "Select zone_cd,role_cd,flag,forward_msg,id,user_id,vendor_id,DATE_FORMAT(`timestamp`,'%Y-%m-%d %H:%i:%S') AS `timestamp`,status,doc_type,doc_local_no,doc_desc,remark,forwarded_by from svayam_" + b_acct_id + "_ebill.appr where doc_type ="
    +SqlString.escape(obj.doc_type) + " and doc_local_no ="+SqlString.escape(obj.doc_local_no)+"  order by id";
    
    mysqlPool.query(sql, function (error, results) {
        if (error) {
            console.log("Error routes-->approve-->getApprbydoclocalno", error);
            objectToSend["error"] = true;
            objectToSend["data"] = "Server Side error! Please try again later. If problem persists, contact support"
            res.send(objectToSend)
        } else {
            objectToSend["error"] = false;
            objectToSend["data"] = results
            res.send(objectToSend)
        }
    })
});


router.get('/getPendingApprbydoclocalno:dtls', (req, res) => {
    let objectToSend = {};

    let obj = JSON.parse(req.params.dtls);

    let b_acct_id = SqlString.escape(obj.b_acct_id);

    let sql = "Select zone_cd,role_cd,flag,forward_msg,id,user_id,vendor_id,DATE_FORMAT(`timestamp`,'%Y-%m-%d %H:%i:%S') AS `timestamp`,status,doc_type,doc_local_no,doc_desc,remark,forwarded_by from svayam_" + b_acct_id + "_ebill.appr where doc_type ="
    +SqlString.escape(obj.doc_type) + " and doc_local_no ="+SqlString.escape(obj.doc_local_no)+" and status='PENDING'";

    mysqlPool.query(sql, function (error, results) {
        if (error) {
            console.log("Error routes-->approve-->getPendingApprbydoclocalno", error);
            objectToSend["error"] = true;
            objectToSend["data"] = "Server Side error! Please try again later. If problem persists, contact support"
            res.send(objectToSend)
        } else {
            objectToSend["error"] = false;
            objectToSend["data"] = results
            res.send(objectToSend)
        }
    })
});


router.get('/getDataForCertificate:dtls', (req, res) => {
    let objectToSend = {};

    let obj = JSON.parse(req.params.dtls);

    let b_acct_id = SqlString.escape(obj.b_acct_id);

    let sql = "Select zone_cd,role_cd,flag,forward_msg,id,user_id,vendor_id,DATE_FORMAT(`timestamp`,'%Y-%m-%d %H:%i:%S') AS `timestamp`,status,doc_type,doc_local_no,doc_desc,remark,forwarded_by from svayam_" + b_acct_id + "_ebill.appr_log where doc_type ="
    +SqlString.escape(obj.doc_type) + " and doc_local_no ="+SqlString.escape(obj.doc_local_no)+" order by id";
    
    mysqlPool.query(sql, function (error, results) {
        if (error) {
            console.log("Error routes-->approve-->getApprbydoclocalno", error);
            objectToSend["error"] = true;
            objectToSend["data"] = "Server Side error! Please try again later. If problem persists, contact support"
            res.send(objectToSend)
        } else {
            objectToSend["error"] = false;
            objectToSend["data"] = results
            res.send(objectToSend)
        }
    })
});





router.get('/getApprbyuserid:dtls', (req, res) => {
    let objectToSend = {};

    let obj = JSON.parse(req.params.dtls);

    let b_acct_id = SqlString.escape(obj.b_acct_id);
 let role_cd = SqlString.escape(obj.role_cd);


    let sql = "Select zone_cd,role_cd,flag,forward_msg,id,user_id,vendor_id,DATE_FORMAT(`timestamp`,'%Y-%m-%d %H:%i:%S') AS `timestamp`,status,doc_type,doc_local_no,doc_desc,remark,forwarded_by from svayam_" + b_acct_id 
    + "_ebill.appr where status = 'PENDING' and  user_id ="+SqlString.escape(obj.user_id)
	//+" and role_cd="+role_cd;
    //if(obj['zone_cd']!=undefined){
      //  if(obj['zone_cd']!=null){
        //    sql+=" and zone_cd="+SqlString.escape(obj.zone_cd);
       // }
  //  }
    
    mysqlPool.query(sql, function (error, results) {
        if (error) {
            console.log("Error routes-->approve-->getApprbyuserid", error);
            objectToSend["error"] = true;
            objectToSend["data"] = "Server Side error! Please try again later. If problem persists, contact support"
            res.send(objectToSend)
        } else {
            objectToSend["error"] = false;
            objectToSend["data"] = results
            res.send(objectToSend)
        }
    })
});


router.get('/getApprbyvendorid:dtls', (req, res) => {
    let objectToSend = {};

    let obj = JSON.parse(req.params.dtls);

    let b_acct_id = SqlString.escape(obj.b_acct_id);

    let sql = "Select zone_cd,role_cd,flag,forward_msg,id,user_id,vendor_id,DATE_FORMAT(`timestamp`,'%Y-%m-%d %H:%i:%S') AS `timestamp`,status,doc_type,doc_local_no,doc_desc,remark,forwarded_by from svayam_" + b_acct_id + "_ebill.appr where status = 'PENDING' and  vendor_id ="+SqlString.escape(obj.vendor_id);
    
    mysqlPool.query(sql, function (error, results) {
        if (error) {
            console.log("Error routes-->approve-->getApprbyvendorid", error);
            objectToSend["error"] = true;
            objectToSend["data"] = "Server Side error! Please try again later. If problem persists, contact support"
            res.send(objectToSend)
        } else {
            objectToSend["error"] = false;
            objectToSend["data"] = results
            res.send(objectToSend)
        }
    })
});

router.post('/insertforappr', (req, res) => {
    let obj = req.body;

    let objectToSend = {}
    let db = "svayam_" + obj.b_acct_id + "_ebill";
 let timestamp = SqlString.escape(moment().format('YYYY-MM-DD HH:mm:ss'))

   
    let sql_insert = "insert into " + db + ".appr (flag,role_cd,zone_cd,forward_msg,timestamp,vendor_id,user_id,forwarded_by,doc_type,doc_desc,status,doc_local_no,remark) values"
    
    
        sql_insert +=  " ("+SqlString.escape(obj.flag)+","+SqlString.escape(obj.role_cd)+","+SqlString.escape(obj.zone_cd)+","+SqlString.escape(obj.forward_msg)+","+timestamp+","+ SqlString.escape(obj.vendor_id) +","+ SqlString.escape(obj.user_id) +","+ SqlString.escape(obj.forwarded_by)+","+SqlString.escape(obj.doc_type) + ","+ SqlString.escape(obj.doc_desc) +","+SqlString.escape(obj.status) + "," + SqlString.escape(obj.doc_local_no) + "," + SqlString.escape(obj.remark) +  ") "
        
 
        let sql1 = "insert into " + db + ".appr_log (flag,role_cd,zone_cd,forward_msg,timestamp,vendor_id,user_id,forwarded_by,doc_type,doc_desc,status,doc_local_no,remark) values"
    
    
        sql1 +=  " ("+SqlString.escape(obj.flag)+","+SqlString.escape(obj.role_cd)+","+SqlString.escape(obj.zone_cd)+","+SqlString.escape(obj.forward_msg)+","+timestamp+","+ SqlString.escape(obj.vendor_id) +","+ SqlString.escape(obj.user_id) +","+ SqlString.escape(obj.forwarded_by)+","+SqlString.escape(obj.doc_type) + ","+ SqlString.escape(obj.doc_desc) +","+SqlString.escape(obj.status) + "," + SqlString.escape(obj.doc_local_no) + "," + SqlString.escape(obj.remark) +  ") "
    
 
        mysqlPool.getConnection(function(error1,mysqlCon){
            if(error1){
                console.log("Error routes-->approve-->insertforappr---->", error1);
                objectToSend["error"] = true;
                objectToSend["data"] = "Server Side error! Please try again later. If problem persists, contact support"
                res.send(objectToSend)
            }else{
                mysqlCon.beginTransaction(function(error2){
                    if(error2){
                        console.log("Error routes-->approve-->insertforappr---->", error2);
                        objectToSend["error"] = true;
                        objectToSend["data"] = "Server Side error! Please try again later. If problem persists, contact support"
                        res.send(objectToSend)
                        mysqlCon.release()
                    }else{
                        mysqlCon.query(sql_insert+";"+sql1,function(error3,results3){
                            if(error3){
                                console.log("Error routes-->approve-->insertforappr---->", error3);
                                objectToSend["error"] = true;
                                objectToSend["data"] = "Server Side error! Please try again later. If problem persists, contact support"
                                res.send(objectToSend)
                                mysqlCon.rollback()
                                mysqlCon.release()
                            }else{
                                mysqlCon.commit(function(error4){
                                    if(error4){
                                        console.log("Error routes-->approve-->insertforappr---->", error4);
                                        objectToSend["error"] = true;
                                        objectToSend["data"] = "Server Side error! Please try again later. If problem persists, contact support"
                                        res.send(objectToSend)
                                        mysqlCon.rollback()
                                        mysqlCon.release()
                                    }else{
                                        objectToSend["error"] = false;
                                        objectToSend["data"] = "Inserted successfully"
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
router.put('/updateappr', (req, res) => {
    let objectToSend = {};
    let obj = req.body;
 let timestamp = SqlString.escape(moment().format('YYYY-MM-DD HH:mm:ss'))
    let b_acct_id = SqlString.escape(obj.b_acct_id);
    let status = SqlString.escape(obj.status);
 let remark = SqlString.escape(obj.remark);
 let flag = SqlString.escape(obj.flag);
 let doc_type=SqlString.escape(obj.doc_type);
let doc_local_no=SqlString.escape(obj.doc_local_no);


    let sql = "update  svayam_"+ b_acct_id + "_ebill.appr SET  timestamp="+timestamp+",`status`= " + status + " ,  remark= " + remark 
            + " WHERE flag=" + flag +" and doc_type="+doc_type+" and doc_local_no="+doc_local_no;

    let sql1 = "update  svayam_"+ b_acct_id + "_ebill.appr_log SET  timestamp="+timestamp+",`status`= " + status + " ,  remark= " + remark 
                 + " WHERE flag=" + flag +" and doc_type="+doc_type+" and doc_local_no="+doc_local_no;

    if(obj['vendor_id']!=undefined){
        sql+= " and vendor_id="+SqlString.escape(obj.vendor_id);
        sql1+= " and vendor_id="+SqlString.escape(obj.vendor_id);

    }

    if(obj['user_id']!=undefined){
        sql+= " and user_id="+SqlString.escape(obj.user_id)+" and  role_cd="+SqlString.escape(obj.role_cd);
        sql1+= " and user_id="+SqlString.escape(obj.user_id)+" and role_cd="+SqlString.escape(obj.role_cd);;

    }

    mysqlPool.getConnection(function(error1,mysqlCon){
        if(error1){
            console.log("Error routes-->approve-->updateappr---->", error1);
            objectToSend["error"] = true;
            objectToSend["data"] = "Server Side error! Please try again later. If problem persists, contact support"
            res.send(objectToSend)
        }else{
            mysqlCon.beginTransaction(function(error2){
                if(error2){
                    console.log("Error routes-->approve-->updateappr---->", error2);
                    objectToSend["error"] = true;
                    objectToSend["data"] = "Server Side error! Please try again later. If problem persists, contact support"
                    res.send(objectToSend)
                    mysqlCon.release()
                }else{
                    mysqlCon.query(sql+";"+sql1,function(error3,results3){
                        if(error3){
                            console.log("Error routes-->approve-->updateappr---->", error3);
                            objectToSend["error"] = true;
                            objectToSend["data"] = "Server Side error! Please try again later. If problem persists, contact support"
                            res.send(objectToSend)
                            mysqlCon.rollback()
                            mysqlCon.release()
                        }else{
                            mysqlCon.commit(function(error4){
                                if(error4){
                                    console.log("Error routes-->approve-->updateappr---->", error4);
                                    objectToSend["error"] = true;
                                    objectToSend["data"] = "Server Side error! Please try again later. If problem persists, contact support"
                                    res.send(objectToSend)
                                    mysqlCon.rollback()
                                    mysqlCon.release()
                                }else{
                                    objectToSend["error"] = false;
                                    objectToSend["data"] = "Updated successfully"
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

});



router.post('/rejectAppr', (req, res) => {
    let obj = req.body;

    let objectToSend = {}
    let b_acct_id= obj.b_acct_id 
    let db = "svayam_" + obj.b_acct_id + "_ebill";
    let rejectObj=obj.rejected_obj
    let forwardObj=obj.forwarded_obj
 let timestamp = SqlString.escape(moment().format('YYYY-MM-DD HH:mm:ss'))
 let flag = SqlString.escape(forwardObj.flag);
 let role_cd = SqlString.escape(forwardObj.role_cd);

 let doc_type=SqlString.escape(forwardObj.doc_type);
let doc_local_no=SqlString.escape(forwardObj.doc_local_no);
let forwarded_by=SqlString.escape(rejectObj.user_id);
   let newflag=rejectObj.flag +1
   let sql_log_up = "update  svayam_"+ b_acct_id + "_ebill.appr_log SET  timestamp="+timestamp+",`status`= 'REJECTED',  remark= " + SqlString.escape(obj.remark) 
   + " WHERE flag=" + SqlString.escape(rejectObj.flag) +" and doc_type="+doc_type+" and doc_local_no="+doc_local_no;

 
        let sql1 = "insert into " + db + ".appr_log (flag,role_cd,zone_cd,forward_msg,timestamp,vendor_id,user_id,forwarded_by,doc_type,doc_desc,status,doc_local_no,remark) ( select "
    
    
        sql1 +=  " "+SqlString.escape(rejectObj.flag)+",role_cd,zone_cd,'',"+timestamp+",vendor_id,user_id,"
                        + forwarded_by+",doc_type,doc_desc,'SYSTEM REJECTED',doc_local_no,"+SqlString.escape(obj.remark)+"  from  " + db 
                        + ".appr  where flag>" + flag +" and status!='REVOKED' and doc_type="+doc_type+" and doc_local_no="+doc_local_no+" and flag!="+rejectObj.flag+")"
                        
        let del1=" delete from " + db + ".appr where flag>" + flag +" and doc_type="+doc_type+" and status not in ('REVOKED') and  doc_local_no="+doc_local_no


        let sql2 = "insert into " + db + ".appr_log (flag,role_cd,zone_cd,forward_msg,timestamp,vendor_id,user_id,forwarded_by,doc_type,doc_desc,status,doc_local_no,remark) (select "
    
    
        sql2 +=  " "+SqlString.escape(rejectObj.curr_flag)+",role_cd,zone_cd,"+forwarded_by+","+timestamp+",vendor_id,user_id,"
                        + forwarded_by+",doc_type,doc_desc,'SYSTEM REJECTED',doc_local_no,"+SqlString.escape(obj.remark)+"  from  " + db 
                        + ".appr  where role_cd=" + role_cd +" and doc_type="+doc_type+"  and status!='REVOKED' and doc_local_no="+doc_local_no +" and id!="+forwardObj.id+")"
    
        let del2= " delete from " + db + ".appr where role_cd=" + role_cd +" and doc_type="+doc_type+" and status not in ('REVOKED') and doc_local_no="+doc_local_no+" and id!="+forwardObj.id

        let updateQuery=" update  " + db + ".appr set status='PENDING', forwarded_by="+forwarded_by+ ",flag="+newflag+",remark="+SqlString.escape(obj.remark)+"   where id="+forwardObj.id

        let sql_log_insert= "insert into " + db + ".appr_log (flag,role_cd,zone_cd,forward_msg,timestamp,vendor_id,user_id,forwarded_by,doc_type,doc_desc,status,doc_local_no,remark) values  "
    
    
        sql_log_insert +=   " ("+newflag+","+SqlString.escape(forwardObj.role_cd)+","+SqlString.escape(forwardObj.zone_cd)+",'',"+timestamp+","
        + SqlString.escape(forwardObj.vendor_id) +","+ SqlString.escape(forwardObj.user_id) +","+ forwarded_by+","+SqlString.escape(forwardObj.doc_type) + ","
        + SqlString.escape(forwardObj.doc_desc) +",'PENDING'," + SqlString.escape(forwardObj.doc_local_no) + "," + SqlString.escape(obj.remark) +  ") "
        
        mysqlPool.getConnection(function(error1,mysqlCon){
            if(error1){
                console.log("Error routes-->approve-->rejectAppr---->", error1);
                objectToSend["error"] = true;
                objectToSend["data"] = "Server Side error! Please try again later. If problem persists, contact support"
                res.send(objectToSend)
            }else{
                mysqlCon.beginTransaction(function(error2){
                    if(error2){
                        console.log("Error routes-->approve-->rejectAppr---->", error2);
                        objectToSend["error"] = true;
                        objectToSend["data"] = "Server Side error! Please try again later. If problem persists, contact support"
                        res.send(objectToSend)
                        mysqlCon.release()
                    }else{
                        mysqlCon.query(sql_log_up+";"+sql1+";"+del1+";"+sql2+";"+del2,function(error3,results3){
                            if(error3){
                                console.log("Error routes-->approve-->rejectAppr---->", error3);
                                objectToSend["error"] = true;
                                objectToSend["data"] = "Server Side error! Please try again later. If problem persists, contact support"
                                res.send(objectToSend)
                                mysqlCon.rollback()
                                mysqlCon.release()
                            }else{
                                mysqlCon.query(updateQuery+";"+sql_log_insert,function(error31,results3){
                                    if(error31){
                                        console.log("Error routes-->approve-->rejectAppr---->", error31);
                                        objectToSend["error"] = true;
                                        objectToSend["data"] = "Server Side error! Please try again later. If problem persists, contact support"
                                        res.send(objectToSend)
                                        mysqlCon.rollback()
                                        mysqlCon.release()
                                    }else{
                                mysqlCon.commit(function(error4){
                                    if(error4){
                                        console.log("Error routes-->approve-->rejectAppr---->", error4);
                                        objectToSend["error"] = true;
                                        objectToSend["data"] = "Server Side error! Please try again later. If problem persists, contact support"
                                        res.send(objectToSend)
                                        mysqlCon.rollback()
                                        mysqlCon.release()
                                    }else{
                                        objectToSend["error"] = false;
                                        objectToSend["data"] = "Rejected successfully"
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

})

module.exports = router
