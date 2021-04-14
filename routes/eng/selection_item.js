var express = require('express');
var router = express.Router();
var SqlString = require('sqlstring');
var propObj = require('../../config_con')
let mysqlPool = require('../../connections/mysqlConnection');
var moment = require('moment')

router.post('/createitemselection', (req, res) => {
    let objectToSend = {}
    let obj = req.body;
    let b_acct_id = obj.b_acct_id;
    let create_timestamp=SqlString.escape(moment().format('YYYY-MM-DD HH:mm:ss'))

    let query = "INSERT INTO svayam_" + b_acct_id + "_eng.sor_selection_item(sor_item_category,region_cd,circle_cd,data,item_id,prod_cd,proj_cd,bud_cd,act_cd,create_user_id,create_timestamp)VALUES ("
    +SqlString.escape(obj.sor_item_category)+","+SqlString.escape(obj.region_cd)+","+SqlString.escape(obj.circle_cd)+","+SqlString.escape(obj.data)+","+SqlString.escape(obj.item_id)+","+SqlString.escape(obj.prod_cd)+","+SqlString.escape(obj.proj_cd)+","+SqlString.escape(obj.bud_cd)+","+SqlString.escape(obj.act_cd)+","+SqlString.escape(obj.create_user_id)+","+create_timestamp+")"

    mysqlPool.query(query, function (error, results) {
        if (error) {
            console.log("Error-->routes-->eng-->selection_item-->createitemselection--", error)
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

router.get('/getselectionitem:dtls', (req, res) => {

    let objectToSend = {}

    let b_acct_id = req.params.dtls;



    let sql_fetchCurr = "SELECT * from svayam_" + b_acct_id + "_eng.sor_selection_item";
    mysqlPool.query(sql_fetchCurr, function (error, results) {
        if (error) {
            console.log("Error-->routes-->eng-->selection_item-->getselectionitem--", error)
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

router.put('/updateselectionitem', (req, res) => {
    let objectToSend = {}
    let obj = req.body;
   
    let b_acct_id = obj.b_acct_id;
    let update_timestamp=SqlString.escape(moment().format('YYYY-MM-DD HH:mm:ss'))
    let query = "update svayam_" + b_acct_id + "_eng.sor_selection_item set "
    +"sor_item_category="+SqlString.escape(obj.sor_item_category)+",region_cd="+SqlString.escape(obj.region_cd)+","
    +"circle_cd="+SqlString.escape(obj.circle_cd)+",data="+SqlString.escape(obj.data)+",item_id ="+SqlString.escape(obj.item_id)+",prod_cd ="+SqlString.escape(obj.prod_cd)+",proj_cd ="+SqlString.escape(obj.proj_cd)
    +",bud_cd ="+SqlString.escape(obj.bud_cd)+",act_cd ="+SqlString.escape(obj.act_cd)+",update_user_id="+SqlString.escape(obj.update_user_id)+","   
    +"update_timestamp="+update_timestamp+" where id ="+SqlString.escape(obj.id)

    mysqlPool.query(query, function (error, results) {
        if (error) {
            console.log("Error-->routes-->eng-->selection_item-->updateselectionitem--", error)
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

router.delete('/deleteselectionitem:dtls',(req,res)=>{
    let objectToSend={}

    let obj=JSON.parse(req.params.dtls)

    let b_acct_id=obj["b_acct_id"]
    let id=obj["id"]

    let sql="delete from svayam_"+b_acct_id+"_eng.sor_selection_item where id in (" + id.join(",")+")"

    mysqlPool.query(sql,function(error,results){
        if(error){
            console.log("Error-->routes-->eng-->selection_item-->deleteselectionitem", error)
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