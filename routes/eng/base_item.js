var express = require('express');
var router = express.Router();
var SqlString = require('sqlstring');
var propObj = require('../../config_con')
let mysqlPool = require('../../connections/mysqlConnection');
var moment = require('moment')

router.post('/insertbaseitem', (req, res) => {
    let objectToSend = {}
    let obj = req.body;
    let b_acct_id = obj.b_acct_id;
    let create_timestamp=SqlString.escape(moment().format('YYYY-MM-DD HH:mm:ss'))

    let query = "INSERT INTO svayam_" + b_acct_id + "_eng.base_item(base_item_desc,base_item_code,activity_code,output_capacity_unit,output_capacity_quantity,costing_rate_unit,costing_rate_at_source,costing_rate_at_site,remark,create_user_id,create_timestamp)VALUES ("
    +SqlString.escape(obj.base_item_desc)+","+SqlString.escape(obj.base_item_code)+","+SqlString.escape(obj.activity_code)+","+SqlString.escape(obj.output_capacity_unit)+","+SqlString.escape(obj.output_capacity_quantity)+","+SqlString.escape(obj.costing_rate_unit)+","+SqlString.escape(obj.costing_rate_at_source)+","+SqlString.escape(obj.costing_rate_at_site)+","+SqlString.escape(obj.remark)+","+SqlString.escape(obj.create_user_id)+","+create_timestamp+")"

    mysqlPool.query(query, function (error, results) {
        if (error) {
            console.log("Error-->routes-->eng-->baseitem-->insertbaseitem--", error)
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

router.get('/getbaseitem:dtls', (req, res) => {

    let objectToSend = {}

    let b_acct_id = req.params.dtls;



    let sql_fetchCurr = "SELECT * from svayam_" + b_acct_id + "_eng.base_item";
    mysqlPool.query(sql_fetchCurr, function (error, results) {
        if (error) {
            console.log("Error-->routes-->account-->ip-->getip--", error)
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

router.put('/updatebaseitem', (req, res) => {
    let objectToSend = {}
    let obj = req.body;
   
    let b_acct_id = obj.b_acct_id;
    let update_timestamp=SqlString.escape(moment().format('YYYY-MM-DD HH:mm:ss'))
    let query = "update svayam_" + b_acct_id + "_eng.base_item set "
    +"base_item_desc="+SqlString.escape(obj.base_item_desc)+",base_item_code="+SqlString.escape(obj.base_item_code)+","
    +"activity_code="+SqlString.escape(obj.activity_code)+",output_capacity_unit="+SqlString.escape(obj.output_capacity_unit)+","
    +"output_capacity_quantity="+SqlString.escape(obj.output_capacity_quantity)+",costing_rate_unit="+SqlString.escape(obj.costing_rate_unit)+","
    +"costing_rate_at_source="+SqlString.escape(obj.costing_rate_at_source)+",costing_rate_at_site="+SqlString.escape(obj.costing_rate_at_site)+","
    +"remark="+SqlString.escape(obj.remark)+",update_user_id="+SqlString.escape(obj.update_user_id)+","
    +"update_timestamp="+update_timestamp+" where base_item_id ="+SqlString.escape(obj.base_item_id)

    mysqlPool.query(query, function (error, results) {
        if (error) {
            console.log("Error-->routes-->eng-->baseitem-->updatebaseitem--", error)
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


router.delete('/deletebaseitem:dtls',(req,res)=>{
    let objectToSend={}

    let obj=JSON.parse(req.params.dtls)

    let b_acct_id=obj["b_acct_id"]
    let base_item_id=obj["base_item_id"]

    let sql="delete from svayam_"+b_acct_id+"_eng.base_item where base_item_id in (" + base_item_id.join(",")+")"

    mysqlPool.query(sql,function(error,results){
        if(error){
            console.log("Error-->routes-->eng-->baseitem-->deletebaseitem", error)
            objectToSend["error"] = true
            objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
            res.send(objectToSend);
        }else{
            objectToSend["error"] = false
            objectToSend["data"] = "Deleted Successfully" 
            res.send(objectToSend);
        }
    })

})




module.exports = router;