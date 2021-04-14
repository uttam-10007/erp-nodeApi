var express = require('express');
var router = express.Router();
var SqlString = require('sqlstring');
var propObj = require('../../../config_con')
let mysqlPool = require('../../../connections/mysqlConnection');
var moment=require('moment')

router.get('/getOtherPayments:dtls',(req,res)=>{

    let objectToSend={}
    let obj=JSON.parse(req.params.dtls)

    let b_acct_id=obj["b_acct_id"]
    let other_pay_component_code=obj["other_pay_component_code"]
    let fin_year=SqlString.escape(obj["fin_year"])
    let month=SqlString.escape(obj["month"])
   // let party_id=SqlString.escape(obj["party_id"])
    
    
    let sql="Select id,other_pay_component_code,other_pay_component_amount,fin_year,month,party_name,party_bank_account_no,party_bank_name,party_bank_ifsc_code,"
            +"party_bank_branch_name,pay_status_code"
            +",create_user_id,update_user_id,"
            +"DATE_FORMAT(create_timestamp,'%Y-%m-%d %H:%i:%S') as create_timestamp,DATE_FORMAT(update_timestamp,'%Y-%m-%d %H:%i:%S') as "
            +"update_timestamp from svayam_"+b_acct_id+"_hr.other_payment"

    let ind=false;
    if(obj["other_pay_component_code"]!=undefined){
        if(obj["other_pay_component_code"].length!=0){
        let filter=""
        for(let i=0;i<other_pay_component_code.length;i++){
            filter+=SqlString.escape(other_pay_component_code[i])

            if(i<other_pay_component_code.length-1){
                filter+=","
            }
        }

        sql+=" where other_pay_component_code in ("+filter+")"
        ind=true;
    }}

    if(obj["fin_year"]!=undefined){

        if(ind){
            sql+=" and fin_year="+fin_year
        }else{
            sql+=" where fin_year="+fin_year
            ind=true;
        }
    }

    if(obj["month"]!=undefined){

        if(ind){
            sql+=" and month="+month
        }else{
            sql+=" where month="+month
            ind=true;
        }
    }

    // if(party_id!=undefined){

    //     if(ind){
    //         sql+=" and party_id="+party_id
    //     }else{
    //         sql+=" where party_id="+party_id
    //         ind=true;
    //     }
    // }
    

    mysqlPool.query(sql,function(error,results){
        if(error){
            console.log("Error-->routes-->hr-->otherPayments-->otherPayments-->getOtherPayments", error)
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

router.post('/defineOtherPayments',(req,res)=>{
    let objectToSend={}

    let pay_info=req.body

    let b_acct_id=pay_info["b_acct_id"]
    let other_payments=pay_info["other_payments"]
    
    let sql="insert into svayam_"+b_acct_id+"_hr.other_payment (other_pay_component_code,other_pay_component_amount,fin_year,month,party_name,"
                +"party_bank_account_no,party_bank_name,party_bank_ifsc_code,party_bank_branch_name,pay_status_code,create_user_id,create_timestamp) values "
    for(let i=0;i<other_payments.length;i++){
        let obj=other_payments[i]

        let other_pay_component_code=SqlString.escape(obj["other_pay_component_code"])
        let other_pay_component_amount=SqlString.escape(obj["other_pay_component_amount"])
        let fin_year=SqlString.escape(obj["fin_year"])
        let month=SqlString.escape(obj["month"])
        let party_name=SqlString.escape(obj["party_name"])
        let party_bank_account_no=SqlString.escape(obj["party_bank_account_no"])
        let party_bank_name=SqlString.escape(obj["party_bank_name"])
        let party_bank_ifsc_code=SqlString.escape(obj["party_bank_ifsc_code"])
        let party_bank_branch_name=SqlString.escape(obj["party_bank_branch_name"])
        let pay_status_code=SqlString.escape(obj["pay_status_code"])
        let create_user_id=SqlString.escape(obj["create_user_id"])
        let create_timestamp=SqlString.escape(moment().format('YYYY-MM-DD HH:mm:ss'))

        sql+="("+other_pay_component_code+","+other_pay_component_amount+","+fin_year+","+month+","+party_name+","
            +""+party_bank_account_no+","+party_bank_name+","+party_bank_ifsc_code+","+party_bank_branch_name+","+pay_status_code+","+create_user_id+","+create_timestamp+")"
    
        if(i<other_payments.length-1){
            sql+=","
        }
    }
    
    mysqlPool.query(sql,function(error,results){
        if(error){
            console.log("Error-->routes-->hr-->otherPayments-->otherPayments-->defineOtherPayments", error)
            objectToSend["error"] = true
            objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
            res.send(objectToSend);
        }else{
            objectToSend["error"] = false
            objectToSend["data"] = "Payments defined"
            res.send(objectToSend);
        }
    })
})


router.put('/updateOtherPayment',(req,res)=>{
    let objectToSend={}

    let obj=req.body

    let b_acct_id=obj["b_acct_id"]
    let other_pay_component_amount=SqlString.escape(obj["other_pay_component_amount"])
    let id=SqlString.escape(obj["id"])
    let fin_year=SqlString.escape(obj["fin_year"])
    let month=SqlString.escape(obj["month"])
    let party_name=SqlString.escape(obj["party_name"])
    let party_bank_account_no=SqlString.escape(obj["party_bank_account_no"])
    let party_bank_name=SqlString.escape(obj["party_bank_name"])
    let party_bank_ifsc_code=SqlString.escape(obj["party_bank_ifsc_code"])
    let party_bank_branch_name=SqlString.escape(obj["party_bank_branch_name"])
    let pay_status_code=SqlString.escape(obj["pay_status_code"])
    let update_user_id=SqlString.escape(obj["create_user_id"])
    let update_timestamp=SqlString.escape(moment().format('YYYY-MM-DD HH:mm:ss'))

    let sql="update svayam_"+b_acct_id+"_hr.other_payment set other_pay_component_amount="+other_pay_component_amount+",fin_year="+fin_year+",month="+month+",party_name="+party_name+","
            +"party_bank_account_no="+party_bank_account_no+",party_bank_name="+party_bank_name+",party_bank_ifsc_code="+party_bank_ifsc_code+",party_bank_branch_name="+party_bank_branch_name+","
            +"pay_status_code="+pay_status_code+",update_user_id="+update_user_id+",update_timestamp="+update_timestamp+" where  id="+id
    
        
        

        
    
    
    mysqlPool.query(sql,function(error,results){
        if(error){
            console.log("Error-->routes-->hr-->otherPayments-->otherPayments-->updateOtherPayment", error)
            objectToSend["error"] = true
            objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
            res.send(objectToSend);
        }else{
            objectToSend["error"] = false
            objectToSend["data"] = "Payment updated"
            res.send(objectToSend);
        }
    })
})

router.put('/updateStatusOfPayment',(req,res)=>{
    let objectToSend={}

    let obj=req.body
    let b_acct_id=obj["b_acct_id"]
    let id=SqlString.escape(obj["id"])
    let pay_status_code=SqlString.escape(obj["pay_status_code"])
    let update_user_id=SqlString.escape(obj["update_user_id"])
    let update_timestamp=SqlString.escape(moment().format('YYYY-MM-DD HH:mm:ss'))

    let sql="update svayam_"+b_acct_id+"_hr.other_payment set pay_status_code="+pay_status_code+",update_user_id="+update_user_id+",update_timestamp="+update_timestamp+" where id="+id

    mysqlPool.query(sql,function(error,results){
        if(error){
            console.log("Error-->routes-->hr-->otherPayments-->otherPayments-->updateStatusOfPayment", error)
            objectToSend["error"] = true
            objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
            res.send(objectToSend);
        }else{
            objectToSend["error"] = false
            objectToSend["data"] = "Pay Status Updated"
            res.send(objectToSend);
        }
    })
})


module.exports=router;