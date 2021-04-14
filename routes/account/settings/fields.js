var express = require('express');
var router = express.Router();
var SqlString = require('sqlstring');
var propObj = require('../../../config_con')
let mysqlPool = require('../../../connections/mysqlConnection');
var moment=require('moment')






router.get('/getAllfields:dtls',(req,res)=>{
    let objectToSend={};
    let b_acct_id=req.params.dtls

    let db="svayam_"+b_acct_id+"_account"
   

    let sql="Select * from "+db+".account_fields"

    
    mysqlPool.query(sql,function(error,results){
        if(error){
            console.log("Error-->routes-->accounts-->setting-->fields-->getAllfields", error)
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





router.post('/addField',(req,res)=>{
    let objectToSend={};
    let obj=req.body

    let db="svayam_"+obj.b_acct_id+"_account"
   

    let sql="insert into "+db+".account_fields (fields) values ("+SqlString.escape(obj.field)+")"

    
    mysqlPool.query(sql,function(error,results){
        if(error){
            if(error.sqlMessage.includes('Duplicate entry')){
                objectToSend["data"] = "Duplicate Entry"
            }else{
                objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
            }
            console.log("Error-->routes-->accounts-->setting-->fields-->addField", error)
            objectToSend["error"] = true
           
            res.send(objectToSend);
        }else{
            objectToSend["error"] = false
            objectToSend["data"] = results.insertId
            res.send(objectToSend);
        }
    })
})


router.put('/updateField',(req,res)=>{
    let objectToSend={};
    let obj=req.body

    let db="svayam_"+obj.b_acct_id+"_account"
   

    let sql="update "+db+".account_fields set fields="+SqlString.escape(obj.field)+" where id="+SqlString.escape(obj.id)

    
    mysqlPool.query(sql,function(error,results){
        if(error){
            console.log("Error-->routes-->accounts-->setting-->fields-->updateField", error)
            objectToSend["error"] = true
            objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
            res.send(objectToSend);
        }else{
            objectToSend["error"] = false
            objectToSend["data"] = "Updated Successfully"
            res.send(objectToSend);
        }
    })
})




module.exports=router;
