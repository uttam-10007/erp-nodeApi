var express = require('express');
var router = express.Router();
var SqlString = require('sqlstring');
var propObj = require('../../config_con')
let mysqlPool = require('../../connections/mysqlConnection');
var moment = require('moment')

router.get('/getProjectBankAccounts:dtls', (req, res) => {

    let objectToSend = {}

    let obj = JSON.parse(req.params.dtls);



    let sql_fetchCurr = "SELECT id,project_code,bank_acct_no,create_user_id, "
    + "DATE_FORMAT(create_timestamp,'%Y-%m-%d %H:%i:%S') as create_timestamp,"
    +"DATE_FORMAT(update_timestamp,'%Y-%m-%d %H:%i:%S') as update_timestamp,update_user_id from svayam_" + obj.b_acct_id + "_account.project_xref_bank"
   
    mysqlPool.query(sql_fetchCurr, function (error, results) {
        if (error) {
            console.log("Error-->routes-->account-->projectXrefProject-->getProjectBankAccounts--", error)
            objectToSend["error"] = true
            objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
            res.send(objectToSend);
        } else {
            objectToSend["error"] = false
            objectToSend["data"] = results
            res.send(objectToSend);
        }
    })
});



router.post('/createProjectBankAccounts',(req,res)=>{
    let obj=req.body
    let objectToSend={};

    let b_acct_id=obj["b_acct_id"]
    let bank_acct_no=SqlString.escape(obj["bank_acct_no"])
    let project_code=SqlString.escape(obj["project_code"])
    let create_user_id=SqlString.escape(obj["create_user_id"])
     let create_timestamp = SqlString.escape(moment().format('YYYY-MM-DD HH:mm:ss'))
     let db="svayam_"+b_acct_id+"_account"

     let sql_insert="INSERT INTO "+db+".project_xref_bank (bank_acct_no,project_code, create_user_id,create_timestamp) values "
            +" ("+bank_acct_no+","+project_code+","+create_user_id+", "+create_timestamp+")"

    mysqlPool.query(sql_insert, function (error2,results) {
        if (error2) {
            console.log("Error-->routes-->acount-->projectXrefProject-->createProjectBankAccounts", error2)
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

router.put('/updateProjectBankAccounts',(req,res)=>{
    let obj=req.body
    let objectToSend={};
    let id=SqlString.escape(obj["id"])

    let b_acct_id=obj["b_acct_id"]
    let bank_acct_no=SqlString.escape(obj["bank_acct_no"])
    let project_code=SqlString.escape(obj["project_code"])
    let update_user_id=SqlString.escape(obj["update_user_id"])
    
    let update_timestamp = SqlString.escape(moment().format('YYYY-MM-DD HH:mm:ss'))

       let db="svayam_"+b_acct_id+"_account"

     let sql="update "+db+".project_xref_bank set bank_acct_no="+bank_acct_no+",project_code="+project_code
            +",update_user_id="+update_user_id
            +",update_timestamp="+update_timestamp+" where id="+id
    mysqlPool.query(sql, function (error2,results) {
        if (error2) {
            console.log("Error-->routes-->acount-->projectXrefProject-->updateProjectBankAccounts", error2)
            objectToSend["error"] = true;
            objectToSend["data"] = "Some error occured at server Side. Please try again later"
            res.send(objectToSend)
            
        } else {
            objectToSend["error"] = false;
            objectToSend["data"] = "Updated Successfully!"
            res.send(objectToSend)
        }

    })
   


})

router.delete('/deleteProjectBankAccounts:dtls',(req,res)=>{
    let objectToSend={}
    let obj=JSON.parse(req.params.dtls)


    let id=SqlString.escape(obj["id"])
    let b_acct_id=obj["b_acct_id"]
  
    let db="svayam_"+b_acct_id+"_account"

    let sql="delete from "+db+".project_xref_bank  where id="+id
  

    mysqlPool.query(sql, function (error2,results) {
        if (error2) {
            console.log("Error-->routes-->acount-->projectXrefProject-->deleteProjectBankAccounts", error2)
            objectToSend["error"] = true;
            objectToSend["data"] = "Some error occured at server Side. Please try again later"
            res.send(objectToSend)
            
        } else {
            objectToSend["error"] = false;
            objectToSend["data"] = "Deleted Successfully!"
            res.send(objectToSend)
        }

    })

})




module.exports = router;
