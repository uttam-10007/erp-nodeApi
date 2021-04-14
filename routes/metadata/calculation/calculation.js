var express = require('express');
var router = express.Router();
var SqlString = require('sqlstring');
var propObj = require('../../../config_con.js')
let mysqlPool = require('../../../connections/mysqlConnection.js')


router.get('/getCalculations:dtls',(req,res)=>{
    let objectToSend={}
    let obj=JSON.parse(req.params.dtls)

    let b_acct_id=obj["b_acct_id"]
    let domain_code=obj["domain_code"]

    let db="svayam_"+b_acct_id+"_md"

    let sql="Select ci.*,cri.rule_content from (Select * from "+db+".calculation_info where domain_code="+SqlString.escape(domain_code)+") ci "
            +"join "+db+".calculation_rule_info cri on ci.rule_id=cri.rule_id"

    mysqlPool.query(sql,function(error,results){
        if(error){
            console.log("Error-->routes-->metadata-->calculation-->calculation-->getCalculations", error)
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







module.exports=router;
