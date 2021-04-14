var express = require('express');
var router = express.Router();
var SqlString = require('sqlstring');
var propObj = require('../../../config_con')
let mysqlPool = require('../../../connections/mysqlConnection');
var moment=require('moment')


router.get('/getPayMatrix:dtls',(req,res)=>{
    let objectToSend={}

    let obj=JSON.parse(req.params.dtls)

    let b_acct_id=obj["b_acct_id"]
    let pay_band=obj["pay_band"]
    let grade_pay_code=obj["grade_pay_code"]
    let level_code=obj["level_code"]

    let sql="Select id,pay_band,grade_pay_code,level_code,basic_pay,create_user_id,update_user_id,"
    + "DATE_FORMAT(create_timestamp,'%Y-%m-%d %H:%i:%S') as create_timestamp,DATE_FORMAT(update_timestamp,'%Y-%m-%d %H:%i:%S') as "
    + "update_timestamp from svayam_"+b_acct_id+"_hr.pay_matrix "

    let flag=true;
    if(pay_band!=undefined){
        if(flag){
            sql+=" where pay_band="+SqlString.escape(pay_band)
            flag=false
        }else{
            sql+=" and pay_band="+SqlString.escape(pay_band)
        }
    }
    if(grade_pay_code!=undefined){
        if(flag){
            sql+=" where grade_pay_code="+SqlString.escape(grade_pay_code)
            flag=false
        }else{
            sql+=" and grade_pay_code="+SqlString.escape(grade_pay_code)
        }
    }
    if(level_code!=undefined){
        if(flag){
            sql+=" where level_code="+SqlString.escape(level_code)
            flag=false
        }else{
            sql+=" and level_code="+SqlString.escape(level_code)
        }
    }
    
    mysqlPool.query(sql, function (error, results) {
        if (error) {
            console.log("Error-->routes-->hr-->payroll_info-->payMatrix-->getPayMatrix--", error)
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

router.post('/addPayMatrix',(req,res)=>{
    let objectToSend={}

    let obj=req.body
    let b_acct_id=obj["b_acct_id"]
    let matrix_data=obj["matrix_data"]

    let sql="insert into svayam_"+b_acct_id+"_hr.pay_matrix (pay_band,grade_pay_code,level_code,basic_pay,create_user_id,create_timestamp) values"
    
    for(let i=0;i<matrix_data.length;i++){
        let temp=matrix_data[i]

        let pay_band=SqlString.escape(temp["pay_band"])
        let grade_pay_code=SqlString.escape(temp["grade_pay_code"])
        let level_code=SqlString.escape(temp["level_code"])
        let basic_pay=SqlString.escape(temp["basic_pay"])
        let create_user_id=SqlString.escape(temp["create_user_id"])
        let create_timestamp=SqlString.escape(moment().format('YYYY-MM-DD HH:mm:ss'))

        sql+="("+pay_band+","+grade_pay_code+","+level_code+","+basic_pay+","+create_user_id+","+create_timestamp+")"

        if(i<matrix_data.length-1){
            sql+=","
        }
        
    }
    mysqlPool.query(sql, function (error, results) {
        if (error) {
            console.log("Error-->routes-->hr-->payroll_info-->payMatrix-->addPayMatrix--", error)
            objectToSend["error"] = true
            objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
            res.send(objectToSend);
        } else {
            objectToSend["error"] = false
            objectToSend["data"] = "Matrix values inserted"
            res.send(objectToSend);
        }
    })

})

router.put('/updatePayMatrix',(req,res)=>{
    let objectToSend={}

    let temp=req.body

    let b_acct_id=temp["b_acct_id"]
    let id=SqlString.escape(temp["id"])
    let pay_band=SqlString.escape(temp["pay_band"])
    let grade_pay_code=SqlString.escape(temp["grade_pay_code"])
    let level_code=SqlString.escape(temp["level_code"])
    let basic_pay=SqlString.escape(temp["basic_pay"])
    let update_user_id=SqlString.escape(temp["update_user_id"])
    let update_timestamp=SqlString.escape(moment().format('YYYY-MM-DD HH:mm:ss'))

    let sql="update svayam_"+b_acct_id+"_hr.pay_matrix set pay_band="+pay_band+",grade_pay_code="+grade_pay_code+",level_code="+level_code+","
        +"basic_pay="+basic_pay+",update_user_id="+update_user_id+",update_timestamp="+update_timestamp+" where id="+id

    mysqlPool.query(sql, function (error, results) {
        if (error) {
            console.log("Error-->routes-->hr-->payroll_info-->payMatrix-->addPayMatrix--", error)
            objectToSend["error"] = true
            objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
            res.send(objectToSend);
        } else {
            objectToSend["error"] = false
            objectToSend["data"] = "Matrtix updated"
            res.send(objectToSend);
        }
    })
})

router.delete('deletePayMatrix:dtls',(req,res)=>{
    let objectToSend={}

    let obj=JSON.parse(req.params.dtls)

    let b_acct_id=obj["b_acct_id"]
    let id=SqlString.escape(obj["id"])

    let sql="delete from svayam_"+b_acct_id+"_hr.pay_matrix where id="+id

    mysqlPool.query(sql, function (error, results) {
        if (error) {
            console.log("Error-->routes-->hr-->payroll_info-->payMatrix-->deletePayMatrix--", error)
            objectToSend["error"] = true
            objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
            res.send(objectToSend);
        } else {
            objectToSend["error"] = false
            objectToSend["data"] = "Matrix Cell deleted"
            res.send(objectToSend);
        }
    })
})

module.exports=router;
