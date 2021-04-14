var express = require('express');
var router = express.Router();
var SqlString = require('sqlstring');
var propObj = require('../../../config_con')
let mysqlPool = require('../../../connections/mysqlConnection');
var moment=require('moment')

router.get('/getAllLeaveInfo:dtls',(req,res)=>{
    let objectToSend={}
    let obj=JSON.parse(req.params.dtls)

    let sql="Select id,leave_code,num_of_leaves,rate,carry,renew_ind_on_year_change,create_user_id,update_user_id,"
    +"DATE_FORMAT(create_timestamp,'%Y-%m-%d %H:%i:%S') as create_timestamp,DATE_FORMAT(update_timestamp,'%Y-%m-%d %H:%i:%S') as "
    +"update_timestamp, days_per_unit from svayam_"+obj.b_acct_id+"_hr.leave_info "
   
    mysqlPool.query(sql,function(error,results){
        if(error){
            console.log("Error-->routes-->hr-->setting-->leave_info-->getAllLeaveInfo", error)
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

router.delete('/deleteleaveInfo:dtls',(req,res)=>{
    let objectToSend={}
    let obj=JSON.parse(req.params.dtls)

    let sql="delete from svayam_"+obj.b_acct_id+"_hr.leave_info where id="+obj.id
   
    mysqlPool.query(sql,function(error,results){
        if(error){
            console.log("Error-->routes-->hr-->setting-->leave_info-->deleteleaveInfo", error)
            objectToSend["error"] = true
            objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
            res.send(objectToSend);
        }else{
            objectToSend["error"] = false
            objectToSend["data"] = "Deleted Successfully." 
            res.send(objectToSend);
        }
    })
})


router.post('/defineLeaveForemp',(req,res)=>{
    let objectToSend={}
    let obj=req.body

    let b_acct_id=obj["b_acct_id"]
    let leave_code=SqlString.escape(obj["leave_code"])
    let num_of_leaves=SqlString.escape(obj["num_of_leaves"])
    let rate=SqlString.escape(obj["rate"])
    let carry=SqlString.escape(obj["carry"])
    let days_per_unit=SqlString.escape(obj["days_per_unit"])
    let renew_ind_on_year_change=SqlString.escape(obj["renew_ind_on_year_change"])
    let create_user_id=SqlString.escape(obj["create_user_id"])
    let create_timestamp=SqlString.escape(moment().format('YYYY-MM-DD HH:mm:ss'))

    let sql="insert into svayam_"+b_acct_id+"_hr.leave_info (days_per_unit,leave_code,num_of_leaves,rate,carry,renew_ind_on_year_change,create_user_id,create_timestamp) values "
            +"("+days_per_unit+","+leave_code+","+num_of_leaves+","+rate+","+carry+","+renew_ind_on_year_change+","+create_user_id+","+create_timestamp+")"

    mysqlPool.query(sql,function(error,results){
        if(error){
            console.log("Error-->routes-->hr-->setting-->leave_info-->defineLeaveForemp", error)
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


router.put('/updateLeaveinfo',(req,res)=>{
    let objectToSend={}

    let obj=req.body

    let b_acct_id=obj["b_acct_id"]
    let num_of_leaves=SqlString.escape(obj["num_of_leaves"])
    let days_per_unit=SqlString.escape(obj["days_per_unit"])
    let rate=SqlString.escape(obj["rate"])
  

    let carry=SqlString.escape(obj["carry"])
    let renew_ind_on_year_change=SqlString.escape(obj["renew_ind_on_year_change"])
    let leave_code=SqlString.escape(obj["leave_code"])
    let id=SqlString.escape(obj["id"])
    let update_user_id=SqlString.escape(obj["update_user_id"])
    let update_timestamp=SqlString.escape(moment().format('YYYY-MM-DD HH:mm:ss'))

    let sql="update svayam_"+b_acct_id+"_hr.leave_info set num_of_leaves="+num_of_leaves+", rate="+rate+", carry="+carry+"  "
            +",renew_ind_on_year_change="+renew_ind_on_year_change+",leave_code="+leave_code+",update_user_id="+update_user_id+",update_timestamp="+update_timestamp+",days_per_unit="+days_per_unit+" where id="+id

    mysqlPool.query(sql,function(error,results){
        if(error){
            console.log("Error-->routes-->hr-->setting-->leave_info-->updateLeaveinfo", error)
            objectToSend["error"] = true
            objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
            res.send(objectToSend);
        }else{
            objectToSend["error"] = false
            objectToSend["data"] = "Updated successfully" 
            res.send(objectToSend);
        }
    })

})
router.post('/carryForwardLeaves',(req,res)=>{

    let objectToSend={}
    let obj=req.body

    let b_acct_id=obj["b_acct_id"]
    let year=parseInt(obj["year"])
    let month=parseInt(obj["month"])
    let create_user_id=SqlString.escape(obj["create_user_id"])
    let create_timestamp=SqlString.escape(moment().format('YYYY-MM-DD HH:mm:ss'))

    let emp_id=obj["emp_id"]

    let sql=null;

    let db="svayam_"+b_acct_id+"_hr"

    let emp_filter=""
    if(emp_id!=undefined){
        emp_filter+= " and emp_id="+SqlString.escape(emp_id)
    }

    if(month==1){
        let yearValue=year-1;
        let mValue='12';
        let qValue='10,11,12'
        let hValue="7,8,9,10,11,12"
        sql="insert into "+db+".leave (emp_id,leave_code,num_of_leaves,year,month,remaining_leaves,create_user_id,create_timestamp)"
                    +"Select emp_id,leave_code,"
                    +"case"
                    +"when renew_ind_on_year_change=1 or carry=0 then num_of_leaves "
                    +"else num_of_leaves+remaining_leaves end as num_of_leaves,"+year+","+month+","
                     +"case "
                    +"when renew_ind_on_year_change=1 or carry=0 then num_of_leaves"
                    +"else num_of_leaves+remaining_leaves  end as remaining_leaves,"+create_user_id+","+create_timestamp+" "
                    +"from"
                    +"(Select le.id,le.emp_id,le.leave_code,li.num_of_leaves,le.remaining_leaves,li.rate,li.carry,"
                    +"li.renew_ind_on_year_change,le.month "
                    +"from (Select * from "+db+".leave where year="+SqlString.escape(yearValue)+" "+emp_filter+") le join"
                    +"(Select * from  "+db+".leave_info where rate in ('m','q','h','y')) li on le.leave_code=li.leave_code)x"
                    +"where rate='y' or (rate='m' and month="+mValue+") or (rate='q' and month in ("+qValue+")) or "
                    +"(rate='h' and month in ("+hValue+"))"
    }
    else if(month==4||month==10){
        let yearValue=year;
        let mValue=month-1;
        let qValue=month==4?"1,2,3":"7,8,9"
        sql="insert into "+db+".leave (emp_id,leave_code,num_of_leaves,year,month,remaining_leaves,create_user_id,create_timestamp)"
            +" Select emp_id,leave_code,case when carry=1 then num_of_leaves+remaining_leaves"
            +" else num_of_leaves end as num_of_leaves,"
            +" "+year+","+month+",case when carry=1 then num_of_leaves+remaining_leaves else num_of_leaves end as remaining_leaves,"+create_user_id+","+create_timestamp+" from"
            +" (Select le.id,le.emp_id,le.leave_code,li.num_of_leaves,le.remaining_leaves,"
                +"  li.rate,li.carry,li.renew_ind_on_year_change,le.month "
                +"  from (Select * from "+db+".leave where year="+yearValue+" and month in("+qValue+") "+emp_filter+") le join"
                +" (Select * from  "+db+".leave_info where rate in ('m','q')) li on le.leave_code=li.leave_code)x"
                +" where (rate='m' and month='"+mValue+"') or (rate='q' and month in ("+qValue+"))"
    }
    else if(month==7){
        let yearValue=year;
        let mValue='6';
        let qValue='4,5,6'
        let hValue="1,2,3,4,5,6"

        sql="insert into "+db+".leave (emp_id,leave_code,num_of_leaves,year,month,remaining_leaves,create_user_id,create_timestamp)"
                +" Select emp_id,leave_code,case when carry=1 then num_of_leaves+remaining_leaves"
                +" else num_of_leaves end as num_of_leaves"
                +" ,"+year+","+month+",case when carry=1 then num_of_leaves+remaining_leaves else num_of_leaves end as remaining_leaves"
                +","+create_user_id+","+create_timestamp+"  from"
                +" (Select le.id,le.emp_id,le.leave_code,li.num_of_leaves,le.remaining_leaves,li.rate,"
                    +" li.carry,li.renew_ind_on_year_change,le.month "
                +" from (Select * from "+db+".leave where year="+yearValue+" and month in("+hValue+") "+emp_filter+") le join"
                +" (Select * from  leave_info where rate in ('m','q','h')) li on le.leave_code=li.leave_code)x"
                +" where (rate='m' and month="+mValue+") or (rate='q' and month in ("+qValue+")) or "
                +" (rate='h' and month in ("+hValue+"))"
    }
    else{
        console.log(month);
        let yearValue=year;
        let mValue=month-1;

        sql="insert into "+db+".leave (emp_id,leave_code,num_of_leaves,year,month,remaining_leaves,create_user_id,create_timestamp)"
                +"  Select emp_id,leave_code,case when carry=1 then num_of_leaves+remaining_leaves else num_of_leaves end as num_of_leaves"
                +" ,"+year+","+month+",case when carry=1 then num_of_leaves+remaining_leaves else num_of_leaves end as remaining_leaves"
                +","+create_user_id+","+create_timestamp+" from"
                +" (Select le.id,le.emp_id,le.leave_code,li.num_of_leaves,le.remaining,li.rate,li.carry,li.renew_ind_on_year_change "
                    +" from (Select * from "+db+".leave where year="+yearValue+" and month in("+mValue+") "+""+") le join"
                    +" (Select * from  "+db+".leave_info where rate='m') li on le.leave_code=li.leave_code)x"
    }

    let sql_check="Select * from "+db+".leave where year="+year+" and month="+month

    mysqlPool.query(sql_check,function(error1,results){
        if(error1){
            console.log("Error-->routes-->hr-->setting-->leaveLedger-->carryForwardLeaves--", error1)
            objectToSend["error"] = true
            objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
            res.send(objectToSend);
        }else if(results.length!=0){
            objectToSend["error"] = false
            objectToSend["data"] = "Leaves are already renewed"
            res.send(objectToSend);
        }else{
            mysqlPool.query(sql, function (error, results) {
                if (error) {
                    console.log("Error-->routes-->hr-->setting-->leaveLedger-->carryForwardLeaves--", error)
                    objectToSend["error"] = true
                    objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
                    res.send(objectToSend);
                } else {
                    objectToSend["error"] = false
                    objectToSend["data"] = results
                    res.send(objectToSend);
                }
            })
        }
    })
    

})
module.exports=router;
