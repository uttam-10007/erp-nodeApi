var express = require('express');
var router = express.Router();
var SqlString = require('sqlstring');
var propObj = require('../../../config_con')
let mysqlPool = require('../../../connections/mysqlConnection');
var moment=require('moment')






router.get('/getAllfields:dtls',(req,res)=>{
    let objectToSend={};
    let b_acct_id=req.params.dtls

    let db="svayam_"+b_acct_id+"_hr"
   

    let sql="Select * from "+db+".hr_fields"

    
    mysqlPool.query(sql,function(error,results){
        if(error){
            console.log("Error-->routes-->hr-->setting-->setting-->getAllfields", error)
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

    let db="svayam_"+obj.b_acct_id+"_hr"
   

    let sql="insert into "+db+".hr_fields (fields) values ("+SqlString.escape(obj.fields)+")"

    
    mysqlPool.query(sql,function(error,results){
        if(error){
            if(error.sqlMessage.includes('Duplicate entry')){
                objectToSend["data"] = "Duplicate Entry"
            }else{
                objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
            }
            console.log("Error-->routes-->hr-->setting-->setting-->addField", error)
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

    let db="svayam_"+obj.b_acct_id+"_hr"
   

    let sql="update "+db+".hr_fields set fields="+SqlString.escape(obj.fields)+" where id="+SqlString.escape(obj.id)

    
    mysqlPool.query(sql,function(error,results){
        if(error){
            console.log("Error-->routes-->hr-->setting-->setting-->updateField", error)
            objectToSend["error"] = true
            objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
            res.send(objectToSend);
        }else{
            objectToSend["error"] = false
            objectToSend["data"] = "Update Successfully"
            res.send(objectToSend);
        }
    })
})









router.get('/getcodevalues:dtls',(req,res)=>{
    let objectToSend={};
    let obj=JSON.parse(req.params.dtls)

    let db="svayam_"+obj.b_acct_id+"_hr"
   

    let sql="Select * from "+db+".hr_code_value"
    if(obj.field_id!=undefined){
        sql +=" where field_id="+SqlString.escape(obj.field_id)
    }

    
    mysqlPool.query(sql,function(error,results){
        if(error){
            console.log("Error-->routes-->hr-->setting-->setting-->getcodevalues", error)
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



router.post('/addCodeValue',(req,res)=>{
    let objectToSend={};
    let obj=req.body

    let db="svayam_"+obj.b_acct_id+"_hr"
   

    let sql="insert into "+db+".hr_code_value (field_id,code,value) values ("+SqlString.escape(obj.field_id)+","+SqlString.escape(obj.code)+","+SqlString.escape(obj.value)+")"

    
    mysqlPool.query(sql,function(error,results){
        if(error){
            console.log("Error-->routes-->hr-->setting-->setting-->addCodeValue", error)
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
router.put('/updateCodeValue',(req,res)=>{
    let objectToSend={};
    let obj=req.body

    let db="svayam_"+obj.b_acct_id+"_hr"
   

    let sql="update "+db+".hr_code_value set field_id="+SqlString.escape(obj.field_id)+",code="+SqlString.escape(obj.code)+",value="+SqlString.escape(obj.value)
        +" where id="+SqlString.escape(obj.id)

    
    mysqlPool.query(sql,function(error,results){
        if(error){
            console.log("Error-->routes-->hr-->setting-->setting-->updateCodeValue", error)
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


router.delete('/deleteCodeValue:dtls',(req,res)=>{
    let objectToSend={};
    let obj=JSON.parse(req.params.dtls)


    let db="svayam_"+obj.b_acct_id+"_hr"
   

    let sql="delete from "+db+".hr_code_value  where id="+SqlString.escape(obj.id)

    
    mysqlPool.query(sql,function(error,results){
        if(error){
            console.log("Error-->routes-->hr-->setting-->setting-->deleteCodeValue", error)
            objectToSend["error"] = true
            objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
            res.send(objectToSend);
        }else{
            objectToSend["error"] = false
            objectToSend["data"] = "Deleted Successfully"
            res.send(objectToSend);
        }
    })
})
module.exports=router;
