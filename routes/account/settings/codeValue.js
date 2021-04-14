var express = require('express');
var router = express.Router();
var SqlString = require('sqlstring');
var propObj = require('../../../config_con')
let mysqlPool = require('../../../connections/mysqlConnection');
var moment=require('moment')





router.get('/getcodevalues:dtls',(req,res)=>{
    let objectToSend={};
    let obj=JSON.parse(req.params.dtls)

    let db="svayam_"+obj.b_acct_id+"_account"
   
    let field_id=obj["field_id"]


    let sql="Select * from "+db+".account_code_value"
    if(field_id!=undefined&& field_id.length!=0){
        sql+=" where field_id in ("
        for(let i=0;i<field_id.length;i++){
            sql+=SqlString.escape(field_id[i])
            if(i<field_id.length-1){
                sq+=","
            }
        }
        sql +=")"
    }

    
    mysqlPool.query(sql,function(error,results){
        if(error){
            console.log("Error-->routes-->accounts-->setting-->codeValue-->getcodevalues", error)
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

    let db="svayam_"+obj.b_acct_id+"_account"
   

    let sql="insert into "+db+".account_code_value (field_id,code,value) values ("+SqlString.escape(obj.field_id)+","+SqlString.escape(obj.code)+","+SqlString.escape(obj.value)+")"

    
    mysqlPool.query(sql,function(error,results){
        if(error){
            console.log("Error-->routes-->accounts-->setting-->codeValue-->addCodeValue", error)
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

    let db="svayam_"+obj.b_acct_id+"_account"
   

    let sql="update "+db+".account_code_value set field_id="+SqlString.escape(obj.field_id)+",code="+SqlString.escape(obj.code)+",value="+SqlString.escape(obj.value)
        +" where id="+SqlString.escape(obj.id)

    
    mysqlPool.query(sql,function(error,results){
        if(error){
            console.log("Error-->routes-->accounts-->setting-->codeValue-->updateCodeValue", error)
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


    let db="svayam_"+obj.b_acct_id+"_account"
   

    let sql="delete from "+db+".account_code_value  where id="+SqlString.escape(obj.id)

    
    mysqlPool.query(sql,function(error,results){
        if(error){
            console.log("Error-->routes-->accounts-->setting-->codeValue-->deleteCodeValue", error)
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
