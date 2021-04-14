var express = require('express');
var router = express.Router();
var SqlString = require('sqlstring');
var propObj = require('../../../config_con')
try {
    var mysqlPool = require('../../../connections/mysqlConnection.js');
} catch (ex) {
    console.log("Error-->routes-->controls->activityDashboard--", ex)
}

router.get('/getorganisation:dtls', function (req, res) {

    
    var objectToSend = {};

    let db='svayam_'+req.params.dtls+'_data';

    let sql="select  * from " + db+ ".ref_organisation ";

    mysqlPool.query(sql,function(error,results){
        if(error){
            console.log("Error-->routes-->referenceData-->referenceInfo-->getorganisation-->", error)
            objectToSend["error"] = true
            objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
            res.send(objectToSend);
        }else{
            objectToSend["error"] = false
            objectToSend["data"] = results;
            res.send(objectToSend);
        }
    })
   
});


router.get('/getactivityStatusofAccount:dtls', function (req, res) {

    var b_acct_id = req.params.dtls;
    
    var objectToSend = {};
    var db="svayam_"+b_acct_id+"_data";
    
    var sqlQuery = "select activity_id,activity_msg,activity_type,activity_status,detailed_msg,DATE_FORMAT(in_time,'%Y-%m-%d') as in_time,DATE_FORMAT(end_time,'%Y-%m-%d') as end_time,user_id from " + db + ".activity_status order by in_time  ";

    mysqlPool.query(sqlQuery, function (error, results, fields) {
        if (error) {
            console.log("Error-->routes-->controls-->activityDashboard-->getactivityStatusofAccount", error);
            objectToSend["error"] = true;
            objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
            res.send(objectToSend)
        }
        else {
            objectToSend["error"] = false;
            objectToSend["data"] = results;
            res.send((objectToSend))
         }
    });
    
});

router.delete('/deleteactivityStatusofAccount:dtls', function (req, res) {

    var obj = JSON.parse(req.params.dtls);
    var b_acct_id=obj.b_acct_id;
    var ids=obj.ids;
    
    var objectToSend = {};
    var db="svayam_"+b_acct_id+"_data";
    
    
    var sqlQuery = "delete  from " + db + ".activity_status where activity_id in ("+ids+")";

    mysqlPool.query(sqlQuery, function (error, results, fields) {
        if (error) {
            console.log("Error-->routes-->controls-->activityDashboard-->deleteactivityStatusofAccount", error);
            objectToSend["error"] = true;
            objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
            res.send(objectToSend)
        }
        else {
            objectToSend["error"] = false;
            objectToSend["data"] = "Deleted Successfully";
            res.send((objectToSend))
         }
    });
    
});

router.get('/activityStatus:dtls', function (req, res) {

    var b_acct_id = req.params.dtls;
    
    var objectToSend = {};
    var db="svayam_"+b_acct_id+"_data";
    
    var sqlQuery = "select *  from " + db + ".activity_status ";

    mysqlPool.query(sqlQuery, function (error, results, fields) {
        if (error) {
            console.log("Error-->routes-->controls-->activityDashboard-->activityStatus", error);
            objectToSend["error"] = true;
            objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
            res.send(objectToSend)
        }
        else {
            objectToSend["error"] = false;
            objectToSend["data"] = results;
            res.send((objectToSend))
         }
    });
    
});
router.get('/getallPpd:dtls', function (req, res) {
    
     var b_acct_id = req.params.dtls;
     var db="svayam_"+b_acct_id+"_data";
     var objectToSend = {};
     
     var sqlQuery = "select DATE_FORMAT(ppd,'%Y-%m-%d') as ppd ,status from " + db + ".ppd_info";
     mysqlPool.query(sqlQuery, function (error, results, fields) {
         if (error) {
             console.log("Error-->routes-->controls-->activityDashboard-->getPpds", error);
             objectToSend["error"] = true;
             objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
             res.end(JSON.stringify(objectToSend))
         }
         else {
             objectToSend["error"] = false;
             objectToSend["data"] = results;
             res.send(JSON.stringify(objectToSend))
         }
     });
 
 });

 router.get('/getPpdRunIds:dtls', function (req, res) {
    
    var b_acct_id = req.params.dtls;
  
    var objectToSend = {};
    let db="svayam_"+b_acct_id+"_data";  
    var sqlQuery = "select run_id,DATE_FORMAT(ppd,'%Y-%m-%d') as ppd  from " + db + ".batch_status ";
    mysqlPool.query(sqlQuery, function (error, results, fields) {
        if (error) {
            console.log("Error-->routes-->controls-->activityDashboard-->getPpdRunIds", error);
            objectToSend["error"] = true;
            objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
            res.end(JSON.stringify(objectToSend))
        }
        else {
            objectToSend["error"] = false;
            objectToSend["data"] = results;
            res.send(JSON.stringify(objectToSend))
        }
    });

});
 
router.get('/getActivities:dtls', function (req, res) {
    
    var b_acct_id = req.params.dtls;
  
    var objectToSend = {};
    var db="svayam_"+b_acct_id+"_data";
    var sqlQuery = "select id,run_id,organisation_code,process_name,DATE_FORMAT(ppd,'%Y-%m-%d') as ppd,num_of_records from " + db + ".batch_status ";
    mysqlPool.query(sqlQuery, function (error, results, fields) {
        if (error) {
            console.log("Error-->routes-->controls-->activityDashboard-->getRunIds", error);
            objectToSend["error"] = true;
            objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
            res.end(JSON.stringify(objectToSend))
        }
        else {
            objectToSend["error"] = false;

            objectToSend["data"] = results;
            res.send(JSON.stringify(objectToSend))
        }
    });

});

router.get('/balanceReconciliation:dtls',(req,res)=>{

    let objectToSend={}

    let obj=JSON.parse(req.params.dtls)
  
    let acct_id=obj.acct_id;
    let start_date=obj.start_date;
    let end_date=obj.end_date;

    let db="svayam_"+acct_id+"_data";

    let balanceReconciliation="select r.event_cd,sum(r.amount) as amount from  " + db 
    + ".ref_balance_reconciliation r where ppd BETWEEN "+SqlString.escape(start_date)+" and "+ SqlString.escape(end_date)+" group by r.event_cd";
    
    mysqlPool.query(balanceReconciliation,function(error,results){
        if(error){
            console.log("Error-->routes-->controls-->activityDashboard-->balanceReconciliation--", error)
            objectToSend["error"] = true
            objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
            res.send(objectToSend);
        }else{
            objectToSend["error"] = false
            objectToSend["data"] = results;
            res.send(objectToSend);
        }
    })
});





module.exports = router;
