var express = require('express');
var router = express.Router();
var SqlString = require('sqlstring');
var propObj = require('../../../config_con')
let mysqlPool = require('../../../connections/mysqlConnection');
var moment=require('moment')


router.get('/getPartyEmi:dtls', (req, res) => {

    let objectToSend = {}

    let obj = JSON.parse(req.params.dtls);


    let db = "svayam_" + obj.b_acct_id + "_property";

    let sql_fetchCurr = "SELECT pmi.id,pmi.party_id,pmi.amount,pmi.property_type_cost_id,"
    +" pmi.scheme_code,pmi.sub_scheme_code,pmi.pay_status,pmi.challan_no,DATE_FORMAT(pmi.challan_date,'%Y-%m-%d') AS challan_date,"
    +"pti.party_name,pti.party_phone_no,pti.party_father_or_husband_name,ptf.property_type_id,ptf.property_type_code,"
    +"ptf.LENGTH,ptf.width,pfi.property_no,ptf.measurement_unit,sub.application_bank_code,sub.application_acct_no,sub.application_ifsc_code,sub.application_branch_code"
    +" FROM (SELECT * FROM "+db+".party_emi WHERE party_id="+SqlString.escape(obj.party_id)+") pmi JOIN "+db+".sub_scheme_info sub "
    +"  ON pmi.sub_scheme_code=sub.sub_scheme_code"
    +"  JOIN "+db+".party_info pti ON pmi.party_id=pti.party_id"
    +" JOIN (SELECT * FROM "+db+".arrangement_info WHERE party_id="+SqlString.escape(obj.party_id)+"  AND arr_type_code='ALLOTTED' AND arr_status_code='ALLOTTED')arr"
    +" ON arr.party_id=pmi.party_id"
    +" JOIN "+db+".property_type_info ptf ON ptf.property_type_id=arr.property_type_id"
    +" JOIN "+db+".property_info pfi ON pfi.property_id=arr.property_id" 
        
    mysqlPool.query(sql_fetchCurr, function (error, results) {
        if (error) {
            console.log("Error-->routes-->Interface-->property-->emi-->getPartyEmi", error)
            objectToSend["error"] = true
            objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
            res.send(objectToSend);
        } else {
            objectToSend["error"] = false
            objectToSend["data"] = results
            res.send(objectToSend);
        }
    })
})



router.put('/generatePartyEmi', (req, res) => {

    let objectToSend = {}

    let obj = req.body


    let db = "svayam_" + obj.b_acct_id + "_property";

    let sql_fetchCurr = "update "+db+".party_emi set pay_status="+SqlString.escape(obj.pay_status)+",challan_no="+SqlString.escape(obj.challan_no) 
    +",challan_date="+SqlString.escape(obj.challan_date)+" where id="+SqlString.escape(obj.id) 
        
    mysqlPool.query(sql_fetchCurr, function (error, results) {
        if (error) {
            console.log("Error-->routes-->Interface-->property-->emi-->generatePartyEmi", error)
            objectToSend["error"] = true
            objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
            res.send(objectToSend);
        } else {
            objectToSend["error"] = false
            objectToSend["data"] = 'Generated Successfully.'
            res.send(objectToSend);
        }
    })
})

module.exports=router;
