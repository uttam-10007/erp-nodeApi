var express = require('express');
var router = express.Router();
var SqlString = require('sqlstring');
var propObj = require('../../config_con')
let mysqlPool = require('../../connections/mysqlConnection');
var moment = require('moment')



router.get('/getBudgetInfo:dtls', (req, res) => {

    let objectToSend = {}


    let obj = JSON.parse(req.params.dtls)


    let b_acct_id = obj["b_acct_id"]

    let sql = "Select fin_year,budget_id,bud_cd,bud_level,act_cd,act_level,proj_cd,proj_level,prod_cd,prod_level,amount,status,create_user_id,update_user_id,"
        + "DATE_FORMAT(create_timestamp,'%Y-%m-%d %H:%i:%S') as create_timestamp,DATE_FORMAT(update_timestamp,'%Y-%m-%d %H:%i:%S') as update_timestamp"
        + " from svayam_" + b_acct_id + "_account.budget "




    mysqlPool.query(sql, function (error, results) {
        if (error) {
            console.log("Error-->routes-->account-->budget-->getBudgetInfo--", error)
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


router.post('/createBudgetInfo', (req, res) => {
    let objectToSend = {}

    let obj = req.body

    let fin_year = SqlString.escape(obj["fin_year"])
    let b_acct_id = obj["b_acct_id"]
    let bud_cd = SqlString.escape(obj["bud_cd"])
    let bud_level = SqlString.escape(obj["bud_level"])
    let act_level = SqlString.escape(obj["act_level"])
    let act_cd = SqlString.escape(obj["act_cd"])
    let proj_cd = SqlString.escape(obj["proj_cd"])
    let prod_cd = SqlString.escape(obj["prod_cd"])
    let proj_level = SqlString.escape(obj["proj_level"])
    let prod_level = SqlString.escape(obj["prod_level"])
    let amount = SqlString.escape(obj["amount"])
    let create_user_id = SqlString.escape(obj["create_user_id"])
    let create_timestamp = SqlString.escape(moment().format('YYYY-MM-DD HH:mm:ss'))
    let status = SqlString.escape(obj["status"])

    let sql = "insert into svayam_" + b_acct_id + "_account.budget (fin_year,bud_level,bud_cd,act_level,act_cd,proj_level,proj_cd,prod_level,prod_cd,amount,status,create_user_id,create_timestamp) values "
        + "(" + fin_year + "," + bud_level + "," + bud_cd + "," + act_level + "," + act_cd + "," + proj_level + "," + proj_cd + "," + prod_level + "," + prod_cd + "," + amount + "," + status + "," + create_user_id + "," + create_timestamp + ")"


    let flag = obj["flag"]



    mysqlPool.getConnection(function (error1, mysqlCon) {
        if (error1) {
            console.log("Error-->routes-->account-->budget-->createBudgetInfo--", error1)
            objectToSend["error"] = true
            objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
            res.send(objectToSend);

        } else {
            mysqlCon.beginTransaction(function (error2) {
                if (error2) {
                    console.log("Error-->routes-->account-->budget-->createBudgetInfo--", error2)
                    objectToSend["error"] = true
                    objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
                    res.send(objectToSend);
                    mysqlCon.release();
                } else {




                    if (flag == 'insert_and_update') {

                        let getQuery = "select budget_id from svayam_" + b_acct_id + "_account.budget where"

                        let temp_arr = ['lvl1_cd', 'lvl2_cd', 'lvl3_cd', 'lvl4_cd', 'lvl5_cd', 'lvl6_cd', 'lvl7_cd']

                        let bud_hier = obj["bud_hier"]
                        let act_hier = obj["act_hier"]
                        let proj_hier = obj["proj_hier"]
                        let prod_hier = obj["prod_hier"]
                        let bud_filter = "'',"
                        let act_filter = "'',"
                        let proj_filter = "'',"
                        let prod_filter = "'',"
                        for (let j = 0; j < bud_hier.length; j++) {
                            for (let i = 0; i < temp_arr.length; i++) {

                                bud_filter += SqlString.escape(bud_hier[j][temp_arr[i]]) + ","

                            }
                        }

                        for (let j = 0; j < act_hier.length; j++) {
                            for (let i = 0; i < temp_arr.length; i++) {
                                act_filter += SqlString.escape(act_hier[j][temp_arr[i]]) + ","
                            }
                        }

                        for (let j = 0; j < proj_hier.length; j++) {
                            for (let i = 0; i < temp_arr.length; i++) {
                                proj_filter += SqlString.escape(proj_hier[j][temp_arr[i]]) + ","
                            }
                        }

                        for (let j = 0; j < prod_hier.length; j++) {
                            for (let i = 0; i < temp_arr.length; i++) {
                                prod_filter += SqlString.escape(prod_hier[j][temp_arr[i]]) + ","
                            }
                        }
                        bud_filter = bud_filter.substring(0, bud_filter.length - 1)
                        act_filter = act_filter.substring(0, act_filter.length - 1)
                        proj_filter = proj_filter.substring(0, proj_filter.length - 1)
                        prod_filter = prod_filter.substring(0, prod_filter.length - 1)


                        getQuery += " bud_cd in (" + bud_filter + ")  or act_cd in (" + act_filter + ") or prod_cd in (" + prod_filter + ") or proj_cd in (" + proj_filter + ")"


                        mysqlCon.query(getQuery, function (error33, results33) {
                            if (error33) {
                                console.log("Error-->routes-->account-->budget-->createBudgetInfo--", error33)
                                objectToSend["error"] = true
                                objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
                                res.send(objectToSend);
                                mysqlCon.release();
                            } else {
                                let budget_id = ''

                                for (let i = 0; i < results33.length; i++) {
                                    budget_id += results33[i]['budget_id']
                                    if (i < results33.length - 1) {
                                        budget_id += ','
                                    }
                                }

                                let updatesql = ""

                                updatesql += "update svayam_" + b_acct_id + "_account.budget set status='INACTIVE'  where budget_id in (" + budget_id + ");"
                                updatesql += "update svayam_" + b_acct_id + "_account.allocation set status='INACTIVE'  where budget_id in ( " + budget_id + ");"


                                mysqlCon.query(updatesql, function (error31, results31) {
                                    if (error31) {
                                        console.log("Error-->routes-->account-->budget-->createBudgetInfo--", error31)
                                        objectToSend["error"] = true
                                        objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
                                        res.send(objectToSend);
                                        mysqlCon.release();
                                    } else {
                                        mysqlCon.query(sql, function (error3, results3) {
                                            if (error3) {
                                                console.log("Error-->routes-->account-->budget-->createBudgetInfo--", error3)
                                                objectToSend["error"] = true
                                                objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
                                                res.send(objectToSend);
                                                mysqlCon.release();
                                            } else {
                                                let insert_id = results3.insertId
                                                let sql1 = "insert into svayam_" + b_acct_id + "_account.allocation (fin_year,bud_level,bud_cd,act_level,act_cd,proj_level,proj_cd,prod_level,prod_cd,amount,status,budget_id,create_user_id,create_timestamp) values "
                                                    + "(" + fin_year + "," + bud_level + "," + bud_cd + "," + act_level + "," + act_cd + "," + proj_level + "," + proj_cd + "," + prod_level + "," + prod_cd + "," + amount + "," + status + "," + insert_id + "," + create_user_id + "," + create_timestamp + ")"



                                                mysqlCon.query(sql1, function (error32, results32) {
                                                    if (error32) {
                                                        console.log("Error-->routes-->account-->budget-->createBudgetInfo--", error32)
                                                        objectToSend["error"] = true
                                                        objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
                                                        res.send(objectToSend);
                                                        mysqlCon.release();
                                                    } else {
                                                        mysqlCon.commit(function (error5) {
                                                            if (error5) {
                                                                console.log("Error-->routes-->account-->budget-->createBudgetInfo--", error5)
                                                                objectToSend["error"] = true
                                                                objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
                                                                res.send(objectToSend);
                                                                mysqlCon.rollback()
                                                                mysqlCon.release();
                                                            } else {
                                                                objectToSend["error"] = false
                                                                objectToSend["data"] = 'Budget Created Successfully!'
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

                    } else {
                        mysqlCon.query(sql, function (error3, results3) {
                            if (error3) {
                                console.log("Error-->routes-->account-->budget-->createBudgetInfo--", error3)
                                objectToSend["error"] = true
                                objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
                                res.send(objectToSend);
                                mysqlCon.release();
                            } else {
                                let insert_id = results3.insertId
                                let sql1 = "insert into svayam_" + b_acct_id + "_account.allocation (fin_year,bud_level,bud_cd,act_level,act_cd,proj_level,proj_cd,prod_level,prod_cd,amount,status,budget_id,create_user_id,create_timestamp) values "
                                    + "(" + fin_year + "," + bud_level + "," + bud_cd + "," + act_level + "," + act_cd + "," + proj_level + "," + proj_cd + "," + prod_level + "," + prod_cd + "," + amount + "," + status + "," + insert_id + "," + create_user_id + "," + create_timestamp + ")"



                                mysqlCon.query(sql1, function (error32, results32) {
                                    if (error32) {
                                        console.log("Error-->routes-->account-->budget-->createBudgetInfo--", error32)
                                        objectToSend["error"] = true
                                        objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
                                        res.send(objectToSend);
                                        mysqlCon.release();
                                    } else {
                                        mysqlCon.commit(function (error5) {
                                            if (error5) {
                                                console.log("Error-->routes-->account-->budget-->createBudgetInfo--", error5)
                                                objectToSend["error"] = true
                                                objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
                                                res.send(objectToSend);
                                                mysqlCon.rollback()
                                                mysqlCon.release();
                                            } else {
                                                objectToSend["error"] = false
                                                objectToSend["data"] = 'Budget Created Successfully!'
                                                res.send(objectToSend);
                                                mysqlCon.release()
                                            }
                                        })
                                    }
                                })
                            }
                        })
                    }


                }
            })
        }
    })


})


router.get('/getAllAllocation:dtls', (req, res) => {

    let objectToSend = {}


    let obj = JSON.parse(req.params.dtls)


    let b_acct_id = obj["b_acct_id"]

    let sql = "Select fin_year,allocation_id,bud_cd,bud_level,act_cd,act_level,proj_cd,proj_level,prod_cd,prod_level,amount,budget_id,accrued_amount,paid_amount,parent_allocation_id,status,create_user_id,update_user_id,"
        + "DATE_FORMAT(create_timestamp,'%Y-%m-%d %H:%i:%S') as create_timestamp,DATE_FORMAT(update_timestamp,'%Y-%m-%d %H:%i:%S') as update_timestamp"
        + " from svayam_" + b_acct_id + "_account.allocation "



    mysqlPool.query(sql, function (error, results) {
        if (error) {
            console.log("Error-->routes-->account-->budget-->getAllAllocation--", error)
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

router.post('/createAllocation', (req, res) => {
    let objectToSend = {}

    let obj = req.body
    let fin_year = SqlString.escape(obj["fin_year"])

    let b_acct_id = obj["b_acct_id"]
    let bud_cd = SqlString.escape(obj["allocation_obj"]["bud_cd"])
    let bud_level = SqlString.escape(obj["allocation_obj"]["bud_level"])
    let act_level = SqlString.escape(obj["allocation_obj"]["act_level"])
    let act_cd = SqlString.escape(obj["allocation_obj"]["act_cd"])
    let proj_cd = SqlString.escape(obj["allocation_obj"]["proj_cd"])
    let prod_cd = SqlString.escape(obj["allocation_obj"]["prod_cd"])
    let proj_level = SqlString.escape(obj["allocation_obj"]["proj_level"])
    let prod_level = SqlString.escape(obj["allocation_obj"]["prod_level"])
    let amount = SqlString.escape(obj["allocation_obj"]["amount"])
    let create_user_id = SqlString.escape(obj["create_user_id"])
    let create_timestamp = SqlString.escape(moment().format('YYYY-MM-DD HH:mm:ss'))
    let status = SqlString.escape(obj["allocation_obj"]["status"])
    let update_amount = obj['parent_obj']['amount'] - obj["allocation_obj"]["amount"]
    let parent_allocation_id = obj['parent_obj']['allocation_id']
    let budget_id = obj['parent_obj']['budget_id']

    let sql = "update svayam_" + b_acct_id + "_account.allocation set amount=" + update_amount + ",update_user_id=" + create_user_id + ",update_timestamp=" + create_timestamp + " where allocation_id=" + parent_allocation_id





    mysqlPool.getConnection(function (error1, mysqlCon) {
        if (error1) {
            console.log("Error-->routes-->account-->budget-->createAllocation--", error1)
            objectToSend["error"] = true
            objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
            res.send(objectToSend);

        } else {
            mysqlCon.beginTransaction(function (error2) {
                if (error2) {
                    console.log("Error-->routes-->account-->budget-->createAllocation--", error2)
                    objectToSend["error"] = true
                    objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
                    res.send(objectToSend);
                    mysqlCon.release();
                } else {


                    mysqlCon.query(sql, function (error3, results3) {
                        if (error3) {
                            console.log("Error-->routes-->account-->budget-->createAllocation--", error3)
                            objectToSend["error"] = true
                            objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
                            res.send(objectToSend);
                            mysqlCon.release();
                        } else {

                            let sql1 = "insert into svayam_" + b_acct_id + "_account.allocation (fin_year,bud_level,bud_cd,act_level,act_cd,proj_level,proj_cd,prod_level,prod_cd,amount,status,budget_id,parent_allocation_id,create_user_id,create_timestamp) values "
                                + "(" + fin_year + "," + bud_level + "," + bud_cd + "," + act_level + "," + act_cd + "," + proj_level + "," + proj_cd + "," + prod_level + "," + prod_cd + "," + amount + "," + status + "," + budget_id + "," + parent_allocation_id + "," + create_user_id + "," + create_timestamp + ")"


                            mysqlCon.query(sql1, function (error32, results32) {
                                if (error32) {
                                    console.log("Error-->routes-->account-->budget-->createAllocation--", error32)
                                    objectToSend["error"] = true
                                    objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
                                    res.send(objectToSend);
                                    mysqlCon.release();
                                } else {
                                    mysqlCon.commit(function (error5) {
                                        if (error5) {
                                            console.log("Error-->routes-->account-->budget-->createAllocation--", error5)
                                            objectToSend["error"] = true
                                            objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
                                            res.send(objectToSend);
                                            mysqlCon.rollback()
                                            mysqlCon.release();
                                        } else {
                                            objectToSend["error"] = false
                                            objectToSend["data"] = 'Allocation Created Successfully!'
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


router.put('/updateAllocationamount', (req, res) => {
    let objectToSend = {}

    let obj = req.body


    let b_acct_id = obj["b_acct_id"]
    let past_amount = obj["past_amount"]
    let parent_amount = obj["parent_amount"]
    let child_amount = obj["child_amount"]
    let amount = obj["amount"]


    let parent_allocation_id = obj['parent_allocation_id']
    let allocation_id = obj['allocation_id']
    let update_user_id = SqlString.escape(obj["update_user_id"])
    let update_timestamp = SqlString.escape(moment().format('YYYY-MM-DD HH:mm:ss'))

    let parent_update_amount = child_amount + parent_amount + past_amount - amount
    let update_amount = amount - child_amount
    let sql = "update svayam_" + b_acct_id + "_account.allocation set amount=" + update_amount + ",update_user_id=" + update_user_id + ",update_timestamp=" + update_timestamp + " where allocation_id=" + allocation_id

    let sqlParent = "update svayam_" + b_acct_id + "_account.allocation set amount=" + parent_update_amount + ",update_user_id=" + update_user_id + ",update_timestamp=" + update_timestamp + " where allocation_id=" + parent_allocation_id




    mysqlPool.getConnection(function (error1, mysqlCon) {
        if (error1) {
            console.log("Error-->routes-->account-->budget-->updateAllocationamount--", error1)
            objectToSend["error"] = true
            objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
            res.send(objectToSend);

        } else {
            mysqlCon.beginTransaction(function (error2) {
                if (error2) {
                    console.log("Error-->routes-->account-->budget-->updateAllocationamount--", error2)
                    objectToSend["error"] = true
                    objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
                    res.send(objectToSend);
                    mysqlCon.release();
                } else {


                    mysqlCon.query(sql + ";" + sqlParent, function (error3, results3) {
                        if (error3) {
                            console.log("Error-->routes-->account-->budget-->updateAllocationamount--", error3)
                            objectToSend["error"] = true
                            objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
                            res.send(objectToSend);
                            mysqlCon.release();
                        } else {

                            mysqlCon.commit(function (error5) {
                                if (error5) {
                                    console.log("Error-->routes-->account-->budget-->updateAllocationamount--", error5)
                                    objectToSend["error"] = true
                                    objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
                                    res.send(objectToSend);
                                    mysqlCon.rollback()
                                    mysqlCon.release();
                                } else {
                                    objectToSend["error"] = false
                                    objectToSend["data"] = 'Allocation Updated Successfully!'
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


})




router.put('/allocationInactive', (req, res) => {
    let objectToSend = {}

    let obj = req.body


    let b_acct_id = obj["b_acct_id"]
    let parent_amount = obj["parent_amount"]
    let child_amount = obj["child_amount"]
    let amount = obj["amount"]


    let parent_allocation_id = obj['parent_allocation_id']
    let allocation_id = obj['allocation_id']
    let update_user_id = SqlString.escape(obj["update_user_id"])
    let update_timestamp = SqlString.escape(moment().format('YYYY-MM-DD HH:mm:ss'))
    let child_arr = obj["child_arr"]
    let parent_update_amount = parent_amount + child_amount + amount
    let ids = allocation_id
    if (child_arr.length > 0) {
        ids = ids + "," + child_arr.join(",")
    }
    let sql = "update svayam_" + b_acct_id + "_account.allocation set status='INACTIVE',update_user_id=" + update_user_id + ",update_timestamp=" + update_timestamp + " where allocation_id in (" + ids + ")"

    let sqlParent = "update svayam_" + b_acct_id + "_account.allocation set amount=" + parent_update_amount + ",update_user_id=" + update_user_id + ",update_timestamp=" + update_timestamp + " where allocation_id=" + parent_allocation_id




    mysqlPool.getConnection(function (error1, mysqlCon) {
        if (error1) {
            console.log("Error-->routes-->account-->budget-->allocationInactive--", error1)
            objectToSend["error"] = true
            objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
            res.send(objectToSend);

        } else {
            mysqlCon.beginTransaction(function (error2) {
                if (error2) {
                    console.log("Error-->routes-->account-->budget-->allocationInactive--", error2)
                    objectToSend["error"] = true
                    objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
                    res.send(objectToSend);
                    mysqlCon.release();
                } else {


                    mysqlCon.query(sql + ";" + sqlParent, function (error3, results3) {
                        if (error3) {
                            console.log("Error-->routes-->account-->budget-->allocationInactive--", error3)
                            objectToSend["error"] = true
                            objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
                            res.send(objectToSend);
                            mysqlCon.release();
                        } else {

                            mysqlCon.commit(function (error5) {
                                if (error5) {
                                    console.log("Error-->routes-->account-->budget-->allocationInactive--", error5)
                                    objectToSend["error"] = true
                                    objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
                                    res.send(objectToSend);
                                    mysqlCon.rollback()
                                    mysqlCon.release();
                                } else {
                                    objectToSend["error"] = false
                                    objectToSend["data"] = 'Allocation Inactive Successfully!'
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


})
module.exports = router;
