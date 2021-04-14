var express = require('express');
var router = express.Router();
var SqlString = require('sqlstring');
var propObj = require('../../config_con')
let mysqlPool = require('../../connections/mysqlConnection');
var moment = require('moment')

router.post('/createRefApplication',(req,res)=>{
    let obj=req.body
    let objectToSend={};

    let b_acct_id=obj["b_acct_id"]
    let application_category_code=SqlString.escape(obj["application_category_code"])
    let amount=SqlString.escape(obj["amount"])
    let num_of_years=SqlString.escape(obj["num_of_years"])
    let num_of_months=SqlString.escape(obj["num_of_months"])
    let num_of_days=SqlString.escape(obj["num_of_days"])
    let create_user_id=SqlString.escape(obj["create_user_id"])
    let create_timestamp = SqlString.escape(moment().format('YYYY-MM-DD HH:mm:ss'))
    
    let db="svayam_"+b_acct_id+"_eng"

    let sql_insert="INSERT INTO "+db+".application_ref ( application_category_code, amount, num_of_years, num_of_months, num_of_days, "
            +"create_user_id, create_timestamp) values "
            +"("+application_category_code+", "+amount+", "+ num_of_years+", "+ num_of_months+", "+ num_of_days+", "
            +" "+create_user_id+", "+ create_timestamp+")"



    mysqlPool.query(sql_insert, function (error2,results) {
        if (error2) {
            console.log("Error-->routes-->eng-->application_ref-->createRefApplication", error2)
            objectToSend["error"] = true;
            objectToSend["data"] = "Some error occured at server Side. Please try again later"
            res.send(objectToSend)
            
        } else {
            objectToSend["error"] = false;
            objectToSend["data"] = results.insertId
            res.send(objectToSend)
        }

    })
   


})

router.get('/getRefApplications:dtls',(req,res)=>{
    let objectToSend={}

    let obj=JSON.parse(req.params.dtls)

    let b_acct_id=obj["b_acct_id"]

    let db="svayam_"+b_acct_id+"_eng"

    let sql_fetch="Select  id,application_category_code, amount, num_of_years, num_of_months, num_of_days, "
        +"create_user_id, create_timestamp,update_user_id, update_timestamp"
            +" from "+db+".application_ref"

    if(obj["id"]!=undefined){
        sql_fetch+=" where id="+SqlString.escape(obj["id"])
    }

    mysqlPool.query(sql_fetch, function (error2,results) {
        if (error2) {
            console.log("Error-->routes-->eng-->application_ref-->getRefApplications", error2)
            objectToSend["error"] = true;
            objectToSend["data"] = "Some error occured at server Side. Please try again later"
            res.send(objectToSend)
            
        } else {
            objectToSend["error"] = false;
            objectToSend["data"] = results
            res.send(objectToSend)
        }

    })
})


router.put('/updateRefApplication',(req,res)=>{
    let objectToSend={}
    let obj=req.body


    let id=SqlString.escape(obj["id"])
    let b_acct_id=obj["b_acct_id"]
    let application_category_code=SqlString.escape(obj["application_category_code"])
    let amount=SqlString.escape(obj["amount"])
    let num_of_years=SqlString.escape(obj["num_of_years"])
    let num_of_months=SqlString.escape(obj["num_of_months"])
    let num_of_days=SqlString.escape(obj["num_of_days"])
    let update_user_id=SqlString.escape(obj["update_user_id"])
    let update_timestamp = SqlString.escape(moment().format('YYYY-MM-DD HH:mm:ss'))
    
    let db="svayam_"+b_acct_id+"_eng"

    let sql_upd="update "+db+".application_ref set application_category_code="+application_category_code+",amount="+amount+", "
            +"num_of_years="+num_of_years+",num_of_months="+num_of_months+",num_of_days="+num_of_days+" ,update_user_id="+update_user_id+",update_timestamp="+update_timestamp+" where id="+id

    mysqlPool.query(sql_upd, function (error2,results) {
        if (error2) {
            console.log("Error-->routes-->eng-->application_ref-->updateRefApplication", error2)
            objectToSend["error"] = true;
            objectToSend["data"] = "Some error occured at server Side. Please try again later"
            res.send(objectToSend)
            
        } else {
            objectToSend["error"] = false;
            objectToSend["data"] = "Application Ref updated Successfully"
            res.send(objectToSend)
        }

    })

})

router.delete('/deleteRefApplication:dtls',(req,res)=>{
    let objectToSend={}

    let obj=JSON.parse(req.params.dtls)

    let b_acct_id=obj["b_acct_id"]
    let id=SqlString.escape(obj["id"])

    let db="svayam_"+b_acct_id+"_eng"

    let sql_delete="delete from "+db+".application_ref where id="+id

    mysqlPool.query(sql_delete, function (error2,results) {
        if (error2) {
            console.log("Error-->routes-->eng-->application_ref-->deleteRefApplication", error2)
            objectToSend["error"] = true;
            objectToSend["data"] = "Some error occured at server Side. Please try again later"
            res.send(objectToSend)
            
        } else {
            objectToSend["error"] = false;
            objectToSend["data"] = "Application Ref deleted Successfully"
            res.send(objectToSend)
        }

    })

})



module.exports = router;