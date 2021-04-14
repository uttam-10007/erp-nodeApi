var express = require('express');
var router = express.Router();
var SqlString = require('sqlstring');
var propObj = require('../../config_con.js')
let mysqlPool = require('../../connections/mysqlConnection.js');
var moment = require('moment')


router.get('/getAllPartyEmi:dtls', (req, res) => {
    let objectToSend = {}

    let obj = JSON.parse(req.params.dtls);


    let db = "svayam_" + obj.b_acct_id + "_property";


    let sql_fetchCurr = "SELECT id,party_id,scheme_code,sub_scheme_code,property_type_cost_id,amount,pay_status,"
    +"DATE_FORMAT( challan_date,'%Y-%m-%d') as challan_date,challan_no,create_user_id,update_user_id,"
    +"DATE_FORMAT(create_timestamp,'%Y-%m-%d %H:%i:%S') as create_timestamp,DATE_FORMAT(update_timestamp,'%Y-%m-%d %H:%i:%S') as update_timestamp  from  " 
    + db + ".party_emi WHERE scheme_code=" 
    + SqlString.escape(obj.scheme_code) + " AND sub_scheme_code=" + SqlString.escape(obj.sub_scheme_code)

    mysqlPool.query(sql_fetchCurr, function (error, results) {
        if (error) {
            console.log("Error-->routes-->interface-->property-->party_emi-->getAllPartyEmi--", error)
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



router.post('/addPartyEmi', (req, res) => {
    let objectToSend = {}

    let obj = req.body;

    let create_user_id=SqlString.escape(obj.create_user_id)
    let db = "svayam_" + obj.b_acct_id + "_property";
    let create_timestamp = SqlString.escape(moment().format('YYYY-MM-DD HH:mm:ss'))
    let dataArr=obj.data
    let scheme_code=SqlString.escape(obj.scheme_code)
    let sub_scheme_code=SqlString.escape(obj.sub_scheme_code)
    let party_id=SqlString.escape(obj.party_id)


    let sqlInsert= "insert into "+ db + ".party_emi (party_id,scheme_code,sub_scheme_code,property_type_cost_id,amount,pay_status,"
    +"challan_date,challan_no,create_user_id,create_timestamp)  values  " 
    for(let i=0;i<dataArr.length;i++){
        sqlInsert += "("+party_id+","+scheme_code+","+sub_scheme_code+","+SqlString.escape(dataArr[i]['property_type_cost_id'])
        +","+SqlString.escape(dataArr[i]['amount'])+",'ACTIVE',"+SqlString.escape(dataArr[i]['challan_date'])+","
        +SqlString.escape(dataArr[i]['challan_no'])+","+create_user_id+","+create_timestamp+")"
        if(i<dataArr.length-1){
            sqlInsert += ","
        }
    }
    mysqlPool.query(sqlInsert, function (error, results) {
        if (error) {
            console.log("Error-->routes-->interface-->property-->party_emi-->addPartyEmi--", error)
            objectToSend["error"] = true
            objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
            res.send(objectToSend);
        } else {
            objectToSend["error"] = false
            objectToSend["data"] = "Emi Added Successfully!"
            res.send(objectToSend);
        }
    })
});

router.delete('/deletepartyEmi:dtls', (req, res) => {
    let objectToSend = {}

    let obj = JSON.parse(req.params.dtls)

    let db = "svayam_" + obj.b_acct_id + "_property";
   

    let sqlInsert= "delete from "+ db + ".party_emi where id="+SqlString.escape(obj.id)
    mysqlPool.query(sqlInsert, function (error, results) {
        if (error) {
            console.log("Error-->routes-->interface-->property-->party_emi-->deletepartyEmi--", error)
            objectToSend["error"] = true
            objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
            res.send(objectToSend);
        } else {
            objectToSend["error"] = false
            objectToSend["data"] = "Emi Delete Successfully!"
            res.send(objectToSend);
        }
    })
});



router.put('/updateStatusPartyEmi', (req, res) => {

    let objectToSend = {}

    let obj = req.body


    let db = "svayam_" + obj.b_acct_id + "_property";

    let sql_fetchCurr = "update "+db+".party_emi set pay_status="+SqlString.escape(obj.pay_status)+",challan_no="+SqlString.escape(obj.challan_no) 
    +",challan_date="+SqlString.escape(obj.challan_date)+" where id="+SqlString.escape(obj.id) 
        
    mysqlPool.query(sql_fetchCurr, function (error, results) {
        if (error) {
            console.log("Error-->routes-->property-->party_emi-->updateStatusPartyEmi", error)
            objectToSend["error"] = true
            objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
            res.send(objectToSend);
        } else {
            objectToSend["error"] = false
            objectToSend["data"] = 'Updated Successfully.'
            res.send(objectToSend);
        }
    })
}
)


router.get('/getAllEmiDetails:dtls', (req, res) => {
    let objectToSend = {}

    let obj = JSON.parse(req.params.dtls);


    let db = "svayam_" + obj.b_acct_id + "_property";


    let sql_fetchCurr ="SELECT pmi.id,pmi.party_id,pmi.amount,pmi.property_type_cost_id,"
    +" pmi.scheme_code,pmi.sub_scheme_code,pmi.pay_status,pmi.challan_no,DATE_FORMAT(pmi.challan_date,'%Y-%m-%d') AS challan_date,pti.party_name,pti.party_phone_no,pti.party_father_or_husband_name,ptf.property_type_id,ptf.property_type_code,pfi.property_no"
    +"  FROM (SELECT * FROM "+db+".party_emi WHERE scheme_code=" + SqlString.escape(obj.scheme_code) + " AND sub_scheme_code=" + SqlString.escape(obj.sub_scheme_code) + " AND "
    +"  pay_status IN ('" + obj.pay_status.join("','") + "') )pmi "
    +"  JOIN "+db+".party_info pti ON pmi.party_id=pti.party_id"
    +"  JOIN (SELECT * FROM "+db+".arrangement_info WHERE scheme_code=" + SqlString.escape(obj.scheme_code) + " AND sub_scheme_code=" + SqlString.escape(obj.sub_scheme_code) + " AND arr_type_code='ALLOTTED' AND arr_status_code='ALLOTTED')arr"
    +"  ON arr.party_id=pmi.party_id JOIN "+db+".property_type_info ptf ON ptf.property_type_id=arr.property_type_id"
    +"   JOIN "+db+".property_info pfi ON pfi.property_id=arr.property_id"
    mysqlPool.query(sql_fetchCurr, function (error, results) {
        if (error) {
            console.log("Error-->routes-->property-->party_emi-->getAllEmiDetails--", error)
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

router.get('/getEmiApplicantStatus:dtls', (req, res) => {
    let objectToSend = {}

    let obj = JSON.parse(req.params.dtls);


    let db = "svayam_" + obj.b_acct_id + "_property";


    let sql_fetchCurr = "SELECT pmi.party_id,'INCOMPLETE' AS status ,pti.party_name,pti.party_phone_no,pti.party_father_or_husband_name,ptf.property_type_id,ptf.property_type_code,pfi.property_no"
        + " FROM (SELECT DISTINCT party_id FROM " + db + ".party_emi WHERE scheme_code=" + SqlString.escape(obj.scheme_code) + " AND sub_scheme_code=" + SqlString.escape(obj.sub_scheme_code) + " AND "
        + " pay_status IN ('ACTIVE','GENERATED') )pmi JOIN " + db + ".party_info pti ON pmi.party_id=pti.party_id"
        + "  JOIN (SELECT * FROM " + db + ".arrangement_info WHERE scheme_code=" + SqlString.escape(obj.scheme_code) + " AND sub_scheme_code=" + SqlString.escape(obj.sub_scheme_code) + "  AND arr_type_code='ALLOTTED' AND arr_status_code='ALLOTTED')arr"
        + "  ON arr.party_id=pmi.party_id JOIN " + db + ".property_type_info ptf ON ptf.property_type_id=arr.property_type_id"
        + "      JOIN " + db + ".property_info pfi ON pfi.property_id=arr.property_id"
        + " UNION SELECT pmi.party_id,'COMPLETE' AS status,pti.party_name,pti.party_phone_no,pti.party_father_or_husband_name,ptf.property_type_id,ptf.property_type_code,pfi.property_no"
        + " FROM (SELECT DISTINCT party_id FROM " + db + ".party_emi WHERE scheme_code=" + SqlString.escape(obj.scheme_code) + " AND sub_scheme_code=" + SqlString.escape(obj.sub_scheme_code) + " AND"
        + " pay_status IN ('COMPLETED') AND party_id NOT IN (SELECT DISTINCT party_id FROM " + db + ".party_emi WHERE scheme_code=" + SqlString.escape(obj.scheme_code) + " AND sub_scheme_code=" + SqlString.escape(obj.sub_scheme_code) + " AND "
        + " pay_status IN ('ACTIVE','GENERATED','INACTIVE'))) pmi  JOIN " + db + ".party_info pti ON pmi.party_id=pti.party_id"
        + "  JOIN (SELECT * FROM " + db + ".arrangement_info WHERE scheme_code=" + SqlString.escape(obj.scheme_code) + " AND sub_scheme_code=" + SqlString.escape(obj.sub_scheme_code) + "  AND arr_type_code='ALLOTTED' AND arr_status_code='ALLOTTED')arr"
        + " ON arr.party_id=pmi.party_id JOIN " + db + ".property_type_info ptf ON ptf.property_type_id=arr.property_type_id"
        + " JOIN " + db + ".property_info pfi ON pfi.property_id=arr.property_id"
    mysqlPool.query(sql_fetchCurr, function (error, results) {
        if (error) {
            console.log("Error-->routes-->property-->party_emi-->getEmiApplicantStatus--", error)
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
