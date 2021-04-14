var express = require('express');
var router = express.Router();
var SqlString = require('sqlstring');
var propObj = require('../../../config_con')
let mysqlPool = require('../../../connections/mysqlConnection');
var moment=require('moment')



router.get('/getAccountInfo:dtls',(req,res)=>{
    let objectToSend={};
    let obj=JSON.parse(req.params.dtls);
    let db="svayam_"+obj.b_acct_id+"_account";
    let account_type=obj["account_type"];
    let sql="Select * from "+db+".account_info";
    if(account_type!=undefined&& account_type.length!=0){
        sql+=" where account_type in ("
        for(let i=0;i<account_type.length;i++){
            sql+=SqlString.escape(account_type[i])
            if(i<account_type.length-1){
                sq+=","
            }
        }
        sql +=")"
    }

    
    mysqlPool.query(sql,function(error,results){
        if(error){
            console.log("Error-->routes-->accounts-->setting-->codeValue-->getAccountInfo", error)
            objectToSend["error"] = true
            objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
            res.send(objectToSend);
        }else{
            objectToSend["error"] = false
            objectToSend["data"] = results
            res.send(objectToSend);
        }
    })
});

router.post('/addAccountInfo',(req,res)=>{
    let objectToSend={};
    let obj=req.body
    let create_timestamp=SqlString.escape(moment().format('YYYY-MM-DD HH:mm:ss'))


    let db="svayam_"+obj.b_acct_id+"_account";
    let sql="insert into "+db+".account_info (account_type,account_desc,account_code,create_user_id) values ("+SqlString.escape(obj.account_type)
    +","+SqlString.escape(obj.account_desc)+","+SqlString.escape(obj.account_code)+","+SqlString.escape(obj.create_user_id)+")"
    //+","+SqlString.escape(create_timestamp)+")"

    
    mysqlPool.query(sql,function(error,results){
        if(error){
            console.log("Error-->routes-->accounts-->setting-->AccountInfo-->addAccountInfo", error)
            objectToSend["error"] = true
            objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
            res.send(objectToSend);
        }else{
            objectToSend["error"] = false
            objectToSend["data"] = results.insertId;
            res.send(objectToSend);
        }
    })
});

router.put('/updateAccountInfo',(req,res)=>{
    let objectToSend={};
    let obj=req.body;

    let db="svayam_"+obj.b_acct_id+"_account"
    let sql="update "+db+".account_info set account_type="+SqlString.escape(obj.account_type)
    +",account_code="+SqlString.escape(obj.account_code)+",account_desc="+SqlString.escape(obj.account_desc)
    +",update_user_id="+SqlString.escape(obj.update_user_id)
    +" where id="+SqlString.escape(obj.id)

    mysqlPool.query(sql,function(error,results){
        if(error){
            console.log("Error-->routes-->accounts-->setting-->codeValue-->updateAccountInfo", error)
            objectToSend["error"] = true
            objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
            res.send(objectToSend);
        }else{
            objectToSend["error"] = false
            objectToSend["data"] = "Updated Successfully"
            res.send(objectToSend);
        }
    })
});

router.delete('/deleteAccountInfo:dtls',(req,res)=>{
    let objectToSend={};
    let obj=JSON.parse(req.params.dtls)


    let db="svayam_"+obj.b_acct_id+"_account"
    let sql="delete from "+db+".account_info  where id="+SqlString.escape(obj.id)

    mysqlPool.query(sql,function(error,results){
        if(error){
            console.log("Error-->routes-->accounts-->setting-->codeValue-->deleteAccountInfo", error)
            objectToSend["error"] = true
            objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
            res.send(objectToSend);
        }else{
            objectToSend["error"] = false
            objectToSend["data"] = "Deleted Successfully"
            res.send(objectToSend);
        }
    })
});

module.exports=router;