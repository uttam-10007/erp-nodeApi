var express = require('express');
var router = express.Router();
var SqlString = require('sqlstring');
var propObj = require('../../../config_con.js')
let mysqlPool = require('../../../connections/mysqlConnection.js');



router.get('/getAllRemainingLeaves:dtls',(req,res)=>{
    let objectToSend={}
    let obj=JSON.parse(req.params.dtls)

    let b_acct_id=obj["b_acct_id"]

    let emp_id=SqlString.escape(obj["b_acct_id"])
    let year=SqlString.escape(obj["year"])
    let month=SqString.escape(obj["month"])

    let halfValues=null
    if(month>=7){
        halfValues="7,8,9,10,11,12"
    }else{
        halfValues="1,2,3,4,5,6"
    }
    let qValues=null
    if(month<=3){
        qValues="1,2,3"
    }else if(month<=6){
        qValues="4,5,6"
    }else if(month<=9){
        qValues="7,8,9"
    }else{
        qValues="10,11,12"
    }

    

    let db="svayam_"+b_acct_id+"_hr"

    let sql="Select emp_id,leave_code,num_of_leaves,remaining_leaves from "
                +"(Select le.id,le.emp_id,le.leave_code,le.num_of_leaves,le.month,le.remaining_leaves,"
                    +"li.rate,li.carry,li.renew_ind_on_year_change"
                    +"from (Select * from "+db+".leave where year="+year+" and emp_id = "+emp_id+" ) le join"
                    +"(Select * from  "+db+".leave_info) li on le.leave_code=li.leave_code)x"
                    +"where rate='y' or (rate='m' and month in ("+month+")) or"
                    +"(rate='h' and month in ("+halfValues+")) or (rate='q' and month in ("+qValues+"))"

    mysqlPool.query(sql, function (error, results) {
        if (error) {
            console.log("Error-->routes-->hr-->setting-->leaveLedger-->getAllRemainingLeaves--", error)
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

router.get('/getLeaveRecords:dtls',(req,res)=>{
    let objectToSend={}
    let obj=JSON.parse(req.params.dtls)
    
    let b_acct_id=obj["b_acct_id"]
    let emp_id=obj["emp_id"]
    let leave_status_code=obj["leave_status_code"]
    let year=obj["year"]
    let month=obj["month"]
    
    let sql="Select id,emp_id,leave_code,num_of_days,leave_status_code,year,DATE_FORMAT(application_date,'%Y-%m-%d') as application_date,"
            +" DATE_FORMAT(approval_date,'%Y-%m-%d') as approval_date,DATE_FORMAT(from_date,'%Y-%m-%d') as from_date,leave_reason,approval_user_id,month from "
            +" svayam_"+b_acct_id+"_hr.leave_ledger "

    let flag=true
    if(emp_id!=undefined){
        sql+=" where emp_id="+SqlString.escape(emp_id)
        flag=false
    }
    if(year!=undefined){
        if(flag){
            sql+=" where year="+SqlString.escape(year)
            flag=false;
        }else{
            sql+=" and year="+SqlString.escape(year)
        }
    }
    if(month!=undefined){
        if(flag){
            sql+=" where month="+SqlString.escape(month)
            flag=false;
        }else{
            sql+=" and month="+SqlString.escape(month)
        }
    }
    if(leave_status_code!=undefined){
        if(flag){
            sql+=" where leave_status_code="+SqlString.escape(leave_status_code)
            flag=false;
        }else{
            sql+=" and leave_status_code="+SqlString.escape(leave_status_code)
        }
    }
    mysqlPool.query(sql,function(error,results){
        if(error){
            console.log("Error-->routes-->hr-->setting-->leaveledger-->getLeaveRecords", error)
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

router.post('/applyForLeave',(req,res)=>{
    let objectToSend={}

    let obj=req.body

    let b_acct_id=obj["b_acct_id"]
    let emp_id=SqlString.escape(obj["emp_id"])
    let leave_code=SqlString.escape(obj["leave_code"])
    let num_of_days=SqlString.escape(obj["num_of_days"])
    let leave_status_code=SqlString.escape(obj["leave_status_code"])
    let leave_reason=SqlString.escape(obj["leave_reason"])
    let from_date=SqlString.escape(obj["from_date"])
    
    let year=SqlString.escape(obj["year"])
    let month=SqlString.escape(obj["month"])
    let application_date=SqlString.escape(obj["application_date"])

    let sql="insert into svayam_"+b_acct_id+"_hr.leave_ledger (emp_id,leave_code,num_of_days,leave_status_code,year,application_date,from_date,leave_reason,month) values"
            +"("+emp_id+","+leave_code+","+num_of_days+","+leave_status_code+","+year+","+application_date+","+from_date+","+leave_reason+","+month+")"

    mysqlPool.query(sql,function(error,results){
        if(error){
            console.log("Error-->routes-->hr-->settinge-->leaveledger-->applyForLeave", error)
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

router.put('/approveLeave',(req,res)=>{
    let objectToSend={}
    let obj=req.body

    let b_acct_id=obj["b_acct_id"]
    let leave_ledger_id=SqlString.escape(obj["id"])
    let approval_user_id=SqlString.escape(obj["approval_user_id"])
    let leave_status_code = SqlString.escape(obj["leave_status_code"]);
    let approval_date=SqlString.escape(moment().format('YYYY-MM-DD'))
    let emp_id=SqlString.escape(obj["emp_id"])
    let year=SqlString.escape(obj["year"])
    let month=SqlString.escape(obj["month"])
    let leave_code=SqlString.escape(obj["leave_code"])
    let num_of_days=SqlString.escape(obj["num_of_days"])

    let sql="update svayam_"+b_acct_id+"_hr.leave_ledger set approval_date="+approval_date+",leave_status_code="+leave_status_code+",approval_user_id="+approval_user_id+" where id="+leave_ledger_id

    let sql_updRem="update svayam_"+b_acct_id+"_hr.leave set remaining_leaves=remaining_leaves-"+num_of_days+" where year="+year+" and month="+month+" and emp_id="+emp_id
                +" and leave_code="+leave_code
    mysqlPool.getConnection(function(error,mysqlCon){
        if(error){
            console.log("Error-->routes-->hr-->setting-->leaveLedger-->approveLeave", error)
            objectToSend["error"] = true
            objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
            res.send(objectToSend);  
        }else{
            mysqlCon.beginTransaction(function(error1){
                if(error1){
                    console.log("Error-->routes-->hr-->setting-->leaveLedger-->approveLeave", error1)
                    objectToSend["error"] = true
                    objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
                    res.send(objectToSend);
                    mysqlCon.release()
                }else{
                    mysqlCon.query(sql+";"+sql_updRem,function(error2,results2){
                        if(error2){
                            console.log("Error-->routes-->hr-->setting-->leaveLedger-->approveLeave", error2)
                            objectToSend["error"] = true
                            objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
                            res.send(objectToSend);
                            mysqlCon.rollback()
                            mysqlCon.release()
                        }else{
                            mysqlCon.commit(function(error3){
                                if(error3){
                                    console.log("Error-->routes-->hr-->setting-->leaveLedger-->approveLeave", error3)
                                    objectToSend["error"] = true
                                    objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
                                    res.send(objectToSend);
                                    mysqlCon.rollback()
                                    mysqlCon.release()
                                }else{
                                    objectToSend["error"] = false
                                    objectToSend["data"] = "Leave Approved" 
                                    res.send(objectToSend);
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

router.put('/rejectLeave',(req,res)=>{
    let objectToSend={}
    let obj=req.body

    let b_acct_id=obj["b_acct_id"]
    let leave_ledger_id=SqlString.escape(obj["id"])
    let approval_user_id=SqlString.escape(obj["approval_user_id"])
    let leave_status_code = SqlString.escape(obj["leave_status_code"]);
    let approval_date=SqlString.escape(moment().format('YYYY-MM-DD'))

    let sql="update svayam_"+b_acct_id+"_hr.leave_ledger set approval_date="+approval_date+",leave_status_code="+leave_status_code+",approval_user_id="+approval_user_id+" where id="+leave_ledger_id

    mysqlPool.query(sql,function(error,results){
        if(error){
            console.log("Error-->routes-->hr-->setting-->leaveLedger-->RejectLeave", error)
            objectToSend["error"] = true
            objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
            res.send(objectToSend);
        }else{
            objectToSend["error"] = false
            objectToSend["data"] = "Leave Rejected"
            res.send(objectToSend);
        }
    })

})

router.get('/getRemainingLifetimeLeaves:dtls',(req,res)=>{
    let objectToSend={}

    let obj=JSON.parse(req.params.dtls)

    let b_acct_id=obj["b_acct_id"]
    let emp_id=obj["emp_id"];
    let emp_filter=""

    if(emp_id!=undefined){
        emp_filter=" where emp_id="+SqlString.escape(emp_id)
    }

    let sql="Select le.emp_id,le.leave_code,le.num_of_leaves,le.remaining_leaves,le.create_user_id,le.update_user_id,"
    +"DATE_FORMAT(le.create_timestamp,'%Y-%m-%d %H:%i:%S') as create_timestamp,DATE_FORMAT(le.update_timestamp,'%Y-%m-%d %H:%i:%S') as "
    +"update_timestamp from (Select * from svayam_"+b_acct_id+"_hr.leave "+emp_filter+" ) le join"
    +" (Select * from svayam_"+b_acct_id+"_hr.leave_info where rate='l')li "
    +" on le.leave_code=li.leave_code "

    mysqlPool.query(sql,function(error,results){
        if(error){
            console.log("Error-->routes-->hr-->setting-->leaveLedger-->getRemainingLifetimeLeaves", error)
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

router.put('/approveLifetimeLeave',(req,res)=>{
    let objectToSend={}
    let obj=req.body

    let b_acct_id=obj["b_acct_id"]
    let leave_ledger_id=SqlString.escape(obj["id"])
    let approval_user_id=SqlString.escape(obj["approval_user_id"])
    let leave_status_code = SqlString.escape(obj["leave_status_code"]);
    let approval_date=SqlString.escape(moment().format('YYYY-MM-DD'))
    let emp_id=SqlString.escape(obj["emp_id"])
    let leave_code=SqlString.escape(obj["leave_code"])
    let num_of_days=SqlString.escape(obj["num_of_days"])

    let sql="update svayam_"+b_acct_id+"_hr.leave_ledger set approval_date="+approval_date+",leave_status_code="+leave_status_code+",approval_user_id="+approval_user_id+" where id="+leave_ledger_id

    let sql_updRem="update svayam_"+b_acct_id+"_hr.leave set remaining_leaves=remaining_leaves-"+num_of_days+" where  emp_id="+emp_id
                +" and leave_code="+leave_code
    mysqlPool.getConnection(function(error,mysqlCon){
        if(error){
            console.log("Error-->routes-->hr-->setting-->leaveLedger-->approveLeave", error)
            objectToSend["error"] = true
            objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
            res.send(objectToSend);  
        }else{
            mysqlCon.beginTransaction(function(error1){
                if(error1){
                    console.log("Error-->routes-->hr-->setting-->leaveLedger-->approveLeave", error1)
                    objectToSend["error"] = true
                    objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
                    res.send(objectToSend);
                    mysqlCon.release()
                }else{
                    mysqlCon.query(sql+";"+sql_updRem,function(error2,results2){
                        if(error2){
                            console.log("Error-->routes-->hr-->setting-->leaveLedger-->approveLeave", error2)
                            objectToSend["error"] = true
                            objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
                            res.send(objectToSend);
                            mysqlCon.rollback()
                            mysqlCon.release()
                        }else{
                            mysqlCon.commit(function(error3){
                                if(error3){
                                    console.log("Error-->routes-->hr-->setting-->leaveLedger-->approveLeave", error3)
                                    objectToSend["error"] = true
                                    objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
                                    res.send(objectToSend);
                                    mysqlCon.rollback()
                                    mysqlCon.release()
                                }else{
                                    objectToSend["error"] = false
                                    objectToSend["data"] = "Leave Approved" 
                                    res.send(objectToSend);
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


module.exports=router;
