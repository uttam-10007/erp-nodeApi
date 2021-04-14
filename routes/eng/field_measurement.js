var express = require('express');
var router = express.Router();
var SqlString = require('sqlstring');
var propObj = require('../../config_con')
let mysqlPool = require('../../connections/mysqlConnection');
var moment = require('moment')

router.post('/createfieldmeasurement', (req, res) => {
    let objectToSend = {}
    let obj = req.body;
    let b_acct_id = obj.b_acct_id;
    let create_timestamp=SqlString.escape(moment().format('YYYY-MM-DD HH:mm:ss'))

    let query = "INSERT INTO svayam_" + b_acct_id + "_eng.field_measurement(field_measurement_desc,est_id,est_desc,remark,proj_cd,prod_cd,bud_cd,act_cd,est_amt,data,create_user_id,create_timestamp)VALUES ("
 +SqlString.escape(obj.field_measurement_desc)+","   +SqlString.escape(obj.est_id)+","+SqlString.escape(obj.est_desc)+","+SqlString.escape(obj.remark)+","+SqlString.escape(obj.proj_cd)+","+SqlString.escape(obj.prod_cd)+","+SqlString.escape(obj.bud_cd)+","+SqlString.escape(obj.act_cd)+","+SqlString.escape(obj.est_amt)+","+SqlString.escape(obj.data)+","+SqlString.escape(obj.create_user_id)+","+create_timestamp+")"

    mysqlPool.query(query, function (error, results) {
        if (error) {
            console.log("Error-->routes-->eng-->field_measurement-->createfieldmeasurement--", error)
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

router.get('/getfieldmeasurement:dtls', (req, res) => {

    let objectToSend = {}

    let b_acct_id = req.params.dtls;



    let sql_fetchCurr = "SELECT * from svayam_"+ b_acct_id +"_eng.field_measurement";
    mysqlPool.query(sql_fetchCurr, function (error, results) {
        if (error) {
            console.log("Error-->routes-->eng-->field_measurement-->getfieldmeasurement--", error)
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

router.put('/updatefieldmeasurement', (req, res) => {
    let objectToSend = {}
    let obj = req.body;
   
    let b_acct_id = obj.b_acct_id;
    let update_timestamp=SqlString.escape(moment().format('YYYY-MM-DD HH:mm:ss'))
    let query = "update svayam_" + b_acct_id + "_eng.field_measurement set field_measurement_desc="+SqlString.escape(obj.field_measurement_desc)+"," 
    +"est_desc="+SqlString.escape(obj.est_desc)+",remark="+SqlString.escape(obj.remark)+","
    +"proj_cd="+SqlString.escape(obj.proj_cd)+",prod_cd="+SqlString.escape(obj.prod_cd)+","
    +"bud_cd="+SqlString.escape(obj.bud_cd)+",act_cd="+SqlString.escape(obj.act_cd)+","
    +"est_amt="+SqlString.escape(obj.est_amt)+",update_user_id="+SqlString.escape(obj.update_user_id)+","
    +"data="+SqlString.escape(obj.data)+",est_id="+SqlString.escape(obj.est_id)+","
    +"update_timestamp="+update_timestamp+" where id ="+SqlString.escape(obj.id)

    mysqlPool.query(query, function (error, results) {
        if (error) {
            console.log("Error-->routes-->eng-->field_measurement-->updatefieldmeasurement--", error)
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





router.delete('/deletefieldmeasurement:dtls',(req,res)=>{
    let objectToSend={}

    let obj=JSON.parse(req.params.dtls)

    let b_acct_id=obj["b_acct_id"]
    let id=obj["id"]

    let sql="delete from svayam_"+b_acct_id+"_eng.field_measurement where id in (" + id.join(",")+")"

    mysqlPool.query(sql,function(error,results){
        if(error){
            console.log("Error-->routes-->eng-->batchitem-->deletefieldmeasurement", error)
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
