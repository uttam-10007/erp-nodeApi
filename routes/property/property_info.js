var express = require('express');
var router = express.Router();
var SqlString = require('sqlstring');
var propObj = require('../../config_con.js')
let mysqlPool = require('../../connections/mysqlConnection.js');
var moment = require('moment')


router.get('/getproperty:dtls', (req, res) => {

    let objectToSend = {}

    let obj =JSON.parse(req.params.dtls);


    let db = "svayam_" + obj.b_acct_id + "_property";

    let sql_fetchCurr = "SELECT pr.*,pt.scheme_code,pt.sub_scheme_code FROM (Select * from "+db +".property_info WHERE property_status = "+SqlString.escape(obj.property_status)+") pr "
    +"JOIN (SELECT * FROM "+db +".property_type_info WHERE scheme_code = "+SqlString.escape(obj.scheme_code)+" AND sub_scheme_code = "+SqlString.escape(obj.sub_scheme_code)+") pt ON pt.property_type_id = pr.property_type_id "

    mysqlPool.query(sql_fetchCurr, function (error, results) {
        if (error) {
            console.log("Error-->routes-->property-->property_master_data-->getproperty--", error)
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

// router.post('/createpro',(req,res)=>{
// let obj =req.body;
// let objectToSend={}
// let db ="svayam_" + obj.b.acct_id + "_property";
// let create_user_id = SqlString.escape(obj.create_user_id);
// let create_user_id = SqlString.escape(moment().format('YYYY-MM-DD HH:mm:ss'))
// let sql_insert="insert into "+db+".property_info (property_no,property_type_id,propert_status,create_user_id,create_timestamp) value " + "("
// +SqlString.escape(obj.property_no)
// + ","+SqlString.escape(obj.property_id)+",'UNALLOTED ',"+create_user_id +","+create_timestamp+")"


// mysqlPool.query(sql_insert, function (error, results) {
//     if (error) {
//         console.log("Error-->routes-->property-->property_master_data-->createproperty-->", error)
//         objectToSend["error"] = true;
//         if (error.message != undefined || error.message != null) {
//             if (error.message.includes("already exists")) {
//                 objectToSend["data"] = "Possible duplicates"
//             } else {
//                 objectToSend["data"] = "Duplicate Code Entry"
//             }
//         } else {
//             objectToSend["data"] = "Some error occured at server Side. Please try again later"
//         }

//         res.send(objectToSend)
//     } else {

//         objectToSend["error"] = false;
//         objectToSend["data"] = results.insertId
//         res.send(objectToSend)
//     }
// })

// })

router.post('/createproperty', (req, res) => {
    let obj = req.body;

    let objectToSend = {}
    let db = "svayam_" + obj.b_acct_id + "_property";

    let create_user_id = SqlString.escape(obj.create_user_id)
    let create_timestamp = SqlString.escape(moment().format('YYYY-MM-DD HH:mm:ss'))

    let sql_insert = "insert into " + db + ".property_info (property_no,property_type_id,property_status,create_user_id,create_timestamp) values" + " ("
         + SqlString.escape(obj.property_no)
        + "," + SqlString.escape(obj.property_type_id) + ", 'UNALLOTTED'  ," + create_user_id + "," + create_timestamp + ") "

    mysqlPool.query(sql_insert, function (error, results) {
        if (error) {
            console.log("Error-->routes-->property-->property_master_data-->createproperty-->", error)
            objectToSend["error"] = true;
            if (error.message != undefined || error.message != null) {
                if (error.message.includes("already exists")) {
                    objectToSend["data"] = "Possible duplicates"
                } else {
                    objectToSend["data"] = "Duplicate Code Entry"
                }
            } else {
                objectToSend["data"] = "Some error occured at server Side. Please try again later"
            }

            res.send(objectToSend)
        } else {

            objectToSend["error"] = false;
            objectToSend["data"] = results.insertId
            res.send(objectToSend)
        }
    })

})

router.put('/updateProperty', (req, res) => {
    let obj = req.body
    let db = "svayam_" + obj.b_acct_id + "_property";

    let objectToSend = {}
    let update_timestamp = SqlString.escape(moment().format('YYYY-MM-DD HH:mm:ss'))
    let sql = "update " + db + ".property_info set property_no=" + SqlString.escape(obj.property_no)
        + ",property_type_id=" + SqlString.escape(obj.property_type_id) + ",property_status=" + SqlString.escape(obj.property_status) + ",update_user_id=" + SqlString.escape(obj.update_user_id) + ",update_timestamp=" + update_timestamp
        + " where property_id=" + SqlString.escape(obj.property_id) + ";"



    mysqlPool.query(sql, function (error1, results1) {
        if (error1) {
            console.log("Error-->routes-->property-->property_master_data-->updateProperty", error1)
            objectToSend["error"] = true;
            objectToSend["data"] = "Some error occured at server Side. Please try again later"
            res.send(objectToSend)
        } else {
            objectToSend["error"] = false;
            objectToSend["data"] = "Updated successfully"
            res.send(objectToSend)
        }
    })


})

router.delete('/deleteproperty:dtls',(req,res)=>{
    let objectToSend={}

    let obj=JSON.parse(req.params.dtls)

    let b_acct_id=obj["b_acct_id"]
    let property_id=obj["property_id"]

    let sql="delete from svayam_"+b_acct_id+"_property.property_info where property_id="+SqlString.escape(property_id)

    mysqlPool.query(sql,function(error,results){
        if(error){
            console.log("Error-->routes-->hr-->settings-->approval-->deleteapprovalstatus", error)
            objectToSend["error"] = true
            objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
            res.send(objectToSend);
        }else{
            objectToSend["error"] = false
            objectToSend["data"] = " deleted successfully" 
            res.send(objectToSend);
        }
    })

})

module.exports = router;
