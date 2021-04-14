var express = require('express');
var router = express.Router();
var SqlString = require('sqlstring');
var propObj = require('../../config_con')
let mysqlPool = require('../../connections/mysqlConnection');
var moment = require('moment')

router.post('/createConsumptionAnalysis', (req, res) => {
    let objectToSend = {}
    let obj = req.body;
    let b_acct_id = obj.b_acct_id;
    let create_timestamp=SqlString.escape(moment().format('YYYY-MM-DD HH:mm:ss'))

    let query = "INSERT INTO svayam_" + b_acct_id + "_eng.consumption_analysis (field_measurement_id,analys_desc,est_id,est_desc,remark,proj_cd,prod_cd,bud_cd,act_cd,cal_amt,data,create_user_id,create_timestamp)VALUES ("
 +SqlString.escape(obj.field_measurement_id)+","+SqlString.escape(obj.analys_desc)+","   +SqlString.escape(obj.est_id)+","+SqlString.escape(obj.est_desc)+","+SqlString.escape(obj.remark)+","+SqlString.escape(obj.proj_cd)+","+SqlString.escape(obj.prod_cd)+","+SqlString.escape(obj.bud_cd)+","+SqlString.escape(obj.act_cd)+","+SqlString.escape(obj.cal_amt)+","+SqlString.escape(obj.data)+","+SqlString.escape(obj.create_user_id)+","+create_timestamp+")"

    mysqlPool.query(query, function (error, results) {
        if (error) {
            console.log("Error-->routes-->eng-->consumption_analysis-->createConsumptionAnalysis--", error)
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

router.get('/getConsumptionAnalysis:dtls', (req, res) => {

    let objectToSend = {}

    let b_acct_id = req.params.dtls;



    let sql_fetchCurr = "SELECT * from svayam_"+ b_acct_id +"_eng.consumption_analysis";
    mysqlPool.query(sql_fetchCurr, function (error, results) {
        if (error) {
            console.log("Error-->routes-->eng-->consumption_analysis-->getConsumptionAnalysis--", error)
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

router.put('/updateConsumptionAnalysis', (req, res) => {
    let objectToSend = {}
    let obj = req.body;
   
    let b_acct_id = obj.b_acct_id;
    let update_timestamp=SqlString.escape(moment().format('YYYY-MM-DD HH:mm:ss'))
    let query = "update svayam_" + b_acct_id + "_eng.consumption_analysis set analys_desc="+SqlString.escape(obj.analys_desc)+"," 
    +"est_desc="+SqlString.escape(obj.est_desc)+",remark="+SqlString.escape(obj.remark)+",field_measurement_id="+SqlString.escape(obj.field_measurement_id)+","
    +"proj_cd="+SqlString.escape(obj.proj_cd)+",prod_cd="+SqlString.escape(obj.prod_cd)+","
    +"bud_cd="+SqlString.escape(obj.bud_cd)+",act_cd="+SqlString.escape(obj.act_cd)+","
    +"cal_amt="+SqlString.escape(obj.cal_amt)+",update_user_id="+SqlString.escape(obj.update_user_id)+","
    +"data="+SqlString.escape(obj.data)+",est_id="+SqlString.escape(obj.est_id)+","
    +"update_timestamp="+update_timestamp+" where id ="+SqlString.escape(obj.id)

    mysqlPool.query(query, function (error, results) {
        if (error) {
            console.log("Error-->routes-->eng-->consumption_analysis-->updateConsumptionAnalysis--", error)
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





router.delete('/deleteConsumptionAnalysis:dtls',(req,res)=>{
    let objectToSend={}

    let obj=JSON.parse(req.params.dtls)

    let b_acct_id=obj["b_acct_id"]
    let id=obj["id"]

    let sql="delete from svayam_"+b_acct_id+"_eng.consumption_analysis where id in (" + id.join(",")+")"

    mysqlPool.query(sql,function(error,results){
        if(error){
            console.log("Error-->routes-->eng-->batchitem-->deleteConsumptionAnalysis", error)
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
