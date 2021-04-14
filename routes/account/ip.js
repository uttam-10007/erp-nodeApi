var express = require('express');
var router = express.Router();
var SqlString = require('sqlstring');
var propObj = require('../../config_con')
let mysqlPool = require('../../connections/mysqlConnection');
var moment = require('moment')

router.post('/insertip', (req, res) => {
    let objectToSend = {}
    let obj = req.body;
    let b_acct_id = obj.b_acct_id;
    let data = obj.data;
    let arr = Object.keys(data);

    let query = "INSERT INTO svayam_" + b_acct_id + "_account.ip(" + arr.join(",") + ")VALUES ("
for (let i = 0; i < arr.length; i++) {
    query += SqlString.escape(data[arr[i]])
    if (i < arr.length - 1) {
        query += ","
    }
}
query += ")"

    mysqlPool.query(query, function (error, results) {
        if (error) {
            console.log("Error-->routes-->account-->ip-->insertip--", error)
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

router.get('/getip:dtls', (req, res) => {

    let objectToSend = {}

    let b_acct_id = req.params.dtls;



    let sql_fetchCurr = "SELECT * from svayam_" + b_acct_id + "_account.ip";
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

router.put('/updateip', (req, res) => {
    let objectToSend = {}
    let obj = req.body;
    let data = obj.data;
    let b_acct_id = obj.b_acct_id;
    let arr = Object.keys(data);
    let query = "update svayam_" + b_acct_id + "_account.ip set "
    for (let i = 0; i < arr.length; i++) {
        query += arr[i] + "=" + SqlString.escape(data[arr[i]])
        if (i < arr.length - 1) {
            query += ","
        }
    }
    query += " where id=" + data.id

    mysqlPool.query(query, function (error, results) {
        if (error) {
            console.log("Error-->routes-->account-->ip-->updateip--", error)
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



router.put('/updatesal', (req, res) => {
    let objectToSend = {}
    let obj = req.body;
    let data = obj.data;
    let b_acct_id = obj.b_acct_id;
    let arr = Object.keys(data);
    let query = "update svayam_" + b_acct_id + "_account.sal set "
    for (let i = 0; i < arr.length; i++) {
        query += arr[i] + "=" + SqlString.escape(data[arr[i]])
        if (i < arr.length - 1) {
            query += ","
        }
    }
    query += " where id=" + data.id

    mysqlPool.query(query, function (error, results) {
        if (error) {
            console.log("Error-->routes-->account-->ip-->updateip--", error)
            objectToSend["error"] = true
            objectToSend["data"] = "Someerroroccuredatserverside.Pleasetryagainlater.Ifproblempersists,contactsupport."
            res.send(objectToSend);
        } else {
            objectToSend["error"] = false
            objectToSend["data"] = "updatesuccessfully"
            res.send(objectToSend);
        }
    })
})


router.get('/getsal:dtls', (req, res) => {
    let objectToSend = {}
    let b_acct_id = req.params.dtls;
    let sql_fetchCurr = "SELECT * from svayam_" + b_acct_id + "_account.sal";
    mysqlPool.query(sql_fetchCurr, function (error, results) {
        if (error) {
            console.log("Error-->routes-->account-->sal-->getsal--", error)
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

router.post('/insertsal', (req, res) => {
    let objectToSend = {}
    let obj = req.body; let b_acct_id = obj.b_acct_id; let data = obj.data;
    let arr = Object.keys(data); let query = "INSERT INTO svayam_" + b_acct_id + "_account.sal(" + arr.join(",") + ")VALUES ("
    for (let i = 0; i < arr.length; i++) {
        query += SqlString.escape(data[arr[i]])
        if (i < arr.length - 1) { query += "," }
    } query += ")"
    mysqlPool.query(query, function (error, results) {
        if (error) {
            console.log("Error-->routes-->account-->sal-->insertsal--", error)
            objectToSend["error"] = true
            objectToSend["data"] = "Someerroroccuredatserverside.Pleasetryagainlater.Ifproblempersists,contactsupport."
            res.send(objectToSend);
        } else {
            objectToSend["error"] = false
            objectToSend["data"] = "InsertedSuccessfully"
            res.send(objectToSend);
        }
    })
});


router.get('/getmaxlclno:dtls', (req, res) => {

    let objectToSend = {}

    let b_acct_id = req.params.dtls;



    let sql_fetchCurr = "SELECT MAX(local_no) from svayam_"+b_acct_id+"_account.ip";
    mysqlPool.query(sql_fetchCurr, function (error, results) {
        if (error) {
            console.log("Error-->routes-->account-->ip-->getmaxlclno--", error)
            objectToSend["error"] = true
            objectToSend["obj"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
            res.send(objectToSend);
        } else {
            objectToSend["error"] = false
            objectToSend["obj"] = results
            res.send(objectToSend);
        }
    })
});


router.get('/arrgetmaxlclno:dtls', (req, res) => {

    let objectToSend = {}

    let b_acct_id = req.params.dtls;



    let sql_fetchCurr = "SELECT MAX(arr_local_no) from svayam_"+b_acct_id+"_account.sal";
    mysqlPool.query(sql_fetchCurr, function (error, results) {
        if (error) {
            console.log("Error-->routes-->account-->ip-->arrgetmaxlclno--", error)
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

router.get('/getallarrangementwithparty:dtls', (req, res) => {
    let objectToSend = {}
    let b_acct_id = req.params.dtls;
    let sql_fetchCurr = "SELECT * from svayam_" + b_acct_id + "_account.sal as s join svayam_" + b_acct_id + "_account.ip as i on s.party_id = i.party_id";
    mysqlPool.query(sql_fetchCurr, function (error, results) {
        if (error) {
            console.log("Error-->routes-->account-->ip-->getallarrangementwithparty--", error)
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
