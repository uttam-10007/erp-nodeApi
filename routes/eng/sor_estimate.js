var express = require('express');
var router = express.Router();
var SqlString = require('sqlstring');
var propObj = require('../../config_con')
let mysqlPool = require('../../connections/mysqlConnection');
var moment = require('moment')

router.post('/createsorestimate', (req, res) => {
    let objectToSend = {}
    let obj = req.body;
    let b_acct_id = obj.b_acct_id;
    let create_timestamp=SqlString.escape(moment().format('YYYY-MM-DD HH:mm:ss'))

    let query = "INSERT INTO svayam_" + b_acct_id + "_eng.sor_estimate(region_cd,circle_cd,data,prod_cd,proj_cd,bud_cd,act_cd,est_bud,remark,create_user_id,create_timestamp)VALUES ("
    +SqlString.escape(obj.region_cd)+","+SqlString.escape(obj.circle_cd)+","+SqlString.escape(obj.data)+","+SqlString.escape(obj.prod_cd)+","+SqlString.escape(obj.proj_cd)+","+SqlString.escape(obj.bud_cd)+","+SqlString.escape(obj.act_cd)+","+SqlString.escape(obj.est_bud)+","+SqlString.escape(obj.remark)+","+SqlString.escape(obj.create_user_id)+","+create_timestamp+")"

    mysqlPool.query(query, function (error, results) {
        if (error) {
            console.log("Error-->routes-->eng-->sorestimate-->createsorestimate--", error)
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

router.get('/getsorestimate:dtls', (req, res) => {

    let objectToSend = {}

    let b_acct_id = req.params.dtls;



    let sql_fetchCurr = "SELECT * from svayam_" + b_acct_id + "_eng.sor_estimate";
    mysqlPool.query(sql_fetchCurr, function (error, results) {
        if (error) {
            console.log("Error-->routes-->eng-->sorestimate-->getsorestimate--", error)
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

router.put('/updatesorestimate', (req, res) => {
    let objectToSend = {}
    let obj = req.body;
   
    let b_acct_id = obj.b_acct_id;
    let update_timestamp=SqlString.escape(moment().format('YYYY-MM-DD HH:mm:ss'))
    let query = "update svayam_" + b_acct_id + "_eng.sor_estimate set "
    +"region_cd="+SqlString.escape(obj.region_cd)+","
    +"circle_cd="+SqlString.escape(obj.circle_cd)+",data="+SqlString.escape(obj.data)+",prod_cd ="+SqlString.escape(obj.prod_cd)+",proj_cd ="+SqlString.escape(obj.proj_cd)
    +",bud_cd ="+SqlString.escape(obj.bud_cd)+",act_cd ="+SqlString.escape(obj.act_cd)+",est_bud ="+SqlString.escape(obj.est_bud)+",remark ="+SqlString.escape(obj.remark)+",update_user_id="+SqlString.escape(obj.update_user_id)+","   
    +"update_timestamp="+update_timestamp+" where id ="+SqlString.escape(obj.id)

    mysqlPool.query(query, function (error, results) {
        if (error) {
            console.log("Error-->routes-->eng-->sorestimate-->updatesorestimate--", error)
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

router.delete('/deletesorestimate:dtls',(req,res)=>{
    let objectToSend={}

    let obj=JSON.parse(req.params.dtls)

    let b_acct_id=obj["b_acct_id"]
    let id=obj["id"]

    let sql="delete from svayam_"+b_acct_id+"_eng.sor_estimate where id in (" + id.join(",")+")"

    mysqlPool.query(sql,function(error,results){
        if(error){
            console.log("Error-->routes-->eng-->sorestimate-->deletesorestimate", error)
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