var express = require('express');
var router = express.Router();

var propObj = require('../../../config_con.js')


var mysqlPool = require('../../../connections/mysqlConnection.js')



router.get('/getLookups:dtls', function (req, res) {
    try {
        var objectToSend = {};
        var b_acct_id = req.params.dtls;
        // var acc_id = req.params.dtls;
        let db="svayam_"+b_acct_id+"_data";
        var sqlQuery = "select id,lookup_name,table_name,reference_file_name_business,key_column_name as `key` ,key_desc,value_desc,value_column_name as value from " + db + ".rule_lookups;" 
        mysqlPool.query(sqlQuery, function (error, results, fields) {
            if (error) {
                console.log("Error-->routes-->ruleEngine-->rules---->getLookups--", error);
                objectToSend["error"] = true;
                objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."

                res.end(JSON.stringify(objectToSend))
            }
            else {

                objectToSend["error"] = false;
                objectToSend["data"] = results
                res.send(JSON.stringify(objectToSend))
            }
        });
    }
    catch (ex) {
        console.log("Error-->routes-->ruleEngine-->rules---->getLookups--", ex);
        objectToSend["error"] = true;
        objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
        res.send(JSON.stringify(objectToSend))
    }
});


router.get('/getlookupdata:dtls', function (req, res) {
    try {
        var objectToSend = {};
        var b_acct_id = req.params.dtls;
        // var acc_id = req.params.dtls;
        let db="svayam_"+b_acct_id+"_md";
        var sqlQuery="select f.record_business_name,record_technical_name,group_concat(d.field_business_name order by x.col_seq_no) as `field_business_name`,group_concat(d.field_technical_name order by x.col_seq_no)  as field_technical_name from(select * from " + db + ".record_info  where reference_data_type In ('Code-Values','Code-Value')) f "
        +"join " + db + ".record_xref_field x on f.record_code=x.record_code "
        +"join " + db + ".field_info d on x.field_code=d.field_code "
        
        +"group by f.record_business_name "
        mysqlPool.query(sqlQuery, function (error, results, fields) {
            if (error) {
                console.log("Error-->routes-->ruleEngine-->rules---->getlookupdata--", error);
                objectToSend["error"] = true;
                objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."

                res.end(JSON.stringify(objectToSend))
            }
            else {

                objectToSend["error"] = false;
                objectToSend["data"] = results
                res.send(JSON.stringify(objectToSend))
            }
        });
    }
    catch (ex) {
        console.log("Error-->routes-->ruleEngine-->rules---->getlookupdata--", ex);
        objectToSend["error"] = true;
        objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
        res.send(JSON.stringify(objectToSend))
    }
});

router.post('/addnewlookup', function (req, res) {
    try {
        var objectToSend = {};
        var data=req.body;
        
        var lookup_name=data.lookup_name;
        var table_name=data.table_name;
        var b_acct_id=data.b_acct_id;
        var key=data.key;
        var key_desc=data.key_desc;
        var value=data.value;
        var value_desc=data.value_desc;
        var business_file_desc=data.business_file_desc;
        let db="svayam_"+b_acct_id+"_data";
        var sqlQuery="insert into " + db + ".rule_lookups (lookup_name,table_name,reference_file_name_business,key_column_name,key_desc,value_column_name,value_desc) values "
                    +"('"+lookup_name+"','"+table_name+"','"+business_file_desc+"','"+key+"','"+key_desc+"','"+value+"','"+value_desc+"')"
        mysqlPool.query(sqlQuery, function (error, results, fields) {
            if (error) {
                console.log("Error-->routes-->ruleEngine-->rules---->addnewlookup--", error);
                objectToSend["error"] = true;
                objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."

                res.end(JSON.stringify(objectToSend))
            }
            else {

                objectToSend["error"] = false;
                objectToSend["data"] = "lookup add successfully"
                res.send(JSON.stringify(objectToSend))
            }
        });
    }
    catch (ex) {
        console.log("Error-->routes-->ruleEngine-->rules---->addnewlookup--", ex);
        objectToSend["error"] = true;
        objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
        res.send(JSON.stringify(objectToSend))
    }
});


router.delete('/deleteLookup:dtls', function (req, res) {
    try {
        var objectToSend = {};
        var obj = JSON.parse(req.params.dtls);
        // var acc_id = req.params.dtls;
        let db="svayam_"+obj.b_acct_id+"_data";
        var sqlQuery = "delete from " + db + ".rule_lookups where id=" + obj.lookup_id;
        mysqlPool.query(sqlQuery, function (error, results, fields) {
            if (error) {
                console.log("Error-->routes-->ruleEngine-->rules---->deleteLookup--", error);
                objectToSend["error"] = true;
                objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."

                res.end(JSON.stringify(objectToSend))
            }
            else {

                objectToSend["error"] = false;
                objectToSend["data"] = "Delete ScssessFully"
                res.send(JSON.stringify(objectToSend))
            }
        });
    }
    catch (ex) {
        console.log("Error-->routes-->ruleEngine-->rules---->deleteLookup--", ex);
        objectToSend["error"] = true;
        objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
        res.send(JSON.stringify(objectToSend))
    }
});


router.put('/updatelookup', function (req, res) {
    try {
        var objectToSend = {};
        var data=req.body;
        var lookup_name=data.lookup_name;
        var table_name=data.table_name;
        var lookup_id=data.id;
        var key=data.key;
        var key_desc=data.key_desc;
        var value=data.value;
        var value_desc=data.value_desc;
        var business_file_desc=data.business_file_desc;
        let db="svayam_"+data.b_acct_id+"_data";
        var sqlQuery="update " + db + ".rule_lookups set lookup_name='"+lookup_name+"',table_name='"+table_name+"',reference_file_name_business='"+business_file_desc+"',key_column_name='"+key+"'"
        +",key_desc='"+key_desc+"',value_desc='"+value_desc+"',value_column_name='"+value+"' where id="+lookup_id;
                    
        mysqlPool.query(sqlQuery, function (error, results, fields) {
            if (error) {
                console.log("Error-->routes-->ruleEngine-->rules---->updatelookup--", error);
                objectToSend["error"] = true;
                objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."

                res.end(JSON.stringify(objectToSend))
            }
            else {

                objectToSend["error"] = false;
                objectToSend["data"] = "lookup update successfully"
                res.send(JSON.stringify(objectToSend))
            }
        });
    }
    catch (ex) {
        console.log("Error-->routes-->ruleEngine-->rules---->updatelookup--", ex);
        objectToSend["error"] = true;
        objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
        res.send(JSON.stringify(objectToSend))
    }
});



module.exports = router;
