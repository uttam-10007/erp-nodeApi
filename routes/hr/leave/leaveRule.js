var express = require('express');
var router = express.Router();
var SqlString = require('sqlstring');
var propObj = require('../../../config_con')
let mysqlPool = require('../../../connections/mysqlConnection');
var moment = require('moment')


router.get('/getAllRules:dtls',(req,res)=>{
    let objectToSend={}

    let obj=JSON.parse(req.params.dtls)

    let b_acct_id=obj["b_acct_id"]
    let leave_code=obj["leave_code"]
    let leave_rate=obj["leave_rate"]

    let sql="Select id,leave_code,leave_rate,is_leave_carry_fwd,num_of_leaves,renew_ind_on_year_change,create_user_id,update_user_id,"
    +"DATE_FORMAT(create_timestamp,'%Y-%m-%d %H:%i:%S') as create_timestamp,DATE_FORMAT(update_timestamp,'%Y-%m-%d %H:%i:%S') as "
    +"update_timestamp from svayam_"+b_acct_id+"_hr.leave_rule "

    let flag=true;

    if(leave_code!=undefined){
        if(flag){
            sql+=" where leave_code="+SqlString.escape(leave_code)
            flag=false;
        }else{
            sql+=" and leave_code="+SqlString.escape(leave_code)
        }
    }
    if(leave_rate!=undefined){
        if(flag){
            sql+=" where leave_rate="+SqlString.escape(leave_rate)
            flag=false;
        }else{
            sql+=" and leave_rate="+SqlString.escape(leave_rate)
        }
    }

    mysqlPool.query(sql, function (error, results) {
        if (error) {
            console.log("Error-->routes-->hr-->leave-->leaveRule-->getAllRules", error)
            objectToSend["error"] = true
            objectToSend["data"] = "Some error occured at server side. Please try again later.If problem persists, contact support."
            res.send(objectToSend);
        } else {
            objectToSend["error"] = false
            objectToSend["data"] = results
            res.send(objectToSend);
        }
    })
})


router.post('/addLeaveRule',(req,res)=>{
    let objectToSend={}

    let obj=req.body
    let b_acct_id=obj["b_acct_id"]
    let leave_code=SqlString.escape(obj["leave_code"])
    let leave_rate=SqlString.escape(obj["leave_rate"])
    let is_leave_carry_fwd=SqlString.escape(obj["is_leave_carry_fwd"])
    let num_of_leaves=SqlString.escape(obj["num_of_leaves"])
    let renew_ind_on_year_change=SqlString.escape(obj["renew_ind_on_year_change"])
    let create_user_id=SqlString.escape(obj["create_user_id"])
    let create_timestamp=SqlString.escape(moment().format('YYYY-MM-DD HH:mm:ss'))

    let sql="insert into svayam_"+b_acct_id+"_hr.leave_rule (leave_code,leave_rate,is_leave_carry_fwd,num_of_leaves,renew_ind_on_year_change,create_user_id,create_timestamp) values"
            +"("+leave_code+","+leave_rate+","+is_leave_carry_fwd+","+num_of_leaves+","+renew_ind_on_year_change+","+create_user_id+","+create_timestamp+")"

    mysqlPool.query(sql, function (error, results) {
        if (error) {
            console.log("Error-->routes-->hr-->leave-->leaveRule-->addLeaveRule", error)
            objectToSend["error"] = true
            objectToSend["data"] = "Some error occured at server side. Please try again later.If problem persists, contact support."
            res.send(objectToSend);
        } else {
            objectToSend["error"] = false
            objectToSend["data"] = results.insertId
            res.send(objectToSend);
        }
    })

})

router.delete('/deleteLeaveRule:dtls',(req,res)=>{
    let objectToSend={}

    let obj=JSON.parse(req.params.dtls)
    let b_acct_id=obj["b_acct_id"]
    let id=SqlString.escape(obj['id'])

    let sql="delete from svayam_"+b_acct_id+"_hr.leave_rule where id="+id

    mysqlPool.query(sql, function (error, results) {
        if (error) {
            console.log("Error-->routes-->hr-->leave-->leaveRule-->deleteRule", error)
            objectToSend["error"] = true
            objectToSend["data"] = "Some error occured at server side. Please try again later.If problem persists, contact support."
            res.send(objectToSend);
        } else {
            objectToSend["error"] = false
            objectToSend["data"] = "Rule deleted"
            res.send(objectToSend);
        }
    })
})

module.exports=router;