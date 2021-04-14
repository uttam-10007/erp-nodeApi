var express = require('express');
var router = express.Router();
var SqlString = require('sqlstring');
var propObj = require('../../../config_con')
let mysqlPool = require('../../../connections/mysqlConnection');
var moment=require('moment')

router.get('/getEffectiveFixedPay:dtls',(req,res)=>{
    let objectToSend={}
    let obj=JSON.parse(req.params.dtls)
    let b_acct_id=obj["b_acct_id"]
    let emp_id=obj["emp_id"]
    
    let year=SqlString.escape(obj["year"])
    let month=SqlString.escape(obj["month"])
    let end_dt=SqlString.escape(obj["end_dt"])
    
    let selDate=moment()

    selDate.set('year',obj["year"])
    selDate.set('month',obj["month"])
    selDate.set('date',1)

    selDate.endOf('month')

    let month_end_dt=SqlString.escape(selDate.format('YYYY-MM-DD'))

    let sql="Select id,pay_component_code,pay_component_amt,DATE_FORMAT(effective_start_dt,'%Y-%m-%d') as effective_start_dt,"
            +"DATE_FORMAT(effective_end_dt,'%Y-%m-%d') as effective_end_dt,emp_id,pay_code,create_user_id,update_user_id,"
            +"DATE_FORMAT(create_timestamp,'%Y-%m-%d %H:%i:%S') as create_timestamp,DATE_FORMAT(update_timestamp,'%Y-%m-%d %H:%i:%S') as "
            +"update_timestamp from svayam_"+b_acct_id+"_hr.fixed_pay_amount where ("
            +" (year(effective_start_dt)="+year+" and month(effective_start_dt)="+month+") or (year(effective_end_dt)="+year+" and month(effective_end_dt)="+month+")"
            +" or (effective_start_dt<="+month_end_dt+" and effective_end_dt>="+month_end_dt+"))"
    
    if(emp_id!=undefined){
        sql +=" and emp_id="+SqlString.escape(emp_id)
    }
    

    mysqlPool.query(sql,function(error,results){
        if(error){
            console.log("Error-->routes-->hr-->payComponent-->fixedPayAmount-->getEffectiveFixedPay", error)
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

router.get('/getAllFixedPay:dtls',(req,res)=>{
    let objectToSend={}
    let obj=JSON.parse(req.params.dtls)
    let b_acct_id=obj["b_acct_id"]
    let emp_id=obj["emp_id"]
    
    
    let sql="Select id,pay_component_code,pay_component_amt,DATE_FORMAT(effective_start_dt,'%Y-%m-%d') as effective_start_dt,"
            +"DATE_FORMAT(effective_end_dt,'%Y-%m-%d') as effective_end_dt,emp_id,pay_code,create_user_id,update_user_id,"
            +"DATE_FORMAT(create_timestamp,'%Y-%m-%d %H:%i:%S') as create_timestamp,DATE_FORMAT(update_timestamp,'%Y-%m-%d %H:%i:%S') as "
            +"update_timestamp from svayam_"+b_acct_id+"_hr.fixed_pay_amount "
    
    if(emp_id!=undefined){
        sql +=" where emp_id="+SqlString.escape(emp_id)
    }
    

    mysqlPool.query(sql,function(error,results){
        if(error){
            console.log("Error-->routes-->hr-->payComponent-->fixedPayAmount-->getAllFixedPay", error)
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

router.get('/ruleGetAllFixedPayForRule:dtls',(req,res)=>{
    let objectToSend={}
	console.log(req.params.dtls);
    let obj=JSON.parse(req.params.dtls)
    let b_acct_id=obj["b_acct_id"]
    let effective_dt=obj["effective_dt"]

console.log(obj);
    let sql="Select id,pay_component_code,pay_component_amt,DATE_FORMAT(effective_start_dt,'%Y-%m-%d') as effective_start_dt,"
            +"DATE_FORMAT(effective_end_dt,'%Y-%m-%d') as effective_end_dt,emp_id,pay_code,create_user_id,update_user_id,"
            +"DATE_FORMAT(create_timestamp,'%Y-%m-%d %H:%i:%S') as create_timestamp,DATE_FORMAT(update_timestamp,'%Y-%m-%d %H:%i:%S') as "
            +"update_timestamp from svayam_"+b_acct_id+"_hr.fixed_pay_amount where effective_end_dt >="+SqlString.escape(effective_dt);

 


    mysqlPool.query(sql,function(error,results){
        if(error){
            console.log("Error-->routes-->hr-->payComponent-->fixedPayAmount-->getAllFixedPay", error)
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

function lastdt( str){
    var date=new Date(str)
    var tt=new Date(date.getTime()- (24*60*60*1000 * 1))
     mnth = ("0" + (tt.getMonth() + 1)).slice(-2),
    day = ("0" + tt.getDate()).slice(-2);
  return [tt.getFullYear(), mnth, day].join("-");

}
router.post('/addFixedPay',(req,res)=>{
    let objectToSend={}

    let detail=req.body

    let b_acct_id=detail["b_acct_id"]

    let end_dt=SqlString.escape(detail["end_dt"])

    let fixedPayInfo=detail["fixed_pay_info"]
    let est=SqlString.escape(fixedPayInfo[0]["effective_start_dt"])


	let temp_dt=lastdt(fixedPayInfo[0]["effective_start_dt"])
    let sql="insert into svayam_"+b_acct_id+"_hr.fixed_pay_amount (pay_component_code,pay_component_amt,effective_start_dt,"
            +"effective_end_dt,emp_id,pay_code,create_user_id,create_timestamp) values"

    let sql_upd="update svayam_"+b_acct_id+"_hr.fixed_pay_amount set effective_end_dt="+SqlString.escape(temp_dt)+" where effective_end_dt="+end_dt+" and "
            +" pay_component_code in ("
    
    let create_timestamp=SqlString.escape(moment().format('YYYY-MM-DD HH:mm:ss'))
    
    let payCompCodes={}
    let empIds={}

    for(let i=0;i<fixedPayInfo.length;i++){
        let obj=fixedPayInfo[i]
        let pay_component_code=SqlString.escape(obj["pay_component_code"])
        let pay_component_amt=SqlString.escape(obj["pay_component_amt"])
        let effective_start_dt=SqlString.escape(obj["effective_start_dt"])
        let effective_end_dt=SqlString.escape(obj["effective_end_dt"])
        let emp_id=SqlString.escape(obj["emp_id"])
        let pay_code=SqlString.escape(obj["pay_code"])
        let create_user_id=SqlString.escape(obj["create_user_id"])

        payCompCodes[pay_component_code]=true
        empIds[emp_id]=true
        
        sql=sql+"("+pay_component_code+","+pay_component_amt+","+effective_start_dt+","+effective_end_dt+","+emp_id+","+pay_code+","+create_user_id+","+create_timestamp+")"

        if(i<fixedPayInfo.length-1){
            sql+=","
        }

    }
    
    sql_upd=sql_upd+Object.keys(payCompCodes).join(",")+")  and emp_id in ("+Object.keys(empIds).join(",")+")"

    
    mysqlPool.getConnection(function(error,mysqlCon){
        if(error){
            console.log("Error-->routes-->hr-->payComponent-->fixedPayAmount-->addFixedPay", error)
            objectToSend["error"] = true
            objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
            res.send(objectToSend);
        }else{
            mysqlCon.beginTransaction(function(error1){
                if(error1){
                    console.log("Error-->routes-->hr-->payComponent-->fixedPayAmount-->addFixedPay", error1)
                    objectToSend["error"] = true
                    objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
                    res.send(objectToSend);
                    mysqlCon.release()
                }else{
                    mysqlCon.query(sql_upd+";"+sql,function(error2,results2){
                        if(error2){
                            console.log("Error-->routes-->hr-->payComponent-->fixedPayAmount-->addFixedPay", error2)
                            objectToSend["error"] = true
                            objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
                            res.send(objectToSend);
                            mysqlCon.rollback()
                            mysqlCon.release()
                        }else{
                            mysqlCon.commit(function(error3){
                                if(error3){
                                    console.log("Error-->routes-->hr-->payComponent-->fixedPayAmount-->addFixedPay", error3)
                                    objectToSend["error"] = true
                                    objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
                                    res.send(objectToSend);
                                    mysqlCon.rollback()
                                    mysqlCon.release()
                                }else{
                                    objectToSend["error"] = false
                                    objectToSend["data"] = "Fixed Pay Added"
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

router.put('/updateFixedPay',(req,res)=>{

    let objectToSend={}

    let obj=req.body

    let b_acct_id=obj["b_acct_id"]
    let pay_component_code=SqlString.escape(obj["pay_component_code"])
    let pay_component_amt=SqlString.escape(obj["pay_component_amt"])
    let effective_start_dt=SqlString.escape(obj["effective_start_dt"])
    let effective_end_dt=SqlString.escape(obj["effective_end_dt"])
    let emp_id=SqlString.escape(obj["emp_id"])
    let pay_code=SqlString.escape(obj["pay_code"])
    let id=SqlString.escape(obj["id"])
    let update_user_id=SqlString.escape(obj["update_user_id"])
    let update_timestamp=SqlString.escape(moment().format('YYYY-MM-DD HH:mm:ss'))
    


    let sql="update svayam_"+b_acct_id+"_hr.fixed_pay_amount set pay_component_code="+pay_component_code+",pay_component_amt="+pay_component_amt+","
            +"effective_start_dt="+effective_start_dt+",effective_end_dt="+effective_end_dt+",emp_id="+emp_id+",pay_code="+pay_code+",update_user_id="+update_user_id+" "
        +", update_timestamp="+update_timestamp+" where id="+id

    mysqlPool.query(sql,function(error,results){
        if(error){
            console.log("Error-->routes-->hr-->payComponent-->fixedPayAmount-->updateFixedPay", error)
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


router.put('/updateFixedPayonly',(req,res)=>{

    let objectToSend={}

    let obj=req.body

    let b_acct_id=obj["b_acct_id"]
    let pay_component_code=SqlString.escape(obj["pay_component_code"])
    let pay_component_amt=SqlString.escape(obj["pay_component_amt"])
    let effective_start_dt=SqlString.escape(obj["effective_start_dt"])
    let effective_end_dt=SqlString.escape(obj["effective_end_dt"])
    let emp_id=SqlString.escape(obj["emp_id"])
    let pay_code=SqlString.escape(obj["pay_code"])
    let id=SqlString.escape(obj["id"])
    let update_user_id=SqlString.escape(obj["update_user_id"])
    let update_timestamp=SqlString.escape(moment().format('YYYY-MM-DD HH:mm:ss'))



    let sql="update svayam_"+b_acct_id+"_hr.fixed_pay_amount set pay_component_code="+pay_component_code+",pay_component_amt="+pay_component_amt+","
            +"effective_start_dt="+effective_start_dt+",effective_end_dt="+effective_end_dt+",emp_id="+emp_id+",pay_code="+pay_code+",update_user_id="+update_user_id+" "
        +", update_timestamp="+update_timestamp+" where id="+id

    mysqlPool.query(sql,function(error,results){
        if(error){
            console.log("Error-->routes-->hr-->payComponent-->fixedPayAmount-->updateFixedPayonly", error)
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

router.post('/addFixedPayonly',(req,res)=>{
    let objectToSend={}

    let obj=req.body

    let b_acct_id=obj["b_acct_id"]

   
    let pay_component_code=SqlString.escape(obj["pay_component_code"])
    let pay_component_amt=SqlString.escape(obj["pay_component_amt"])
    let effective_start_dt=SqlString.escape(obj["effective_start_dt"])
    let effective_end_dt=SqlString.escape(obj["effective_end_dt"])
    let emp_id=SqlString.escape(obj["emp_id"])
    let pay_code=SqlString.escape(obj["pay_code"])
    let create_user_id=SqlString.escape(obj["create_user_id"])
    let create_timestamp=SqlString.escape(moment().format('YYYY-MM-DD HH:mm:ss'))
    let sql="insert into svayam_"+b_acct_id+"_hr.fixed_pay_amount (pay_component_code,pay_component_amt,effective_start_dt,"
    +"effective_end_dt,emp_id,pay_code,create_user_id,create_timestamp) values("+pay_component_code+","+pay_component_amt+","+effective_start_dt+","+effective_end_dt+","+emp_id+","+pay_code+","+create_user_id+","+create_timestamp+")"

    mysqlPool.query(sql,function(error,results){
        if(error){
            console.log("Error-->routes-->hr-->payComponent-->fixedPay-->addFixedPayonly", error)
            objectToSend["error"] = true
            if(error.message!=undefined&&error.message.includes("Duplicate")){
                objectToSend["data"]="Duplicate entry"
            }else{
                objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
            }

            res.send(objectToSend);
        }else{

            objectToSend["error"] = false
            objectToSend["data"] = "Components added"
            res.send(objectToSend);
        }
    })



})

router.delete('/deletefixedpay:dtls',(req,res)=>{
    let objectToSend={}

    let obj=JSON.parse(req.params.dtls)

    let b_acct_id=obj["b_acct_id"]
    let id=obj["id"]

    let sql="delete from svayam_"+b_acct_id+"_hr.fixed_pay_amount where id =" + id

    mysqlPool.query(sql,function(error,results){
        if(error){
            console.log("Error-->routes-->hr-->payComponent-->fixedPay-->deletefixedpay", error)
            objectToSend["error"] = true
            objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
            res.send(objectToSend);
        }else{
            objectToSend["error"] = false
            objectToSend["data"] = " Deleted Successfully" 
            res.send(objectToSend);
        }
    })

})



module.exports=router;
