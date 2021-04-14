var express = require('express');
var router = express.Router();
var SqlString = require('sqlstring');
var propObj = require('../../../config_con')
let mysqlPool = require('../../../connections/mysqlConnection');


router.get('/getallotment:dtls', (req, res) => {

    let objectToSend = {}

    let obj = JSON.parse(req.params.dtls);


    let db = "svayam_" + obj.b_acct_id + "_property";
    let sql_fetchCurr ="SELECT pp.party_id,pp.party_name,pti.property_type_code,pri.property_no,pti.length,pti.width,pti.final_amount FROM (SELECT * FROM "+ db +".arrangement_info WHERE scheme_code="+SqlString.escape(obj.scheme_code)+" AND sub_scheme_code="+SqlString.escape(obj.sub_scheme_code)+" AND arr_type_code='ALLOTTED' AND arr_status_code='ALLOTTED') arr"
    +" JOIN "+ db +".party_info pp ON arr.party_id=pp.party_id JOIN "+ db +".property_type_info pti ON pti.property_type_id=arr.property_type_id "
    +"JOIN "+ db +".property_info pri ON pri.property_id=arr.property_id" 
    mysqlPool.query(sql_fetchCurr, function (error, results) {
        if (error) {
            console.log("Error-->routes-->interface-->property-->allotment-->getallotment--", error)
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

router.get('/letterOfallotment:dtls', (req, res) => {

    let objectToSend = {}

    let obj = JSON.parse(req.params.dtls);


    let db = "svayam_" + obj.b_acct_id + "_property";
 let sql="SELECT pmi.party_id,group_concat(pmi.amount) AS amount,group_concat(pmi.property_type_cost_id) AS property_type_cost_id, "
   +" arr.scheme_code,arr.sub_scheme_code,sub.mode_of_allotement,DATE_FORMAT(arr.arr_effective_date,'%Y-%m-%d') as arr_effective_date,group_concat(pmi.pay_status) AS pay_status,group_concat(pmi.challan_no) AS challan_no, "
   +" group_concat(DATE_FORMAT(pmi.challan_date,'%Y-%m-%d')) AS challan_date,pti.party_name,pti.party_phone_no, "
   +" pti.party_father_or_husband_name,ptf.property_type_id,ptf.property_type_code,pfi.property_no "
    +" FROM (SELECT * FROM "+db+".party_emi WHERE scheme_code="+SqlString.escape(obj.scheme_code)+"  AND sub_scheme_code="+SqlString.escape(obj.sub_scheme_code)
    +"  AND party_id="+SqlString.escape(obj.party_id)+" )pmi "
    +" JOIN "+db+".sub_scheme_info sub ON pmi.sub_scheme_code=sub.sub_scheme_code "

   +" JOIN "+db+".party_info pti ON pmi.party_id=pti.party_id"
   +" JOIN (SELECT * FROM "+db+".arrangement_info WHERE scheme_code="+SqlString.escape(obj.scheme_code)+" AND sub_scheme_code="+SqlString.escape(obj.sub_scheme_code)
   +" AND arr_type_code='ALLOTTED' AND arr_status_code='ALLOTTED' AND party_id="+SqlString.escape(obj.party_id)+")arr ON arr.party_id=pmi.party_id"
   +" JOIN "+db+".property_type_info ptf ON ptf.property_type_id=arr.property_type_id"
   +" JOIN "+db+".property_info pfi ON pfi.property_id=arr.property_id"
   +" GROUP BY pmi.party_id,arr.scheme_code,arr.sub_scheme_code,sub.mode_of_allotement,arr.arr_effective_date,pti.party_name,pti.party_phone_no,pti.party_father_or_husband_name,"
   +" ptf.property_type_id,ptf.property_type_code,pfi.property_no"

console.log(sql);
    mysqlPool.query(sql, function (error, results) {
        if (error) {
            console.log("Error-->routes-->interface-->property-->allotment-->getallotmentDetails-->", error)
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


router.get('/getotp:dtls', (req, res) => {

    let objectToSend = {}

    let obj = JSON.parse(req.params.dtls);


    let db = "svayam_" + obj.b_acct_id + "_property";

    var sql="SELECT * FROM (SELECT * FROM "+db+".arrangement_info WHERE scheme_code="+SqlString.escape(obj.scheme_code)
    +" AND sub_scheme_code="+SqlString.escape(obj.sub_scheme_code)
    +" AND arr_type_code='ALLOTTED' AND arr_status_code='ALLOTTED' AND party_id="+SqlString.escape(obj.party_id)
    +" ) AS p JOIN "+db+".party_info AS q ON p.party_id=q.party_id where q.party_phone_no="+SqlString.escape(obj.party_phone_no);
    
    mysqlPool.query(sql, function (error, results) {
        if (error) {
            console.log("Error-->routes-->interface-->property-->allotment-->getotp--", error)
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

module.exports=router;
