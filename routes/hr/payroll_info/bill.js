var express = require('express');
var router = express.Router();
var SqlString = require('sqlstring');
var propObj = require('../../../config_con')
let mysqlPool = require('../../../connections/mysqlConnection');
var moment = require('moment')




router.get('/getItReport:dtls', (req, res) => {
    let objectToSend = {}
    let obj = JSON.parse(req.params.dtls)
    let b_acct_id = obj["b_acct_id"]
    let temp_fin_year=obj["fin_year"]-1

    let sql =   "SELECT * FROM svayam_" + b_acct_id + "_hr.bill WHERE ((`fin_year`="+SqlString.escape(obj.fin_year)+") OR (`fin_year`="+SqlString.escape(temp_fin_year)+" AND `month`=3) ) and emp_id="+SqlString.escape(obj.emp_id)

console.log(sql)    

    mysqlPool.query(sql, function (error, results) {
        if (error) {
            console.log("Error-->routes-->hr-->bill-->bill-->getItReport", error)
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



router.get('/getAllBills:dtls', (req, res) => {
    let objectToSend = {}
    let obj = JSON.parse(req.params.dtls)
    let b_acct_id = obj["b_acct_id"]

    let sql = "Select id,bill_desc,bill_type, pay_component_code, pay_component_amt, num_of_days,emp_id, emp_name, fin_year, month, pay_code, bill_id, bill_status_code, section_code"
        + ",create_user_id,update_user_id,DATE_FORMAT(accrual_date,'%Y-%m-%d') as accrual_date, DATE_FORMAT(payment_date, '%Y-%m-%d') as payment_date, "
        + "DATE_FORMAT(bill_date, '%Y-%m-%d') as bill_date,DATE_FORMAT(create_timestamp,'%Y-%m-%d %H:%i:%S') as create_timestamp, DATE_FORMAT(update_timestamp, '%Y-%m-%d %H:%i:%S') as"
        + " update_timestamp from svayam_" + b_acct_id + "_hr.bill"

    if (obj['bill_id'] != undefined) {
        sql += " where bill_id=" + SqlString.escape(obj.bill_id)
    }

    mysqlPool.query(sql, function (error, results) {
        if (error) {
            console.log("Error-->routes-->hr-->bill-->bill-->getAllBill", error)
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
router.get('/getMonthlyBill:dtls', (req, res) => {
    let objectToSend = {}
    let obj = JSON.parse(req.params.dtls)
    let b_acct_id = obj["b_acct_id"];
    let fin_year = SqlString.escape(obj.fin_year);
    let month = SqlString.escape(obj.month);

    let sql = "Select id,bill_desc,bill_type, pay_component_code, pay_component_amt,num_of_days, emp_id, emp_name, fin_year, month, pay_code, bill_id, bill_status_code, section_code"
        + ",create_user_id,update_user_id,DATE_FORMAT(accrual_date,'%Y-%m-%d') as accrual_date, DATE_FORMAT(payment_date, '%Y-%m-%d') as payment_date, "
        + "DATE_FORMAT(bill_date, '%Y-%m-%d') as bill_date,DATE_FORMAT(create_timestamp,'%Y-%m-%d %H:%i:%S') ascreate_timestamp, DATE_FORMAT(update_timestamp, '%Y-%m-%d %H:%i:%S') as"
        + "update_timestamp from svayam_" + b_acct_id + "_hr.bill where fin_year="+fin_year
if(obj.month!=undefined){
sql += " and month="+month
}



    mysqlPool.query(sql, function (error, results) {
        if (error) {
            console.log("Error-->routes-->hr-->bill-->bill-->getAllBill", error)
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
router.get('/getPaySlip:dtls', (req, res) => {
    let objectToSend = {}
    let obj = JSON.parse(req.params.dtls)
    let b_acct_id = obj["b_acct_id"];
    let emp_id = SqlString.escape(obj.emp_id);
    let fin_year = SqlString.escape(obj.fin_year);
    let month = SqlString.escape(obj.month);

    let sql = "Select id,bill_desc,bill_type, pay_component_code, pay_component_amt,num_of_days, emp_id, emp_name, fin_year, month, pay_code, bill_id, bill_status_code, section_code"
        + ",create_user_id,update_user_id,DATE_FORMAT(accrual_date,'%Y-%m-%d') as accrual_date, DATE_FORMAT(payment_date, '%Y-%m-%d') as payment_date, "
        + "DATE_FORMAT(bill_date, '%Y-%m-%d') as bill_date,DATE_FORMAT(create_timestamp,'%Y-%m-%d %H:%i:%S') ascreate_timestamp, DATE_FORMAT(update_timestamp, '%Y-%m-%d %H:%i:%S') as"
        + "update_timestamp from svayam_" + b_acct_id + "_hr.bill where fin_year=" + fin_year
    if (obj.emp_id != undefined) {
        sql += " and emp_id=" + emp_id
    }
    if (obj.month != undefined) {
        sql += " and month=" + month
    }



    mysqlPool.query(sql, function (error, results) {
        if (error) {
            console.log("Error-->routes-->hr-->bill-->bill-->getAllBill", error)
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
router.get('/getAllBillId:dtls', (req, res) => {
    let objectToSend = {}
    let obj = JSON.parse(req.params.dtls)
    let b_acct_id = obj["b_acct_id"]

    let sql = "Select bill_id,bill_desc,bill_type,bill_status_code,accrual_date,section_code"
        + " from svayam_" + b_acct_id + "_hr.bill where fin_year="+SqlString.escape(obj.fin_year)+" and month="+SqlString.escape(obj.month)+" group by bill_id,bill_desc,bill_type,bill_status_code,accrual_date";

    if (obj['bill_id'] != undefined) {
        sql += " where bill_id=" + SqlString.escape(obj.bill_id)
    }

    mysqlPool.query(sql, function (error, results) {
        if (error) {
            console.log("Error-->routes-->hr-->bill-->bill-->getAllBill", error)
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

router.get('/getbillbydate:dtls', (req, res) => {
    let objectToSend = {}
    let obj = JSON.parse(req.params.dtls)
    let b_acct_id = obj["b_acct_id"]

    let sql = "Select bill_id,bill_desc,bill_type,bill_status_code,accrual_date,section_code"
        + " from svayam_" + b_acct_id + "_hr.bill where fin_year="+SqlString.escape(obj.fin_year)+" and  MONTH(bill_date) ="+ SqlString.escape(obj.month) + " group by bill_id,bill_desc,bill_type,bill_status_code,accrual_date";

    if (obj['bill_id'] != undefined) {
        sql += " where bill_id=" + SqlString.escape(obj.bill_id)
    }
console.log(sql)
    mysqlPool.query(sql, function (error, results) {
        if (error) {
            console.log("Error-->routes-->hr-->bill-->bill-->getAllBill", error)
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



router.post('/addBill', (req, res) => {
    let objectToSend = {}

    let obj = req.body
    let arr = obj.data;
    let b_acct_id = obj["b_acct_id"]
    // let create_user_id=SqlString.escape(obj["create_user_id"])
    let create_timestamp = SqlString.escape(moment().format('YYYY-MM-DD HH:mm:ss'))
    let billIdQuery = "select max(bill_id) as bill_id from svayam_"+b_acct_id+"_hr.bill"
    mysqlPool.getConnection(function (error, mysqlCon) {
        if (error) {
            console.log("Error-->routes-->hr-->bill-->bill-->addBill", error)
            objectToSend["error"] = true
            objectToSend["data"] = "Some error occured at server side. Please try again later.If problem persists, contact support."
            res.send(objectToSend);
        } else {
            mysqlCon.beginTransaction(function (error1) {
                if (error1) {
                    console.log("Error-->routes-->hr-->bill-->bill-->addBill", error1)
                    objectToSend["error"] = true
                    objectToSend["data"] = "Some error occured at server side. Please try again later.If problem persists, contact support."
                    res.send(objectToSend);
                    mysqlCon.release()
                } else {
                    mysqlCon.query(billIdQuery, function (error2, results) {
                        if (error2) {
                            console.log("Error-->routes-->hr-->bill-->bill-->addBill", error2)
                            objectToSend["error"] = true
                            objectToSend["data"] = "Some error occured at server side. Please try again later.If problem persists, contact support."
                            res.send(objectToSend);
                            mysqlCon.release()
                        } else {
                            let bill_id = 1 + results[0].bill_id

                            let sql = "insert into svayam_" + b_acct_id + "_hr.bill (bill_desc,bill_type, emp_id, emp_name, fin_year, month, pay_component_code,"
                            +" pay_component_amt,num_of_days, pay_code, accrual_date, bill_date, section_code, bill_id, bill_status_code, create_user_id, create_timestamp) values"
                            for (let i = 0; i < arr.length; i++) {
                                sql += "(" + SqlString.escape(arr[i]['bill_desc']) +","+SqlString.escape(arr[i]['bill_type']) + "," + SqlString.escape(arr[i]['emp_id']) + ","
                                    + SqlString.escape(arr[i]['emp_name']) + "," + SqlString.escape(arr[i]['fin_year']) + ","
                                    + SqlString.escape(arr[i]['month']) + "," + SqlString.escape(arr[i]['pay_component_code']) + "," + SqlString.escape(arr[i]['pay_component_amt']) + "," + SqlString.escape(arr[i]['num_of_days']) + ","
                                    + SqlString.escape(arr[i]['pay_code']) + "," + SqlString.escape(arr[i]['accrual_date']) + "," + SqlString.escape(arr[i]['bill_date']) + "," + SqlString.escape(arr[i]['section_code']) + "," + SqlString.escape(bill_id) + ","
                                    + SqlString.escape(arr[i]['bill_status_code']) + "," + SqlString.escape(arr[i]['create_user_id']) + "," + create_timestamp + ")"
                                if (i != arr.length - 1) {
                                    sql += ","
                                }

                            }
                            mysqlCon.query(sql, function (error21, results2) {
                                if (error21) {
                                    console.log("Error-->routes-->hr-->bill-->bill-->addBill", error21)
                                    objectToSend["error"] = true
                                    objectToSend["data"] = "Some error occured at server side. Please try again later.If problem persists, contact support."
                                    res.send(objectToSend);
                                    mysqlCon.rollback()
                                    mysqlCon.release()
                                } else {
                                    mysqlCon.commit(function (error3) {
                                        if (error3) {
                                            console.log("Error-->routes-->hr-->bill-->bill-->addBill", error3)
                                            objectToSend["error"] = true
                                            objectToSend["data"] = "Some error occured at server side. Please try again later.If problem persists, contact support."
                                            res.send(objectToSend);
                                            mysqlCon.rollback()
                                            mysqlCon.release()
                                        } else {
                                            objectToSend["error"] = false
                                            objectToSend["data"] = bill_id
                                            res.send(objectToSend);
                                            mysqlCon.release()
                                        }
                                    })
                                }
                            })
                        }
                    })
                }
            })
        }
    })
})

router.put('/changeStatusOfBill', (req, res) => {

    let objectToSend = {}

    let obj = req.body

    let b_acct_id = obj["b_acct_id"]
    let bill_id = SqlString.escape(obj["bill_id"])
    let update_user_id = SqlString.escape(obj["update_user_id"])
   let update_timestamp = SqlString.escape(moment().format('YYYY-MM-DD HH:mm:ss'))
    //let payment_date = SqlString.escape(obj["payment_date"])

    let bill_status_code = SqlString.escape(obj["bill_status_code"])




    let sql = "update svayam_" + b_acct_id + "_hr.bill set bill_status_code = "+bill_status_code+", update_user_id = "+update_user_id+" "
        + ", update_timestamp=" + update_timestamp + " where bill_id=" + bill_id

    mysqlPool.query(sql, function (error, results) {
        if (error) {
            console.log("Error-->routes-->hr-->bill-->bill-->changeStatusOfBill", error)
            objectToSend["error"] = true
            objectToSend["data"] = "Some error occured at server side. Please try again later.If problem persists, contact support."
            res.send(objectToSend);
        } else {
            objectToSend["error"] = false
            objectToSend["data"] = "updated successfully"
            res.send(objectToSend);
        }
    })
})


router.delete('/deleteBill:dtls', (req, res) => {
    let objectToSend = {}
    let obj = JSON.parse(req.params.dtls)
    let b_acct_id = obj["b_acct_id"]
    let bill_id = SqlString.escape(obj["bill_id"])

    let sql = "delete from svayam_" + b_acct_id + "_hr.bill where bill_id=" + bill_id

    mysqlPool.query(sql, function (error, results) {
        if (error) {
            console.log("Error-->routes-->hr-->bill-->bill-->deleteBill", error)
            objectToSend["error"] = true
            objectToSend["data"] = "Some error occured at server side. Please try again later.If problem persists, contact support."
            res.send(objectToSend);
        } else {
            objectToSend["error"] = false
            objectToSend["data"] = 'Deleted Successfully!'
            res.send(objectToSend);
        }
    })


})


router.put('/updateBill', (req, res) => {

    let objectToSend = {}

    let obj = req.body
    let b_acct_id = obj["b_acct_id"]
    let emp_id = SqlString.escape(obj["emp_id"])
    let emp_name = SqlString.escape(obj["emp_name"])
    let fin_year = SqlString.escape(obj["fin_year"])
    let month = SqlString.escape(obj["month"])
    let pay_component_code = SqlString.escape(obj["pay_component_code"])
    let pay_component_amt = SqlString.escape(obj["pay_component_amt"])
    let num_of_days = SqlString.escape(obj["num_of_days"])
    let pay_code = SqlString.escape(obj["pay_code"])
    let accrual_date = SqlString.escape(obj["accrual_date"])
    let bill_date = SqlString.escape(obj["bill_date"])
    let section_code = SqlString.escape(obj["section_code"])
    let bill_id = SqlString.escape(obj["bill_id"])
    let bill_status_code = SqlString.escape(obj["bill_status_code"])
    let id = SqlString.escape(obj["id"])
    let update_user_id = SqlString.escape(obj["update_user_id"])
    let update_timestamp = SqlString.escape(moment().format('YYYY-MM-DD HH:mm:ss'))
    let payment_date = SqlString.escape(obj["payment_date"])





    let sql = "update svayam_" + b_acct_id + "_hr.bill set payment_date=" + payment_date
        + ",emp_id=" + emp_id + ",emp_name=" + emp_name
        + ",fin_year=" + fin_year + ",month=" + month
        + ",pay_component_code=" + pay_component_code + ",pay_component_amt=" + pay_component_amt
        + ",pay_code=" + pay_code + ",accrual_date=" + accrual_date
        + ",bill_date="+bill_date+",section_code=" + section_code + ",bill_id=" + bill_id
        + ",bill_status_code=" + bill_status_code + ",update_user_id=" + update_user_id
        + ", update_timestamp=" + update_timestamp + " where id=" + id

    mysqlPool.query(sql, function (error, results) {
        if (error) {
            console.log("Error-->routes-->hr-->bill-->bill-->updateBill", error)
            objectToSend["error"] = true
            objectToSend["data"] = "Some error occured at server side. Please try again later.If problem persists, contact support."
            res.send(objectToSend);
        } else {
            objectToSend["error"] = false
            objectToSend["data"] = "Updated successfully"
            res.send(objectToSend);
        }
    })
})



router.get('/getbillforSuspension:dtls', (req, res) => {
    let objectToSend = {};
    var obj = JSON.parse(req.params.dtls);
    let b_acct_id = obj.b_acct_id;

  var data = obj['data']
    let sql = "select * from svayam_" + b_acct_id + "_hr.bill where emp_id = " +SqlString.escape(obj["emp_id"])+" and"
     
    for (let i = 0; i < data.length; i++) {

        
    sql += "( fin_year ='"+ SqlString.escape(data[i].year) +"' and month ="+ SqlString.escape(data[i].month) +" )"

    if(i < data.length -1 ){
        sql+="or"
    }
    }
    

    mysqlPool.query(sql, function (error, results) {
        if (error) {
            console.log("Error-->routes-->hr-->payroll_info-->bill-->getbillforSuspension", error)
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

router.get('/getbill:dtls', (req, res) => {
    let objectToSend = {}
    let obj = JSON.parse(req.params.dtls)
    let b_acct_id = obj["b_acct_id"];
    let pay_component_code=obj.pay_component_code;
    let fin_year = SqlString.escape(obj.fin_year);
    let month = SqlString.escape(obj.month);

    let sql ="SELECT * FROM (SELECT * FROM  svayam_" + b_acct_id + "_hr.bill WHERE fin_year ="+fin_year+" AND MONTH = "+month+" AND pay_component_code in ( '"+pay_component_code.join("','")+"')) bl "
    +"JOIN svayam_" + b_acct_id + "_hr.emp_personal_info ep ON ep.emp_id = bl.emp_id " 
    +" JOIN (Select promotion_type_code,inc_month,id,emp_id,emp_name,employee_current_type_code,establishment_type_code,order_id,level_code,basic_pay,cadre_code,class_code,pay_commission_code,grade_pay_code,pay_scale_code,emp_status_code"
    + ",retirement_age,designation_code,DATE_FORMAT(effective_timestamp,'%Y-%m-%d %H:%i:%S') as effective_timestamp,create_user_id,"
    + "DATE_FORMAT(create_timestamp,'%Y-%m-%d %H:%i:%S') as create_timestamp,DATE_FORMAT(joining_date,'%Y-%m-%d') as joining_date,joining_type_code,DATE_FORMAT(joining_service_date,'%Y-%m-%d') as joining_service_date,"
    + "DATE_FORMAT(retirement_date,'%Y-%m-%d') as retirement_date,ordering_authority,DATE_FORMAT(probation_end_dt,'%Y-%m-%d') as probation_end_dt,probation_feedback,notice_period,designation_group_code,uniform_ind,conv_code,family_planning"
    // +" from svayam_"+b_acct_id+"_hr.establishment_info";
    + " from (Select *,rank() over(partition by emp_id order by effective_timestamp desc) as svm_rank from svayam_" + b_acct_id + "_hr.establishment_info )temp where svm_rank=1) ei ON ei.emp_id = bl.emp_id"
 

    mysqlPool.query(sql, function (error, results) {
        if (error) {
            console.log("Error-->routes-->hr-->bill-->bill-->getBill", error)
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


router.get('/getTDSReport:dtls', (req, res) => {

    let objectToSend = {}

    let obj = JSON.parse(req.params.dtls);


    let db = "svayam_" + obj.b_acct_id + "_hr";

 let sql="SELECT arr.*,emp.emp_pan_no,gross.gross_amount,tds.tds_amount FROM (SELECT emp_id,SUM(pay_component_amt)"
 +" AS gross_amount FROM  "+db+".bill WHERE fin_year ="+SqlString.escape(obj.fin_year)+"  AND MONTH = "+SqlString.escape(obj.month)+" AND pay_code = 'PAY' GROUP BY emp_id) gross "
 +" JOIN  (SELECT emp_id,emp_name,designation_code from (Select *,rank() over(partition by emp_id order by effective_timestamp desc) "
 +" as svm_rank from "+db+".establishment_info )temp where svm_rank=1) arr ON gross.emp_id=arr.emp_id"
+" JOIN (select emp_id,emp_pan_no from "+db+".emp_personal_info) emp ON gross.emp_id=emp.emp_id"
+" RIGHT JOIN (SELECT emp_id,SUM(pay_component_amt) AS tds_amount FROM  "+db+".bill WHERE fin_year ="+SqlString.escape(obj.fin_year)+" AND MONTH = "+SqlString.escape(obj.month)+" "
+" AND pay_component_code = 'IT' GROUP BY emp_id) AS tds ON gross.emp_id=tds.emp_id"

console.log(sql);
    mysqlPool.query(sql, function (error, results) {
        if (error) {
            console.log("Error-->routes-->hr-->payroll_info-->Abc-->getTDSReport-->", error)
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
router.get('/getMaxYearAndMonth:dtls', (req, res) => {

    let objectToSend = {}

    let obj = JSON.parse(req.params.dtls);


    let db = "svayam_" + obj.b_acct_id + "_hr";

    let sql = "SELECT MAX(fin_year) AS fin_year,MAX(MONTH) AS month FROM " + db + ".bill WHERE emp_id=" + SqlString.escape(obj.emp_id);

    console.log(sql);
    mysqlPool.query(sql, function (error, results) {
        if (error) {
            console.log("Error-->routes-->hr-->payroll_info-->bill-->getMaxYearAndMonth-->", error)
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


module.exports = router;
