var express = require('express');
var router = express.Router();




var propObj = require('../../../config_con')
try {
    var mysqlPool = require('../../../connections/mysqlConnection');
} catch (ex) {
    console.log("Error-->routes-->controls->accountingPeriod--", ex)
}
var SqlString = require('sqlstring');


router.post('/createEventRecord',(req,res)=>{
    let obj=req.body

    let b_acct_id=obj["b_acct_id"]
    let objectToSend={}
    let event_code=obj["event_code"]
    let event_desc=obj["event_desc"]
    let event_type=obj["event_type"]
    let event_date=obj["event_date"]
    let event_layout_code=obj["event_layout_code"]
    let event_record=JSON.stringify(obj["event_record"])
    let status=obj["status"]
    let event_id=obj["event_id"]
    
    
    let sql_insert="insert into svayam_"+b_acct_id+"_data.events (event_date,event_code,event_desc,event_type,event_layout_code,event_record,status,event_id) values"
            +"("+SqlString.escape(event_date)+","+SqlString.escape(event_code)+","+SqlString.escape(event_desc)+","+SqlString.escape(event_type)
            +","+SqlString.escape(event_layout_code)+","+SqlString.escape(event_record)+","+SqlString.escape(status)+","+SqlString.escape(event_id)+")"

    mysqlPool.query(sql_insert,function(error,results){
        if(error){
            console.log("Error-->routes-->events-->eventRecords-->createEventRecord--", error)
            objectToSend["error"] = true
            objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
            res.send(objectToSend);
        }else{
            objectToSend["error"] = false
            objectToSend["data"] = results.insertId
            res.send(objectToSend);
        }
    })
})

router.get('/getAllEventRecords:dtls',(req,res)=>{
    let objectToSend={}

    let obj=JSON.parse(req.params.dtls)

    let b_acct_id=obj["b_acct_id"]
    let status=obj["status"]
    let event_code=obj["event_code"]

    let sql="Select id,event_code,event_desc,event_type,DATE_FORMAT(event_date,'%Y-%m-%d') as event_date,event_layout_code,"
            +"event_record,status,event_id from svayam_"+b_acct_id+"_data.events"

    let flag=true
    if(status!=undefined){
        sql+=" where status="+SqlString.escape(status)
        flag=false
    }
    if(event_code!=undefined){
        if(flag){
            sql+=" where event_code="+SqlString.escape(event_code)
        }
        else{
            sql+=" and event_code="+SqlString.escape(event_code)
        }
    }

    sql="Select event_id,event_desc,event_date,status from ("+sql+")x group by event_id,event_desc,event_date,status"

    mysqlPool.query(sql_insert,function(error,results){
        if(error){
            console.log("Error-->routes-->events-->eventRecords-->getAllEventRecords--", error)
            objectToSend["error"] = true
            objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
            res.send(objectToSend);
        }else{
            objectToSend["error"] = false
            objectToSend["data"] = results
            res.send(objectToSend);
        }
    })
})

router.get('/getEventRecords:dtls',(req,res)=>{
    let objectToSend={}

    let obj=JSON.parse(req.params.dtls)

    let b_acct_id=obj["b_acct_id"]
    let event_id=obj["event_id"]

    let sql_fetch="Select id,event_code,event_desc,event_type,DATE_FORMAT(event_date,'%Y-%m-%d') as event_date,"
        +"event_layout_code,event_record,status from svayam_"+b_acct_id+"_data.events where event_id="+event_id

    mysqlPool.query(sql_fetch,function(error,results){
        if(error){
            console.log("Error-->routes-->events-->eventRecords-->getEventRecords--", error)
            objectToSend["error"] = true
            objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
            res.send(objectToSend);
        }else{
            objectToSend["error"] = false
            objectToSend["data"] = results
            res.send(objectToSend);
        }
    })
})




router.delete('/deleteEvRecords:dtls',(req,res)=>{
    let objectToSend={}

    let obj=JSON.parse(req.params.dtls);

    let b_acct_id=obj["b_acct_id"]
    let arr=obj["event_id"]
    let sql ="delete from svayam_"+b_acct_id+"_data.events  where event_id in ("+arr.join(",") +")"
    
    mysqlPool.query(sql,function(error,results){
        if(error){
            console.log("Error-->routes-->events-->eventRecords-->deleteEventRecord--", error)
            objectToSend["error"] = true
            objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
            res.send(objectToSend); 
        }else{
            objectToSend["error"] = false
            objectToSend["data"] = "Event deleted successfully"
            res.send(objectToSend); 
        }
    })
})

router.post('/processevent', function (req, res) {

    var obj = req.body;

    var objectToSend = {};
    let args = "";
 

    let query = "insert into svayam_" + obj.b_acct_id + "_data.activity_status (activity_type,activity_msg,activity_status,detailed_msg) values"
        + " ('PROCESS','Records scheduled for processing','SCHEDULED','Records scheduled for processing')";

    mysqlPool.query(query, function (error, results) {
        if (error) {
            console.log("Error-->routes-->events-->eventRecords-->processevent--", error);
            objectToSend["error"] = true;
            objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
            res.end(JSON.stringify(objectToSend))
        } else {
            let activity_status_id = results.insertId;
            //obj["activity_status_id"] = act_stat_id
            if (obj["records"] == undefined) {
                args = JSON.stringify(obj)
                args = SqlString.escape(args)
                args = args.substring(1, args.length - 1)
            } else {


                //obj["records"] = JSON.stringify(obj["records"])
                args = SqlString.escape(JSON.stringify(obj))
                args = args.substring(1, args.length - 1)

            }
            const exec = require('child_process').exec;
            exec('java -jar jars/ProcessData.jar  ' + activity_status_id + '  ' +obj.b_acct_id + ' "'+ args + '" ', function (err, stdout, stderr) {
                if (err) {

                    console.log("Error-->routes-->events-->eventRecords-->processevent--", err);
                    objectToSend["error"] = true;
                    objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
                    res.end(JSON.stringify(objectToSend))

                } else {
                    
                }
                if (stderr) {
                    console.log("Error-->routes-->events-->eventRecords-->processevent----STDERR", stderr);
                }

            });
            objectToSend["error"] = false;
            objectToSend["data"] = "Request Submitted"
            res.end(JSON.stringify(objectToSend))
        }
    })




});


module.exports=router;