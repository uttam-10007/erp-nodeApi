var express = require('express');
var router = express.Router();




var propObj = require('../../../config_con')
try {
    var mysqlPool = require('../../../connections/mysqlConnection');
} catch (ex) {
    console.log("Error-->routes-->controls->accountingPeriod--", ex)
}
var SqlString = require('sqlstring');


router.get('/getAllEvents:dtls',(req,res)=>{
    let objectToSend={}

    let obj=JSON.parse(req.params.dtls)

    let b_acct_id=obj["b_acct_id"]

    let event_type=obj["event_type"]

    let sql_fetch="Select * from svayam_"+b_acct_id+"_data.events_info "

    if(event_type!=undefined){
        sql_fetch+=" where event_type="+SqlString.escape(event_type)
    }
    
    

    mysqlPool.query(sql_fetch,function(error,results){
        if(error){
            console.log("Error-->routes-->events-->eventsInfo-->getAllEvents--", error)
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


router.post('/createEvent',(req,res)=>{
    let obj=req.body
    let objectToSend={}
    let b_acct_id=obj["b_acct_id"]

    let event_name=obj["event_name"]
    let event_description=obj["event_description"]
    let event_code=obj["event_code"]
    let event_type=obj["event_type"]
    let event_layout_code=obj["event_layout_code"]
    let event_layout_name=obj["event_layout_name"]
    
    let sql_insert="insert into svayam_"+b_acct_id+"_data.events_info (event_name,event_description,event_code,event_type,event_layout_code,event_layout_name) values"
            +"("+SqlString.escape(event_name)+","+SqlString.escape(event_description)+","+SqlString.escape(event_code)+","+SqlString.escape(event_type)+","+SqlString.escape(event_layout_code)+","+SqlString.escape(event_layout_name)+")"

    mysqlPool.query(sql_insert,function(error,results){
        if(error){
            console.log("Error-->routes-->events-->eventinfo-->createEvent--", error)
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

router.put('/updateEvent',(req,res)=>{
    let objectToSend={}

    let obj=req.body

    let b_acct_id=obj["b_acct_id"]

    let event_name=obj["event_name"]
    let event_description=obj["event_description"]
    let event_code=obj["event_code"]
    let event_type=obj["event_type"]
    let event_layout_code=obj["event_layout_code"]
    let event_layout_name=obj["event_layout_name"]

    let event_id=obj["event_id"]

    let sql_update="update svayam_"+b_acct_id+"_data.events_info set event_name="+SqlString.escape(event_name)+",event_description="+SqlString.escape(event_description)+",event_code="+SqlString.escape(event_code)+",event_type="+SqlString.escape(event_type)+",event_layout_code="+SqlString.escape(event_layout_code)+",event_layout_name="+SqlString.escape(event_layout_name)+" where event_id="+SqlString.escape(event_id)

    mysqlPool.query(sql_update,function(error,results){
        if(error){
            console.log("Error-->routes-->events-->eventRecords-->updateEventRecord--", error)
            objectToSend["error"] = true
            objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
            res.send(objectToSend); 
        }else{
            objectToSend["error"] = false
            objectToSend["data"] = "Record updated successfully"
            res.send(objectToSend); 
        }
    })
})

router.delete('/deleteEvent:dtls',(req,res)=>{
    let objectToSend={}

    let obj=JSON.parse(req.params.dtls);

    let b_acct_id=obj["b_acct_id"]
    let event_id=obj["event_id"]

    let sql="delete from svayam_"+b_acct_id+"_data.events_info where event_id="+SqlString.escape(event_id)

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



module.exports=router;