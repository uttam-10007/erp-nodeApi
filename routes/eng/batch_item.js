var express = require('express');
var router = express.Router();
var SqlString = require('sqlstring');
var propObj = require('../../config_con')
let mysqlPool = require('../../connections/mysqlConnection');
var moment = require('moment')

router.post('/insertbatchitem', (req, res) => {
    let objectToSend = {}
    let obj = req.body;
    let b_acct_id = obj.b_acct_id;
    let create_timestamp=SqlString.escape(moment().format('YYYY-MM-DD HH:mm:ss'))

    let query = "INSERT INTO svayam_" + b_acct_id + "_eng.batch_item(batch_item_desc,batch_item_code,activity_code,output_capacity_unit,output_capacity_quantity,costing_rate_unit,overhead,contractor_prof,remark,costing_rate_at_site,data,create_user_id,create_timestamp)VALUES ("
    +SqlString.escape(obj.batch_item_desc)+","+SqlString.escape(obj.batch_item_code)+","+SqlString.escape(obj.activity_code)+","+SqlString.escape(obj.output_capacity_unit)+","+SqlString.escape(obj.output_capacity_quantity)+","+SqlString.escape(obj.costing_rate_unit)+","+SqlString.escape(obj.overhead)+","+SqlString.escape(obj.contractor_prof)+","+SqlString.escape(obj.remark)+","+SqlString.escape(obj.costing_rate_at_site)+","+SqlString.escape(obj.data)+","+SqlString.escape(obj.create_user_id)+","+create_timestamp+")"

    mysqlPool.query(query, function (error, results) {
        if (error) {
            console.log("Error-->routes-->eng-->batchitem-->insertbatchitem--", error)
            objectToSend["error"] = true
            objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
            res.send(objectToSend);
        } else {
            objectToSend["error"] = false
            objectToSend["data"] = "Inserted Successfully"
            res.send(objectToSend);
        }
    })
})

router.get('/getbatchitem:dtls', (req, res) => {

    let objectToSend = {}

    let b_acct_id = req.params.dtls;



    let sql_fetchCurr = "SELECT * from svayam_" + b_acct_id + "_eng.batch_item";
    mysqlPool.query(sql_fetchCurr, function (error, results) {
        if (error) {
            console.log("Error-->routes-->eng-->batchitem-->getbatchitem--", error)
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

router.put('/updatebatchitem', (req, res) => {
    let objectToSend = {}
    let obj = req.body;
   
    let b_acct_id = obj.b_acct_id;
    let update_timestamp=SqlString.escape(moment().format('YYYY-MM-DD HH:mm:ss'))
    let query = "update svayam_" + b_acct_id + "_eng.batch_item set "
    +"batch_item_desc="+SqlString.escape(obj.batch_item_desc)+",batch_item_code="+SqlString.escape(obj.batch_item_code)+","
    +"activity_code="+SqlString.escape(obj.activity_code)+",output_capacity_unit="+SqlString.escape(obj.output_capacity_unit)+","
    +"output_capacity_quantity="+SqlString.escape(obj.output_capacity_quantity)+",costing_rate_unit="+SqlString.escape(obj.costing_rate_unit)+","
    +"overhead="+SqlString.escape(obj.overhead)+",contractor_prof="+SqlString.escape(obj.contractor_prof)+","
    +"remark="+SqlString.escape(obj.remark)+",update_user_id="+SqlString.escape(obj.update_user_id)+","
    +"costing_rate_at_site="+SqlString.escape(obj.costing_rate_at_site)+",data="+SqlString.escape(obj.data)+","
    +"update_timestamp="+update_timestamp+" where batch_item_id ="+SqlString.escape(obj.batch_item_id)

    mysqlPool.query(query, function (error, results) {
        if (error) {
            console.log("Error-->routes-->eng-->batchitem-->updatebatchitem--", error)
            objectToSend["error"] = true
            objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
            res.send(objectToSend);
        } else {
            objectToSend["error"] = false
            objectToSend["data"] = "update successfully"
            res.send(objectToSend);
        }
    })
})

router.delete('/deletebatchitem:dtls',(req,res)=>{
    let objectToSend={}

    let obj=JSON.parse(req.params.dtls)

    let b_acct_id=obj["b_acct_id"]
    let batch_item_id=obj["batch_item_id"]

    let sql="delete from svayam_"+b_acct_id+"_eng.batch_item where batch_item_id in (" + batch_item_id.join(",")+")"

    mysqlPool.query(sql,function(error,results){
        if(error){
            console.log("Error-->routes-->eng-->batchitem-->deletebatchitem", error)
            objectToSend["error"] = true
            objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
            res.send(objectToSend);
        }else{
            objectToSend["error"] = false
            objectToSend["data"] = " Deleted Successfully" 
            res.send(objectToSend);
        }
    })

})





module.exports = router;
