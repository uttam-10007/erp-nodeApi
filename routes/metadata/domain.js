var express = require('express');
var router = express.Router();
var propObj = require('../../config_con')
var SqlString = require('sqlstring');

try {
    var mysqlPool = require('../../connections/mysqlConnection.js');
} catch (ex) {
    console.log("Error-->routes-->signup-->require--", ex)
}


router.get('/getAllDomains:dtls',(req,res)=>{
    let objectToSend={}

    let b_acct_id=req.params.dtls

    let sql="Select * from svayam_"+b_acct_id+"_md.domain_info"

    mysqlPool.query(sql,function(error,results){
        if (error) {
            console.log("Error-->routes-->metadata-->domain-->getAlldomains-->", error)
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






module.exports=router;