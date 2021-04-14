var express = require('express');
var router = express.Router();
var propObj = require('../../../config_con')
var SqlString = require('sqlstring');
var moment = require('moment')

try {
    var mysqlPool = require('../../../connections/mysqlConnection.js');
} catch (ex) {
    console.log("Error-->routes-->signup-->require--", ex)
}






router.get('/getquantityOfPrevBill:dtls', (req, res) => {
    let objectToSend = {}


    let obj = JSON.parse(req.params.dtls)

    let db = "svayam_" + obj.b_acct_id + "_ebill";

    let sql_fetchCurr = "SELECT  SUM(quantity) AS quantity,sno  FROM "+db+".ebill_items  WHERE tender_id="+SqlString.escape(obj.tender_id)+" GROUP BY sno"

       


    mysqlPool.query(sql_fetchCurr, function (error, results) {
        if (error) {
            console.log("Error-->routes-->info-->ebill-->getquantityOfPrevBill--", error)
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

router.get('/getlastbillrate:dtls', (req, res) => {
    let objectToSend = {}


    let obj = JSON.parse(req.params.dtls)

    let db = "svayam_" + obj.b_acct_id + "_ebill";
    let bill_no = SqlString.escape(obj.bill_no)
    let sql_fetchCurr = "SELECT sno,rate  FROM " + db + ".ebill_items  WHERE tender_id=" + SqlString.escape(obj.tender_id) + " and  bill_no =" + bill_no



    mysqlPool.query(sql_fetchCurr, function (error, results) {
        if (error) {
            console.log("Error-->routes-->info-->ebill-->getlastbillrate--", error)
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








router.get('/getPrevRate:dtls', (req, res) => {
    let objectToSend = {}


    let obj = JSON.parse(req.params.dtls)

    let db = "svayam_" + obj.b_acct_id + "_ebill";

    let sql_fetchCurr = "SELECT * FROM " + db + ".ebill_items  WHERE tender_id=" + SqlString.escape(obj.tender_id) + " and is_part=" + SqlString.escape(obj.is_part)


    mysqlPool.query(sql_fetchCurr, function (error, results) {
        if (error) {
            console.log("Error-->routes-->info-->ebill-->getPrevRate--", error)
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

router.post('/insertPrevRate', (req, res) => {
    let obj = req.body;

    let objectToSend = {}

    let db = "svayam_" + obj.b_acct_id + "_ebill";
    let create_timestamp = SqlString.escape(moment().format('YYYY-MM-DD HH:mm:ss'))

    let sql = "insert into " + db + ".ebill_items (part_rate_id,is_part,sno,bill_no,eff_rate,rate,quantity,tender_id,create_user_id,create_timestamp) values "
        + "(" + SqlString.escape(obj.part_rate_id) + "," + SqlString.escape(obj.is_part) + "," + SqlString.escape(obj.sno) + "," + SqlString.escape(obj.bill_no)
        + "," + SqlString.escape(obj.eff_rate) + "," + SqlString.escape(obj.rate) + "," + SqlString.escape(obj.quantity) + ","
        + SqlString.escape(obj.tender_id) + "," + SqlString.escape(obj.create_user_id) + "," + create_timestamp + ")"



    mysqlPool.query(sql, function (error, results) {
        if (error) {
            console.log("Error-->routes-->info-->ebill-->insertPrevRate--", error)
            objectToSend["error"] = true
            objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
            res.send(objectToSend);
        } else {
            objectToSend["error"] = false
            objectToSend["data"] = results.insertId
            res.send(objectToSend);
        }
    })
})

router.put('/updatePrevRate', (req, res) => {
    let obj = req.body;

    let objectToSend = {}

    let db = "svayam_" + obj.b_acct_id + "_ebill";
    let update_timestamp = SqlString.escape(moment().format('YYYY-MM-DD HH:mm:ss'))

    let sql = "update " + db + ".ebill_items set rate=" + SqlString.escape(obj.rate) + ",quantity=" + SqlString.escape(obj.quantity)
        + ",update_user_id=" + SqlString.escape(obj.update_user_id) + ",update_timestamp=" + update_timestamp
        + " where id=" + SqlString.escape(obj.id)



    mysqlPool.query(sql, function (error, results) {
        if (error) {
            console.log("Error-->routes-->info-->ebill-->updatePrevRate--", error)
            objectToSend["error"] = true
            objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
            res.send(objectToSend);
        } else {
            objectToSend["error"] = false
            objectToSend["data"] = 'Updated Successfully.'
            res.send(objectToSend);
        }
    })
})

router.delete('/deletePrevRate:dtls', (req, res) => {


    let objectToSend = {}
    let obj = JSON.parse(req.params.dtls)

    let db = "svayam_" + obj.b_acct_id + "_ebill";

    let sql = "delete from  " + db + ".ebill_items  where id=" + SqlString.escape(obj.id)



    mysqlPool.query(sql, function (error, results) {
        if (error) {
            console.log("Error-->routes-->info-->ebill-->deletePrevRate--", error)
            objectToSend["error"] = true
            objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
            res.send(objectToSend);
        } else {
            objectToSend["error"] = false
            objectToSend["data"] = 'Deleted Successfully.'
            res.send(objectToSend);
        }
    })
})



router.get('/getWorkBudInfo:dtls', (req, res) => {
    let objectToSend = {}


    let obj = JSON.parse(req.params.dtls)

    let db = "svayam_" + obj.b_acct_id + "_ebill";

    let sql_fetchCurr = "SELECT bu.bud_cd,bu.bud_desc,bu.bud_amt,bu.expense_amount,bu.id AS bud_id,wi.id AS work_id "
        + "FROM " + db + ".work_info wi JOIN " + db + ".bud bu ON wi.budget_cd=bu.bud_cd"
        + " WHERE wi.id=" + SqlString.escape(obj.work_id)


    mysqlPool.query(sql_fetchCurr, function (error, results) {
        if (error) {
            console.log("Error-->routes-->info-->ebill-->getWorkBudInfo--", error)
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






router.get('/getdeduction:dtls', (req, res) => {
    let objectToSend = {}


    let obj = JSON.parse(req.params.dtls)

    let db = "svayam_" + obj.b_acct_id + "_ebill";

    let sql_fetchCurr = "Select * from " + db + ".ded"
    if (obj["bill_id"] != undefined) {

        sql_fetchCurr += " where bill_id =" + SqlString.escape(obj.bill_id)

    }



    mysqlPool.query(sql_fetchCurr, function (error, results) {
        if (error) {
            console.log("Error-->routes-->info-->ebill-->getdeduction--", error)
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

router.get('/getembbillforprint:dtls', (req, res) => {
    let objectToSend = {}


    let obj = JSON.parse(req.params.dtls)

    let db = "svayam_" + obj.b_acct_id + "_ebill";

    let sql_fetchCurr = "SELECT ei.sno,sum(ei.quantity) as q FROM " + db + ".ebill_info eb JOIN " + db + ".ebill_items ei ON eb.bill_no = ei.bill_no  WHERE eb.tender_id=" + SqlString.escape(obj.tender_id)
        + " and eb.emb_no < " + SqlString.escape(obj.emb_no) + " and ei.tender_id=" + SqlString.escape(obj.tender_id)
        + " and ei.is_part in (0,1) and ei.part_rate_id='-1'"

        + " group by sno"


    mysqlPool.query(sql_fetchCurr, function (error, results) {
        if (error) {
            console.log("Error-->routes-->info-->ebill-->getLastbill--", error)
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


router.post('/updatededuction', (req, res) => {
    let obj = req.body;

    let objectToSend = {}

    let db = "svayam_" + obj.b_acct_id + "_ebill";
    let create_timestamp = SqlString.escape(moment().format('YYYY-MM-DD HH:mm:ss'))
    let bill_amt = SqlString.escape(obj.bill_amt)
    let id = SqlString.escape(obj.id)
    let bill_id = SqlString.escape(obj.bill_id)

    let create_user_id = SqlString.escape(obj.create_user_id)

    let gst_data = SqlString.escape(obj.gst_data)


    let ded_amt = SqlString.escape(obj.ded_amt)
    let exempted_amt = SqlString.escape(obj.exempted_amt)
    let taxable_amt = SqlString.escape(obj.taxable_amt)


    let ded = obj['ded']
    let update_user_id = SqlString.escape(obj["update_user_id"])
    let update_timestamp = SqlString.escape(moment().format('YYYY-MM-DD HH:mm:ss'))


    let sql = "update svayam_" + obj.b_acct_id + "_ebill.ebill_info set ded_amt=" + ded_amt + ",bill_amt =" + bill_amt+",gst_data="+gst_data
        + ",exempted_amt=" +exempted_amt + ",taxable_amt =" + taxable_amt
        + ",pre_gst=" + SqlString.escape(obj.pre_gst) + ",pre_gst_amt =" + SqlString.escape(obj.pre_gst_amt)

        + ",cgst_per=" + SqlString.escape(obj.cgst_per) + ",sgst_per =" + SqlString.escape(obj.sgst_per)
        + ",add_with_held=" + SqlString.escape(obj.add_with_held) + ",add_security =" + SqlString.escape(obj.add_security)
        + ",cgst=" + SqlString.escape(obj.cgst) + ",sgst =" + SqlString.escape(obj.sgst)
        + ",igst=" + SqlString.escape(obj.igst) + ",igst_per =" + SqlString.escape(obj.igst_per)
        + ",per_withheld=" + SqlString.escape(obj.per_withheld) + ",temp_withheld =" + SqlString.escape(obj.temp_withheld)
        + ",rel_temp_withheld=" + SqlString.escape(obj.rel_temp_withheld) + ",per_withheld_remark =" + SqlString.escape(obj.per_withheld_remark)
        + ",temp_withheld_remark =" + SqlString.escape(obj.temp_withheld_remark)
        + ",withheldamount=" + SqlString.escape(obj.withheldamount) + ",withheldremanrk =" + SqlString.escape(obj.withheldremanrk)
        + ",update_user_id=" + update_user_id + ",update_timestamp=" + update_timestamp
        + " where id=" + SqlString.escape(id)
    let sql_del = "delete from  " + db + ".ded  where bill_id=" + id
    // let sqldelete = "delete from ded where bill_id" += bill_id
    mysqlPool.getConnection(function (error, mysqlCon) {
        if (error) {
            console.log("Error-->routes-->info-->ebill-->updatededuction--", error)
            objectToSend["error"] = true
            objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
            res.send(objectToSend);
        } else {
            mysqlCon.beginTransaction(function (error4) {
                if (error4) {
                    console.log("Error-->routes-->info-->ebill-->updatededuction--", error4)
                    objectToSend["error"] = true
                    objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
                    res.send(objectToSend);
                    mysqlCon.release();
                } else {
                    mysqlCon.query(sql + ";" + sql_del, function (error1, results) {
                        if (error1) {
                            console.log("Error-->routes-->info-->ebill-->updatededuction--", error1)
                            objectToSend["error"] = true;
                            objectToSend["data"] = "Some error occured at server Side. Please try again later"
                            res.send(objectToSend)
                            mysqlCon.rollback();
                            mysqlCon.release()
                        } else {



                            if (ded.length != 0) {
                                let sql2 = "insert into " + db + ".ded (deduction_id,bill_id,amt,apply_on,rate,type,sno,create_user_id,create_timestamp) values "
                                for (let i = 0; i < ded.length; i++) {
                                    sql2 += "(" + SqlString.escape(ded[i].deduction_id) + "," + SqlString.escape(bill_id) + "," + SqlString.escape(ded[i].amt) + "," + SqlString.escape(ded[i].apply_on) + "," + SqlString.escape(ded[i].rate) + "," + SqlString.escape(ded[i].type) + "," + SqlString.escape(ded[i].sno) + "," + create_user_id + "," + create_timestamp + ")"

                                    if (i < ded.length - 1) {
                                        sql2 += " , "
                                    }

                                }
                                mysqlCon.query(sql2, function (error1, results2) {
                                    if (error1) {
                                        console.log("Error-->routes-->info-->ebill-->updatededuction--", error1)
                                        objectToSend["error"] = true;
                                        objectToSend["data"] = "Some error occured at server Side. Please try again later"
                                        res.send(objectToSend)
                                        mysqlCon.rollback();
                                        mysqlCon.release()
                                    } else {

                                        mysqlCon.query('COMMIT', function (error2) {
                                            if (error2) {
                                                console.log("Error-->routes-->interface-->property-->booklet-->createparty--", error2)
                                                objectToSend["error"] = true;
                                                objectToSend["data"] = "Some error occured at server Side. Please try again later"
                                                res.send(objectToSend)
                                                mysqlCon.rollback();
                                                mysqlCon.release()
                                            } else {
                                                objectToSend["error"] = false;
                                                objectToSend["data"] = results.insertId
                                                res.send(objectToSend)

                                                mysqlCon.release()
                                            }

                                        })
                                    }
                                })
                            } else {
                                mysqlCon.query('COMMIT', function (error2) {
                                    if (error2) {
                                        console.log("Error-->routes-->interface-->property-->booklet-->createparty--", error2)
                                        objectToSend["error"] = true;
                                        objectToSend["data"] = "Some error occured at server Side. Please try again later"
                                        res.send(objectToSend)
                                        mysqlCon.rollback();
                                        mysqlCon.release()
                                    } else {
                                        objectToSend["error"] = false;
                                        objectToSend["data"] = results.insertId
                                        res.send(objectToSend)

                                        mysqlCon.release()
                                    }

                                })
                            }


                        }
                    })
                }
            })
        }


    })
})



router.get('/getpartratedata:dtls', (req, res) => {
    let objectToSend = {}


    let obj = JSON.parse(req.params.dtls)

    let db = "svayam_" + obj.b_acct_id + "_ebill";

    let sql_fetchCurr = "SELECT sno,sum(rate) as rate,part_rate_id  FROM " + db + ".ebill_items  WHERE tender_id=" + SqlString.escape(obj.tender_id) + " and  part_rate_id != -1 group by part_rate_id"
    let sql_fetchCurr1 = "SELECT *  FROM " + db + ".ebill_items  WHERE tender_id=" + SqlString.escape(obj.tender_id) + " and is_part in (1,2)"



    mysqlPool.query(sql_fetchCurr + ";" + sql_fetchCurr1, function (error, results) {
        if (error) {
            console.log("Error-->routes-->info-->ebill-->getLastbill--", error)
            objectToSend["error"] = true
            objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
            res.send(objectToSend);
        } else {
            objectToSend["error"] = false
            objectToSend["data"] = { part_rate_group: results[0], part_rate: results[1] }
            res.send(objectToSend);
        }
    })
})
router.get('/getbillforprint:dtls', (req, res) => {
    let objectToSend = {}


    let obj = JSON.parse(req.params.dtls)

    let db = "svayam_" + obj.b_acct_id + "_ebill";

    let sql_fetchCurr = "SELECT sno,sum(quantity) as q  FROM " + db + ".ebill_items  WHERE tender_id=" + SqlString.escape(obj.tender_id) + " group by sno"



    mysqlPool.query(sql_fetchCurr, function (error, results) {
        if (error) {
            console.log("Error-->routes-->info-->ebill-->getLastbill--", error)
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



router.get('/getLastbill:dtls', (req, res) => {
    let objectToSend = {}


    let obj = JSON.parse(req.params.dtls)

    let db = "svayam_" + obj.b_acct_id + "_ebill";
    let bill_no = SqlString.escape(obj.bill_no)
    let sql_fetchCurr = "SELECT *  FROM " + db + ".ebill_items  WHERE tender_id=" + SqlString.escape(obj.tender_id) + " and  bill_no <=" + bill_no



    mysqlPool.query(sql_fetchCurr, function (error, results) {
        if (error) {
            console.log("Error-->routes-->info-->ebill-->getLastbill--", error)
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



router.get('/getebill:dtls', (req, res) => {
    let objectToSend = {}


    let obj = JSON.parse(req.params.dtls)

    let db = "svayam_" + obj.b_acct_id + "_ebill";

    let sql_fetchCurr = "Select final_ind,per_withheld,temp_withheld,rel_temp_withheld,per_withheld_remark,temp_withheld_remark,cgst_per,sgst_per,pre_gst,pre_gst_amt,emb_no,with_held_amt,global_bill_no,allowance_sgst_percentage,allowance_cgst_percentage,part_data,status,is_final_bill,id,bill_no,work_order_id,bill_amount,data,ded_data,bill_desc,create_user_id,create_timestamp,update_timestamp,update_user_id from " + db + ".ebill"
    if (obj["work_order_id"] != undefined) {

        sql_fetchCurr += " where work_order_id =" + SqlString.escape(obj.work_order_id)

    }

    sql_fetchCurr += " ORDER BY id DESC"

    mysqlPool.query(sql_fetchCurr, function (error, results) {
        if (error) {
            console.log("Error-->routes-->info-->ebill-->getebill--", error)
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

    let db = "svayam_" + obj.b_acct_id + "_ebill";

    let sql_fetchCurr = "Select * from " + db + ".ebill_info"
    if (obj["tender_id"] != undefined) {

        sql_fetchCurr += " where tender_id =" + SqlString.escape(obj.tender_id)

    }

    if (obj["id"] != undefined) {

        sql_fetchCurr += " where id =" + SqlString.escape(obj.id)

    }


    sql_fetchCurr += " ORDER BY id DESC"

    mysqlPool.query(sql_fetchCurr, function (error, results) {
        if (error) {
            console.log("Error-->routes-->info-->ebill-->getebill--", error)
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


router.post('/createebill', (req, res) => {
    let obj = req.body;

    let objectToSend = {}

    let db = "svayam_" + obj.b_acct_id + "_ebill";
    let create_timestamp = SqlString.escape(moment().format('YYYY-MM-DD HH:mm:ss'))
    let bill_amt = SqlString.escape(obj.bill_amt)
    let tender_id = SqlString.escape(obj.tender_id)
    let bill_no = SqlString.escape(obj.bill_no)
    let is_sent = SqlString.escape(obj.is_sent)
    let bill_desc = SqlString.escape(obj.bill_desc)
    let create_user_id = SqlString.escape(obj.create_user_id)
    let bill_dt = SqlString.escape(moment().format('YYYY-MM-DD'))
    let status = SqlString.escape(obj.status)
    let cgst = SqlString.escape(obj.cgst)
    let sgst = SqlString.escape(obj.sgst)
    let withheldremanrk = SqlString.escape(obj.withheldremanrk)
    let withheldamount = SqlString.escape(obj.withheldamount)
    let emb_no = SqlString.escape(obj.emb_no)
    let ded_amt = SqlString.escape(obj.ded_amt)
    let pre_gst = SqlString.escape(obj.pre_gst)
    let pre_gst_amt = SqlString.escape(obj.pre_gst_amt)
    let cgst_per = SqlString.escape(obj.cgst_per)
    let sgst_per = SqlString.escape(obj.sgst_per)
    let add_with_held = SqlString.escape(obj.add_with_held)
    let add_security = SqlString.escape(obj.add_security)

    let final_ind = SqlString.escape(obj.final_ind)
    let per_withheld = SqlString.escape(obj.per_withheld)
    let temp_withheld = SqlString.escape(obj.temp_withheld)
    let rel_temp_withheld = SqlString.escape(obj.rel_temp_withheld)
    let per_withheld_remark = SqlString.escape(obj.per_withheld_remark)
    let temp_withheld_remark = SqlString.escape(obj.temp_withheld_remark)
    let gst_data = SqlString.escape(obj.gst_data)
    let exempted_amt = SqlString.escape(obj.exempted_amt)
    let taxable_amt = SqlString.escape(obj.taxable_amt)



    let igst = SqlString.escape(obj.igst)
    let igst_per = SqlString.escape(obj.igst_per)

    let data = obj['data']
    let ded = obj['ded']
    let sql = "insert into " + db + ".ebill_info (exempted_amt,taxable_amt,gst_data,igst,igst_per,final_ind,per_withheld,temp_withheld,rel_temp_withheld,per_withheld_remark,temp_withheld_remark,add_with_held,add_security,cgst_per,sgst_per,pre_gst,pre_gst_amt,ded_amt,emb_no,withheldamount,withheldremanrk,sgst,cgst,status,tender_id,bill_dt,bill_amt,is_sent,bill_no,bill_desc,create_user_id,create_timestamp) values "
        + "(" +exempted_amt+","+taxable_amt+","+ gst_data+","+igst + "," + igst_per + "," + final_ind + "," + per_withheld + "," + temp_withheld + "," + rel_temp_withheld + "," + per_withheld_remark + "," + temp_withheld_remark + ","
        + add_with_held + "," + add_security + "," + cgst_per + "," + sgst_per + "," + pre_gst + "," + pre_gst_amt + "," + ded_amt + "," + emb_no + "," + withheldamount + "," + withheldremanrk + "," + sgst + "," + cgst + "," + status + "," + tender_id + "," + bill_dt + "," + bill_amt + "," + is_sent + "," + bill_no + "," + bill_desc + "," + create_user_id + "," + create_timestamp + ")"

    mysqlPool.getConnection(function (error, mysqlCon) {
        if (error) {
            console.log("Error-->routes-->info-->ebill-->createEBill--", error)
            objectToSend["error"] = true
            objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
            res.send(objectToSend);
        } else {
            mysqlCon.beginTransaction(function (error4) {
                if (error4) {
                    console.log("Error-->routes-->info-->ebill-->createEBill--", error4)
                    objectToSend["error"] = true
                    objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
                    res.send(objectToSend);
                    mysqlCon.release();
                } else {
                    mysqlCon.query(sql, function (error1, results) {
                        if (error1) {
                            console.log("Error-->routes-->info-->ebill-->createEBill--", error1)
                            objectToSend["error"] = true;
                            objectToSend["data"] = "Some error occured at server Side. Please try again later"
                            res.send(objectToSend)
                            mysqlCon.rollback();
                            mysqlCon.release()
                        } else {
                            let sql1 = "insert into " + db + ".ebill_items (part_rate_id,is_part,sno,bill_no,eff_rate,rate,quantity,tender_id,create_user_id,create_timestamp) values "
                            for (let i = 0; i < data.length; i++) {
                                sql1 += "(" + SqlString.escape(data[i].part_rate_id) + "," + SqlString.escape(data[i].is_part) + "," + SqlString.escape(data[i].sno) + "," + bill_no + "," + SqlString.escape(data[i].eff_rate) + "," + SqlString.escape(data[i].rate) + "," + SqlString.escape(data[i].quantity) + "," + tender_id + "," + create_user_id + "," + create_timestamp + ")"

                                if (i < data.length - 1) {
                                    sql1 += " , "
                                }

                            }

                            mysqlCon.query(sql1, function (error1, results1) {
                                if (error1) {
                                    console.log("Error-->routes-->info-->ebill-->createEBill--", error1)
                                    objectToSend["error"] = true;
                                    objectToSend["data"] = "Some error occured at server Side. Please try again later"
                                    res.send(objectToSend)
                                    mysqlCon.rollback();
                                    mysqlCon.release()
                                } else {
                                    let bil_id = results.insertId

                                    if (ded.length != 0) {
                                        let sql2 = "insert into " + db + ".ded (deduction_id,bill_id,amt,apply_on,rate,type,sno,create_user_id,create_timestamp) values "
                                        for (let i = 0; i < ded.length; i++) {
                                            sql2 += "(" + SqlString.escape(ded[i].deduction_id) + "," + SqlString.escape(bil_id) + "," + SqlString.escape(ded[i].amt) + "," + SqlString.escape(ded[i].apply_on) + "," + SqlString.escape(ded[i].rate) + "," + SqlString.escape(ded[i].type) + "," + SqlString.escape(ded[i].sno) + "," + create_user_id + "," + create_timestamp + ")"

                                            if (i < ded.length - 1) {
                                                sql2 += " , "
                                            }

                                        }
                                        mysqlCon.query(sql2, function (error1, results2) {
                                            if (error1) {
                                                console.log("Error-->routes-->info-->ebill-->createEBill--", error1)
                                                objectToSend["error"] = true;
                                                objectToSend["data"] = "Some error occured at server Side. Please try again later"
                                                res.send(objectToSend)
                                                mysqlCon.rollback();
                                                mysqlCon.release()
                                            } else {

                                                mysqlCon.query('COMMIT', function (error2) {
                                                    if (error2) {
                                                        console.log("Error-->routes-->interface-->property-->booklet-->createparty--", error2)
                                                        objectToSend["error"] = true;
                                                        objectToSend["data"] = "Some error occured at server Side. Please try again later"
                                                        res.send(objectToSend)
                                                        mysqlCon.rollback();
                                                        mysqlCon.release()
                                                    } else {
                                                        objectToSend["error"] = false;
                                                        objectToSend["data"] = results.insertId
                                                        res.send(objectToSend)

                                                        mysqlCon.release()
                                                    }

                                                })
                                            }
                                        })
                                    } else {
                                        mysqlCon.query('COMMIT', function (error2) {
                                            if (error2) {
                                                console.log("Error-->routes-->interface-->property-->booklet-->createparty--", error2)
                                                objectToSend["error"] = true;
                                                objectToSend["data"] = "Some error occured at server Side. Please try again later"
                                                res.send(objectToSend)
                                                mysqlCon.rollback();
                                                mysqlCon.release()
                                            } else {
                                                objectToSend["error"] = false;
                                                objectToSend["data"] = results.insertId
                                                res.send(objectToSend)

                                                mysqlCon.release()
                                            }

                                        })
                                    }
                                }
                            })

                        }
                    })
                }
            })
        }


    })
})




router.delete('/deleteEbill:dtls', (req, res) => {
    let obj = JSON.parse(req.params.dtls)


    let objectToSend = {}
    let db = "svayam_" + obj.b_acct_id + "_ebill";

    let id = SqlString.escape(obj.id)
    let bill_no = SqlString.escape(obj.bill_no)
    let tender_id = SqlString.escape(obj.tender_id)
    let sql = "delete from  " + db + ".ebill_info  where id=" + id
    let sql_del = "delete from  " + db + ".ded  where bill_id=" + id
    let sql_delete = "delete from  " + db + ".ebill_items  where bill_no=" + bill_no + " And tender_id =" + tender_id
    mysqlPool.getConnection(function (error, mysqlCon) {
        if (error) {
            console.log("Error-->routes-->info-->ebill-->createEBill--", error)
            objectToSend["error"] = true
            objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
            res.send(objectToSend);
        } else {
            mysqlCon.beginTransaction(function (error4) {
                if (error4) {
                    console.log("Error-->routes-->info-->ebill-->deleteEbill--", error4)
                    objectToSend["error"] = true
                    objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
                    res.send(objectToSend);
                    mysqlCon.release();
                } else {
                    mysqlCon.query(sql + ";" + sql_del + ";" + sql_delete, function (error1, results) {
                        if (error1) {
                            console.log("Error-->routes-->info-->ebill-->deleteEbill--", error1)
                            objectToSend["error"] = true;
                            objectToSend["data"] = "Some error occured at server Side. Please try again later"
                            res.send(objectToSend)
                            mysqlCon.rollback();
                            mysqlCon.release()
                        } else {
                            mysqlCon.query('COMMIT', function (error2) {
                                if (error2) {
                                    console.log("Error-->routes-->info-->ebill-->deleteEbill--", error2)
                                    objectToSend["error"] = true;
                                    objectToSend["data"] = "Some error occured at server Side. Please try again later"
                                    res.send(objectToSend)
                                    mysqlCon.rollback();
                                    mysqlCon.release()
                                } else {
                                    objectToSend["error"] = false;
                                    objectToSend["data"] = "Deleted Sucessfully"
                                    res.send(objectToSend)
                                    mysqlCon.release()
                                }

                            })
                        }
                    })
                }
            })
        }
    })

})


router.put('/updateebill', (req, res) => {
    let obj = req.body
    let objectToSend = {}
    let update_timestamp = SqlString.escape(moment().format('YYYY-MM-DD HH:mm:ss'))

    let db = "svayam_" + obj.b_acct_id + "_ebill";
    let sql = "update " + db + ".ebill set bill_no=" + SqlString.escape(obj.bill_no) + ",with_held_amt =" + SqlString.escape(obj.with_held_amt)
        + ",pre_gst=" + SqlString.escape(obj.pre_gst) + ",pre_gst_amt =" + SqlString.escape(obj.pre_gst_amt)
        + ",data=" + SqlString.escape(obj.data) + ",work_order_id=" + SqlString.escape(obj.work_order_id) + ",emb_no =" + SqlString.escape(obj.emb_no)
        + ",bill_amount=" + SqlString.escape(obj.bill_amount) + ",ded_data=" + SqlString.escape(obj.ded_data) + ",bill_desc =" + SqlString.escape(obj.bill_desc)
        + ",is_final_bill =" + SqlString.escape(obj.is_final_bill) + ", status =" + SqlString.escape(obj.status) + ",part_data=" + SqlString.escape(obj.part_data) + ",allowance_cgst_percentage=" + SqlString.escape(obj.allowance_cgst_percentage) + ",allowance_sgst_percentage =" + SqlString.escape(obj.allowance_sgst_percentage)
        + ",update_user_id=" + SqlString.escape(obj.update_user_id) + ",update_timestamp="
        + update_timestamp + " where id=" + SqlString.escape(obj.id) + ";"




    mysqlPool.getConnection(function (error, mysqlCon) {
        if (error) {
            console.log("Error-->routes-->info-->ebill-->updateebill--", error)
            objectToSend["error"] = true
            objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
            res.send(objectToSend);
        } else {
            mysqlCon.beginTransaction(function (error1) {
                if (error1) {
                    console.log("Error-->routes-->info-->ebill-->updateebill--", error1)
                    objectToSend["error"] = true
                    objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
                    res.send(objectToSend);
                    mysqlCon.release();
                } else {
                    mysqlCon.query(sql, function (error, results) {
                        if (error) {
                            console.log("Error-->routes-->info-->ebill-->updateebill-->", error)
                            objectToSend["error"] = true;
                            objectToSend["data"] = "Some error occured at server Side. Please try again later"
                            res.send(objectToSend)
                            mysqlCon.rollback();
                            mysqlCon.release()
                        } else {

                            mysqlCon.query('COMMIT', function (error2) {
                                if (error2) {
                                    console.log("Error-->routes-->info-->ebill-->updateebill-->", error2)
                                    objectToSend["error"] = true;
                                    objectToSend["data"] = "Some error occured at server Side. Please try again later"
                                    res.send(objectToSend)
                                    mysqlCon.rollback();
                                    mysqlCon.release()
                                } else {
                                    objectToSend["error"] = false;
                                    objectToSend["data"] = "ebill Update Successfully"
                                    res.send(objectToSend)
                                    mysqlCon.release()

                                }

                            })

                        }
                    })
                }
            })
        }


    })


})

router.put('/updateebillstatus', (req, res) => {
    let objectToSend = {}

    let obj = req.body

    let b_acct_id = obj["b_acct_id"]
    let status = obj["status"]

    let id = obj["id"]

    let update_user_id = SqlString.escape(obj["update_user_id"])
    let update_timestamp = SqlString.escape(moment().format('YYYY-MM-DD HH:mm:ss'))


    let sql = "update svayam_" + b_acct_id + "_ebill.ebill_info set status=" + SqlString.escape(status)
        + ",update_user_id=" + update_user_id + ",update_timestamp=" + update_timestamp
        + " where id=" + SqlString.escape(id)


    mysqlPool.query(sql, function (error, results) {
        if (error) {
            console.log("Error-->routes-->info-->ebill-->updateebillstatus", error)
            objectToSend["error"] = true
            objectToSend["arr_effective_dt"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
            res.send(objectToSend);
        } else {
            objectToSend["error"] = false
            objectToSend["data"] = " updated successfully"
            res.send(objectToSend);
        }
    })
})


router.put('/updateGlobalBillNo', (req, res) => {
    let obj = req.body
    let db = "svayam_" + obj.b_acct_id + "_ebill";

    let update_user_id = SqlString.escape(obj["update_user_id"])
    let update_timestamp = SqlString.escape(moment().format('YYYY-MM-DD HH:mm:ss'))
    let objectToSend = {}
    let global_bill_no = SqlString.escape(obj["global_bill_no"])

    let sql = "update " + db + ".ebill_info set acc_id=" + global_bill_no
        + ",update_user_id=" + update_user_id + ",update_timestamp=" + update_timestamp + " where id=" + SqlString.escape(obj.id) + ";"



    mysqlPool.query(sql, function (error, results) {
        if (error) {
            console.log("Error-->routes-->info-->ebill-->updateGlobalBillNo--", error)
            objectToSend["error"] = true;

            objectToSend["data"] = "Some error occured at server Side. Please try again later"

            res.send(objectToSend)
        } else {

            objectToSend["error"] = false;
            objectToSend["data"] = "Updated Successfully!"
            res.send(objectToSend)
        }
    })


})



router.put('/changestatus', (req, res) => {
    let obj = req.body
    let objectToSend = {}
    let update_timestamp = SqlString.escape(moment().format('YYYY-MM-DD HH:mm:ss'))

    let db = "svayam_" + obj.b_acct_id + "_ebill";
    let sql = "update " + db + ".ebill set approval_status = " + SqlString.escape(obj.approval_status)
        + ",update_user_id=" + SqlString.escape(obj.update_user_id) + ",update_timestamp="
        + update_timestamp + " where id=" + SqlString.escape(obj.id) + ";"




    mysqlPool.getConnection(function (error, mysqlCon) {
        if (error) {
            console.log("Error-->routes-->info-->ebill-->updateBoq--", error)
            objectToSend["error"] = true
            objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
            res.send(objectToSend);
        } else {
            mysqlCon.beginTransaction(function (error1) {
                if (error1) {
                    console.log("Error-->routes-->info-->ebill-->changestatus--", error1)
                    objectToSend["error"] = true
                    objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
                    res.send(objectToSend);
                    mysqlCon.release();
                } else {
                    mysqlCon.query(sql, function (error, results) {
                        if (error) {
                            console.log("Error-->routes-->info-->ebill-->changestatus-->", error)
                            objectToSend["error"] = true;
                            objectToSend["data"] = "Some error occured at server Side. Please try again later"
                            res.send(objectToSend)
                            mysqlCon.rollback();
                            mysqlCon.release()
                        } else {

                            mysqlCon.query('COMMIT', function (error2) {
                                if (error2) {
                                    console.log("Error-->routes-->info-->ebill-->changestatus-->", error2)
                                    objectToSend["error"] = true;
                                    objectToSend["data"] = "Some error occured at server Side. Please try again later"
                                    res.send(objectToSend)
                                    mysqlCon.rollback();
                                    mysqlCon.release()
                                } else {
                                    objectToSend["error"] = false;
                                    objectToSend["data"] = "Status Update Successfully"
                                    res.send(objectToSend)
                                    mysqlCon.release()

                                }

                            })

                        }
                    })
                }
            })
        }


    })


})



module.exports = router;
