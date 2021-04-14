var express = require('express');
var router = express.Router();
var SqlString = require('sqlstring');
var propObj = require('../../config_con.js')
let mysqlPool = require('../../connections/mysqlConnection.js');
var moment = require('moment')


router.get('/getAllregistered:dtls', (req, res) => {

    let objectToSend = {}

    let obj = JSON.parse(req.params.dtls);


    let db = "svayam_" + obj.b_acct_id + "_property";

    let sql_fetchCurr = "SELECT pro.property_no,pty.property_type_code,ppi.party_name,ppi.party_id,ppi.party_email,ppi.party_phone_no,ppi.party_dob,arr.id,"
        + " arr.property_type_id,arr.scheme_code,arr.sub_scheme_code,arr.property_id ,"
        + " arr.application_amount,arr.application_challan_no,DATE_FORMAT( arr_effective_date,'%Y-%m-%d') as arr_effective_date FROM (SELECT * FROM  "
        + db + ".arrangement_info WHERE scheme_code =" + SqlString.escape(obj.scheme_code) + " "
        + "   and sub_scheme_code=" + SqlString.escape(obj.sub_scheme_code) + " AND arr_type_code ='REGISTERED' ) arr"
        + " JOIN " + db + ".party_info ppi ON ppi.party_id=arr.party_id"
 +" join " + db + ".property_info pro on arr.property_id=pro.property_id "
    +" join " + db + ".property_type_info pty on arr.property_type_id=pty.property_type_id"

    mysqlPool.query(sql_fetchCurr, function (error, results) {
        if (error) {
            console.log("Error-->routes-->property-->allotment-->getAllregistered", error)
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
router.get('/getdetailsForregistry:dtls', (req, res) => {

    let objectToSend = {}

    let obj = JSON.parse(req.params.dtls);


    let db = "svayam_" + obj.b_acct_id + "_property";

    let sql_fetchCurr = "SELECT ppi.party_name,ppi.party_email,ppi.party_phone_no,ppi.party_dob,"
    + " arr.*,pro.property_no,pty.property_type_code FROM (SELECT * FROM  "
    + db + ".arrangement_info WHERE arr_type_code ='ALLOTTED' AND arr_status_code='ALLOTTED'  and party_id="+SqlString.escape(obj.party_id)+") arr"
    + " JOIN " + db + ".party_info ppi ON ppi.party_id=arr.party_id "
    +"join " + db + ".property_info pro on arr.property_id=pro.property_id "
    +"join " + db + ".property_type_info pty on arr.property_type_id=pty.property_type_id"

mysqlPool.query(sql_fetchCurr, function (error, results) {
        if (error) {
            console.log("Error-->routes-->property-->allotment-->getdetailsForregistry", error)
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



router.post('/createregistry', (req, res) => {
    let obj = req.body;

    let objectToSend = {}
    let db = "svayam_" + obj.b_acct_id + "_property";
    let create_timestamp = SqlString.escape(moment().format('YYYY-MM-DD HH:mm:ss'))


    
        let sql_insert = "insert into " + db + ".arrangement_info(property_id,arr_type_code,arr_effective_date,party_id,scheme_code,sub_scheme_code,property_type_id,arr_status_code,"
                      +"create_user_id,create_timestamp) values "
  
       + " ( "+SqlString.escape(obj.property_id)+", 'REGISTERED' ," +SqlString.escape(obj.arr_effective_date)+ "," + SqlString.escape(obj.party_id) + ","
      + SqlString.escape(obj.scheme_code) + "," + SqlString.escape(obj.sub_scheme_code) + ","
      + SqlString.escape(obj.property_type_id) + ", 'COMPLETE'," + SqlString.escape(obj.create_user_id) + ","
      + create_timestamp + ")"
   
    

    mysqlPool.query(sql_insert, function (error3, results3) {
        if (error3) {
            console.log("Error-->routes-->property-->allotment-->createregistry", error3)
            objectToSend["error"] = true;
            objectToSend["data"] = "Some error occured at server Side. Please try again later"
            res.send(objectToSend)
     
        }
        else {
            objectToSend["error"] = false;
            objectToSend["data"] = "Registered Successfully"
            res.send(objectToSend)
        }
    })
})



// router.put('/updateregistry', (req, res) => {
//     let obj = req.body
//     let db = "svayam_" + obj.b_acct_id + "_property";

//     let objectToSend = {}
//     let update_timestamp = SqlString.escape(moment().format('YYYY-MM-DD HH:mm:ss'))

//     let sql3 = "update " + db + ".arrangement set arr_effective_date=" + SqlString.escape(obj.arr_effective_date) + ",update_timestamp=" + update_timestamp + ",update_user_id=" + SqlString.escape(obj.update_user_id) + " where arr_id=" + SqlString.escape(obj.arr_id) + " and arr_type_code='REGISTERED'"
//     mysqlPool.query(sql3, function (error, results3) {
//         if (error) {
//             console.log("Error-->routes-->property-->allotment-->updateregistry", error)
//             objectToSend["error"] = true;
//             objectToSend["data"] = "Some error occured at server Side. Please try again later"
//             res.send(objectToSend)
//             mysqlCon.rollback();
//             mysqlCon.release()
//         } else {
//             objectToSend["error"] = false;
//             objectToSend["data"] = "Updated Successfully"
//             res.send(objectToSend)
//         }

//     })
// })

module.exports = router;
