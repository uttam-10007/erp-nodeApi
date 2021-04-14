var express = require('express');
var router = express.Router();
var SqlString = require('sqlstring');
var propObj = require('../../../config_con')
let mysqlPool = require('../../../connections/mysqlConnection');
var moment=require('moment')

router.get('/getNominee:dtls',(req,res)=>{
    let objectToSend={}

    let obj=JSON.parse(req.params.dtls);

    let b_acct_id=obj["b_acct_id"];
    let emp_id=obj["emp_id"]

    let sql="Select id,nominee_relation_code,nom_name,nom_email,nom_share,emp_id,nom_phone_no,nom_bank_name,nom_branch_name,nom_ifsc_code,nom_bank_acct_no,"
            +"create_user_id,update_user_id,"
            +"DATE_FORMAT(create_timestamp,'%Y-%m-%d %H:%i:%S') as create_timestamp,DATE_FORMAT(update_timestamp,'%Y-%m-%d %H:%i:%S') as "
            +"update_timestamp from svayam_"+b_acct_id+"_hr.nominee where emp_id="+SqlString.escape(emp_id)

    mysqlPool.query(sql,function(error,results){
        if(error){
            console.log("Error-->routes-->hr-->party-->nominee-->getNominee", error)
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

router.post('/addNominee',(req,res)=>{
    let objectToSend={}

    let obj=req.body

    let b_acct_id=obj["b_acct_id"]
    let nom_name=SqlString.escape(obj["nom_name"])
    let nom_email=SqlString.escape(obj["nom_email"])
    let nom_share=SqlString.escape(obj["nom_share"])
    let emp_id=SqlString.escape(obj["emp_id"])
    let nom_phone_no=SqlString.escape(obj["nom_phone_no"])
    let nom_bank_name=SqlString.escape(obj["nom_bank_name"])
    let nom_branch_name=SqlString.escape(obj["nom_branch_name"])
    let nom_ifsc_code=SqlString.escape(obj["nom_ifsc_code"])
    let nom_bank_acct_no=SqlString.escape(obj["nom_bank_acct_no"])
    let create_user_id=SqlString.escape(obj["create_user_id"])
    let nominee_relation_code=SqlString.escape(obj["nominee_relation_code"])
    let create_timestamp=SqlString.escape(moment().format('YYYY-MM-DD HH:mm:ss'))

    let sql="insert into svayam_"+b_acct_id+"_hr.nominee (nom_name,nom_email,nom_share,emp_id,nom_phone_no,nom_bank_name,nom_branch_name,nom_ifsc_code,nom_bank_acct_no,create_user_id,create_timestamp,nominee_relation_code) values "
            +"("+nom_name+","+nom_email+","+nom_share+","+emp_id+","+nom_phone_no+","+nom_bank_name+","+nom_branch_name+","+nom_ifsc_code+","+nom_bank_acct_no+","+create_user_id+","+create_timestamp+","+nominee_relation_code+")"

    mysqlPool.query(sql,function(error,results){
        if(error){
            console.log("Error-->routes-->hr-->party-->nominee-->addNominee", error)
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

router.put('/updateNominee',(req,res)=>{
    let objectToSend={}

    let obj=req.body

    let b_acct_id=obj["b_acct_id"]
    let nom_name=SqlString.escape(obj["nom_name"])
    let nom_email=SqlString.escape(obj["nom_email"])
    let nom_share=SqlString.escape(obj["nom_share"])
    let nom_seq=SqlString.escape(obj["nom_seq"])
    let id=SqlString.escape(obj["id"])
    let nom_phone_no=SqlString.escape(obj["nom_phone_no"])
    let nom_bank_name=SqlString.escape(obj["nom_bank_name"])
    let nom_branch_name=SqlString.escape(obj["nom_branch_name"])
    let nom_ifsc_code=SqlString.escape(obj["nom_ifsc_code"])
    let nom_bank_acct_no=SqlString.escape(obj["nom_bank_acct_no"])
    let update_user_id=SqlString.escape(obj["update_user_id"])
    let update_timestamp=SqlString.escape(moment().format('YYYY-MM-DD HH:mm:ss'))
    let nominee_relation_code=SqlString.escape(obj["nominee_relation_code"])

    let sql="update svayam_"+b_acct_id+"_hr.nominee set nom_name="+nom_name+",nom_email="+nom_email
            +",nom_share="+nom_share+",nom_phone_no="+nom_phone_no+",nom_bank_name="+nom_bank_name+", "
            +" nom_branch_name="+nom_branch_name+", nom_ifsc_code="+nom_ifsc_code+", nom_bank_acct_no="+nom_bank_acct_no+","
            +"update_user_id="+update_user_id+", update_timestamp="+update_timestamp+", nominee_relation_code = " +nominee_relation_code +" where id="+id

    
    mysqlPool.query(sql,function(error,results){
        if(error){
            console.log("Error-->routes-->hr-->party-->nominee-->updateNominee", error)
            objectToSend["error"] = true
            objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
            res.send(objectToSend);
        }else{
            objectToSend["error"] = false
            objectToSend["data"] = "Nominee updated successfully" 
            res.send(objectToSend);
        }
    })
})

router.delete('/deleteNominee:dtls',(req,res)=>{
    let objectToSend={}

    let obj=JSON.parse(req.params.dtls)

    let b_acct_id=obj["b_acct_id"]
    let id=obj["id"]

    let sql="delete from svayam_"+b_acct_id+"_hr.nominee where id="+SqlString.escape(id)

    mysqlPool.query(sql,function(error,results){
        if(error){
            console.log("Error-->routes-->hr-->party-->nominee-->deletenominee", error)
            objectToSend["error"] = true
            objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
            res.send(objectToSend);
        }else{
            objectToSend["error"] = false
            objectToSend["data"] = "Nominee deleted successfully" 
            res.send(objectToSend);
        }
    })

})


module.exports=router;
