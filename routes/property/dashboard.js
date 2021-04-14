var express = require('express');
var router = express.Router();
var SqlString = require('sqlstring');
var propObj = require('../../config_con')
let mysqlPool = require('../../connections/mysqlConnection');
var moment=require('moment')



router.get('/getAllCount:dtls',(req,res)=>{
    let objectToSend={}
    let obj=JSON.parse(req.params.dtls)
    let db="svayam_"+obj.b_acct_id+"_property";

    let total_sold_properties="SELECT COUNT(*) as total_sold_properties  FROM "+db+".property_info WHERE property_status='ALLOTTED'";
    let total_available_properties="SELECT COUNT(*) as  total_available_properties FROM "+db+".property_info WHERE property_status='UNALLOTTED'";
    let total_allotements="SELECT COUNT(*) as total_allotements FROM "+db+".property_info WHERE property_status='ALLOTTED'";
    let total_boolet_purchase="SELECT COUNT (*) as  total_boolet_purchase FROM "+db+".arrangement_info where arr_type_code='BOOKLETPURCHASE' AND arr_status_code='BOOKLET_PURCHASED'";
    let total_applicant="SELECT COUNT (*) as total_applicant FROM "+db+".arrangement_info where arr_type_code='APPLIED' AND arr_status_code='APPLICATION_APPROVED'"
   
    let sql=total_sold_properties+";"+total_available_properties+";"+total_allotements+";"+total_boolet_purchase+";"+total_applicant;
console.log(sql);  
 mysqlPool.query(sql,function(error,results){
        if(error){
            console.log("Error-->routes-->property-->dashboard-->getAllCount-->", error)
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

router.get('/getSubSchemeInYears:dtls',(req,res)=>{
    let objectToSend={}
    let obj=JSON.parse(req.params.dtls)
    let db="svayam_"+obj.b_acct_id+"_property";

    let subscheme_in_years="SELECT DATE_FORMAT(create_timestamp,'%YYYY') as create_timestamp,count(*) as no_of_sub_scheme FROM "+db+".sub_scheme_info group by create_timestamp";
   
    mysqlPool.query(subscheme_in_years,function(error,results){
        if(error){
            console.log("Error-->routes-->property-->dashboard-->getSubSchemeInYears-->", error)
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

router.get('/getAllotmentInYears:dtls',(req,res)=>{
    let objectToSend={}
    let obj=JSON.parse(req.params.dtls)
    let db="svayam_"+obj.b_acct_id+"_property";

    let allotment_in_years="SELECT DATE_FORMAT(create_timestamp,'%YYYY') as create_timestamp,count(*) as no_of_allotmoent FROM "
    +db+".property_info where property_status ='ALLOTTED' group by create_timestamp";
   
    mysqlPool.query(allotment_in_years,function(error,results){
        if(error){
            console.log("Error-->routes-->property-->dashboard-->getAllotmentInYears-->", error)
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




module.exports=router;
