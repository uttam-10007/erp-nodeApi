var express = require('express');
var router = express.Router();
var propObj = require('../../../config_con.js')
const fs = require('fs');
var SqlString = require('sqlstring');

try {
    var mysqlPool = require('../../../connections/mysqlConnection.js');
} catch (ex) {
    console.log("Error-->routes-->signup-->require--", ex)
}


router.get('/eventLayoutsWithInfo:dtls', function (req, res) {
    var b_acct_id = req.params.dtls;

    var objectToSend = {};
    let db="svayam_"+b_acct_id+"_md";

    var query = "select e.record_code ,e.record_technical_name ,e.record_business_name, "
        + " group_concat(s.field_business_name order by x.col_seq_no) as field_business_name,"
        + " group_concat(x.field_code order by x.col_seq_no) as field_code,"
        + " group_concat(s.field_technical_name order by x.col_seq_no) as field_technical_name,"
        + " group_concat(s.datatype_code order by x.col_seq_no) as datatype_code"
        + "  from (select * from " + db + ".record_info where record_type ='fpem_event_layout') e join " + db + ".record_xref_field x on e.record_code=x.record_code "
        + " join " + db + ".field_info s on x.field_code=s.field_code "
        + " group by e.record_code,e.record_technical_name,e.record_business_name";

    mysqlPool.query(query, function (error, results, fields) {
        if (error) {
            console.log("Error-->routes-->rulesEngine-->rules-->eventLayoutsWithInfo", error);
            objectToSend["error"] = true;
            objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
            res.end(JSON.stringify(objectToSend))
        }
        else {
            // console.log("Update Successfully.");
            objectToSend["error"] = false;
            objectToSend["data"] = results;
            res.send(JSON.stringify(objectToSend))
        }
    });

});

router.get('/businessFileWithInfo:dtls', function (req, res) {
    var b_acct_id = req.params.dtls;

    var objectToSend = {};
    let db="svayam_"+b_acct_id+"_md";
    var query = "select f.record_code ,f.record_type,f.record_business_name,f.record_technical_name,"
    +"group_concat(x.field_code order by x.col_seq_no) as field_code,"
    +"group_concat(d.field_technical_name order by x.col_seq_no) as field_technical_name,"
    +"group_concat(d.field_business_name order by x.col_seq_no) as field_business_name,"
   +" group_concat(i.bus_datatype_name order by x.col_seq_no) as bus_datatype_name "
    +"from (select * from "+ db +".record_info where record_type In ('jrnl','sal','ip','audit','ext')) f join "+ db +".record_xref_field x on f.record_code=x.record_code "
    +"join "+ db +".field_info d on x.field_code=d.field_code join "+ db +".datatype_info i on d.datatype_code=i.datatype_code "
    +"group by f.record_code,f.record_business_name,f.record_technical_name,f.record_type ";



    mysqlPool.query(query, function (error, results, fields) {
        if (error) {
            console.log("Error-->routes-->rulesEngine-->rules-->businessFileWithInfo", error);
            objectToSend["error"] = true;
            objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
            res.end(JSON.stringify(objectToSend))
        }
        else {
            // console.log("Update Successfully.");
            objectToSend["error"] = false;
            objectToSend["data"] = results;
            res.send(JSON.stringify(objectToSend))
        }
    });

});

router.post('/createRule', function (req, res) {
    var objectToSend = {};
    try {

        var rule = req.body.rule;

        //var rule_id=req.body.rule_id;
        var b_acct_id = req.body.b_acct_id
        var event_record_code = req.body.event_record_code
        var objectToSend = {};

        var rule_name = req.body.rule_name;
        //var is_extension_rule = 0;

        /* if(is_extension_rule==1){
            var line_id=req.body.line_id;
        }  */
        let db="svayam_"+b_acct_id+"_data";
        let dbs="svayam_"+b_acct_id+"_md";
        var priority = req.body.priority;
        var query = "insert into " + db + ".rule (rule_name,priority,status,`when`, `then`) values('" + rule_name + "'," + priority + ",'" + 0 + "','" + rule.when + "','" + rule.then + "')";

        //var query="update " + propObj.svayamUserDbName + ".rule set `when`='"+rule.when+"', `then`='"+rule.then+"' where rule_id="+req.body.rule_id;

        mysqlPool.getConnection(function (err, mysqlCon) {
            if (err) {
                console.log("Error-->routes-->ruleEngine---->createRule1--", err)
                objectToSend["error"] = true
                objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
                res.send(objectToSend);
            }
            else {


                mysqlCon.beginTransaction(function (err1) {
                    if (err1) {
                        console.log("Error-->routes-->ruleEngine---->createRule1--", err1)
                        objectToSend["error"] = true
                        objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
                        res.send(objectToSend);
                        mysqlCon.release();
                    }
                    else {
                        mysqlCon.query(query, function (error, resul, fields) {
                            if (error) {
                                console.log("Error-->routes-->ruleEngine---->update--", error);
                                objectToSend["error"] = true;
                                objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support.";
                                res.send(JSON.stringify(objectToSend));
                                mysqlCon.rollback();
                                mysqlCon.release();
                            }
                            else {

                                var rule_id = resul.insertId;
                                var query1 = "select `when`,`then` from " + db + ".rule where rule_id= " + rule_id;
                                var query2 = "insert into " + db + ".rule_xref_input_file (rule_id,event_record_code) values (" + rule_id + ",'" + event_record_code + "')";
                                var query3 = "select field_technical_name from " + dbs + ".field_info where  field_logical_id='18'";

                                mysqlCon.query(query1 + ";" + query2 + ";" + query3, function (error, results, fields) {
                                    if (error) {
                                        console.log("Error-->routes-->ruleEngine---->createRule1--", error);
                                        objectToSend["error"] = true;
                                        objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support.";
                                        res.send(JSON.stringify(objectToSend));
                                        mysqlCon.rollback();
                                        mysqlCon.release();
                                    }
                                    else {


                                        var when = JSON.parse(results[0][0].when)
                                        var then = JSON.parse(results[0][0].then)
                                        // console.log(results[2]+"  dfg   "+results[2][0].id)
                                        content2 = '';
                                        content2 += 'package com.svayam.RuleEngine;' + '\n';
                                        content2 += 'global java.lang.String ev_id;' + '\n';

                                        content2 += 'rule "' + rule_name + '_' + b_acct_id + '"' + '\n';
                                        content2 += 'salience ' + priority + '\n';
                                        content2 += 'when' + '\n' + 'input:InputRecord(' + '\n';
                                        // content2+='input.get("account_id")=='+acct_id+'\n';
                                        // content2+='&&'+'\n';
                                        // if(is_extension_rule==0){
                                        content2 += '(Lookup.checkEventLayout(input.getString("' + results[2][0].field_technical_name + '"))=="' + event_record_code + '")\n';

                                        //}

                                        // if(is_extension_rule==1){

                                        //content2 +='(input.isKeyPresent("c_'+line_id+'")==true)\n';
                                        //content2 += '(Lookup.checkEventLayout(input.getString("' + results[2][0].technical_field_name + '"),"' + acct_id + '")=="' + file_id + '")\n';

                                        // }


                                        if (JSON.stringify(when) != "[]") {
                                            content2 += '&&' + '\n';

                                            content2 += '(' + createCondition(when) + ')' + '\n';
                                        }
                                        content2 += ')' + '\n';

                                        content2 += 'then' + '\n';
                                        for (var i = 0; i < then.length; i++) {
                                            content2 += 'OutputRecord ' + then[i].outObj + '_' + i + '= new OutputRecord("' + then[i].outFileId + '",ev_id);' + '\n';
                                            var writingtype = then[i].outObj + '_' + i + '.set';

                                            for (var j = 0; j < then[i].assignments.length; j++) {
                                                var value = then[i].assignments[j].value;
                                                var key = then[i].assignments[j].key;
                                                if (value == "static") {
                                                    content2 += writingtype + '("' + key + '","' + then[i].assignments[j].newValue + '");' + '\n';
                                                } else if (value == "expression") {
                                                    content2 += writingtype + '("' + key + '",' + then[i].assignments[j].newValue + ');' + '\n';
                                                } else if (value == "field") {
                                                    content2 += writingtype + '("' + key + '",input.get("' + then[i].assignments[j].newValue + '"));' + '\n';
                                                }
                                                else if (value == "lookup") {
                                                    content2 += writingtype + '("' + key + '",Lookup.getStringFrom("' + then[i].assignments[j].lookupValue + '",input.get("' + then[i].assignments[j].newValue + '")));' + '\n';
                                                }
                                            }
                                            content2 += 'input.setOutput(' + then[i].outObj + '_' + i + ');' + '\n';
                                        }
                                        content2 += 'end'
                                        //   console.log(content2)

                                        var sql1 = "update " + db + ".rule set  `drl`='" + content2 + "' where rule_id=" + rule_id;
                                        mysqlCon.query(sql1, function (error3, results3) {
                                            if (error3) {
                                                console.log("Error-->routes-->ruleEngine---->createRule1--", error3);
                                                objectToSend["error"] = true;
                                                objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support.";
                                                res.send(JSON.stringify(objectToSend));
                                                mysqlCon.rollback();
                                                mysqlCon.release();
                                            } else {
                                                mysqlCon.commit(function (err8) {
                                                    if (err8) {
                                                        console.log("Error-->routes-->ruleEngine---->createRule1--", err8);
                                                        objectToSend["error"] = true;
                                                        objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
                                                        res.end(JSON.stringify(objectToSend))
                                                        mysqlCon.rollback();
                                                        mysqlCon.release();
                                                    } else {

                                                        objectToSend["error"] = false;

                                                        objectToSend["data"] = "Added Successfully";
                                                        objectToSend["rule_id"] = rule_id;

                                                        res.send(JSON.stringify(objectToSend));
                                                        mysqlCon.release();
                                                    }
                                                });
                                            }
                                        })

                                    }

                                });
                            }
                        });



                    }





                });

            }

        });
    }
    catch (ex) {
        console.log("Error-->routes-->ruleEngine---->createRule1--", ex);
        objectToSend["error"] = true
        objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
        res.send(objectToSend);
    }

});

function createCondition(when) {
    var content = "";
    // console.log(when)
    for (let i = 0; i < when.length; i++) {
        var cond = when[i].condition;
        if (i == 0) {

        } else if (cond == 'AND') {
            content += '&&\n';
        } else if (cond == 'OR') {
            content += '||\n'
        }
        var rule = when[i].fields;
        //  console.log(rule)
        var leftexprType = rule.leftfunction;
        if (leftexprType === "static (Double)") {
            content += rule.key + '' + rule.operator
            //  content += '"' + rule.value + '"\n'

        }
        else if (leftexprType === "static (String,Date)") {
            content += '"' + rule.key + '"' + rule.operator
            //  content += '"' + rule.value + '"\n'

        }
        else if (leftexprType === "static (Number)") {
            content += rule.key + '' + rule.operator
            //  content += '"' + rule.value + '"\n'

        } else if (leftexprType === "expression") {
            content += rule.key + rule.operator
        } else if (leftexprType === "field") {
            var key = rule.key.split(" - ");
            if (key[1] == 'Number') {
                content += 'input.getLong("' + key[0] + '")' + rule.operator

            } else if (key[1] == 'Double') {
                content += 'input.getDouble("' + key[0] + '")' + rule.operator

            }
            else {
                content += 'input.getString("' + key[0] + '")' + rule.operator

            }



        }
        else if (leftexprType === "lookup") {
            var key = rule.key.split(" - ");

            content += 'Lookup.getStringFrom("' + rule.leftlookup + '",input.get("' + key[0] + '"))' + rule.operator




        }

        var rightexprType = rule.rightfunction;

        if (rightexprType == "static (String,Date)") {

            content += '"' + rule.value + '"\n';

        } else if (rightexprType == "static (Number)") {

            content += rule.value + '\n';

        } else if (rightexprType == "static (Double)") {

            content += rule.value + '\n';

        } else if (rightexprType == "expression") {
            content += rule.value + '\n';
        } else if (rightexprType == "field") {
            var value = rule.value.split(" - ");
            if (value[1] == 'Number') {
                content += 'input.getLong("' + value[0] + '")\n'

            } else if (value[1] == 'Double') {
                content += 'input.getDouble("' + value[0] + '")\n'

            }
            else {
                content += 'input.getString("' + value[0] + '")\n'

            }

        }
        else if (rightexprType == "lookup") {
            var value = rule.value.split(" - ");

            content += 'Lookup.getStringFrom("' + rule.rightlookup + '",input.get("' + value[0] + '"),"' + b_acct_id + '")\n'




        }


    }



    return content;
}

router.get('/getruleLookups:dtls', function (req, res) {
    try {
        var objectToSend = {};
        var b_acct_id = req.params.dtls;
        // var acc_id = req.params.dtls;
        let db="svayam_"+b_acct_id+"_data";
        var sqlQuery = "select lookup_name from " + db + ".rule_lookups" 
        mysqlPool.query(sqlQuery, function (error, results, fields) {
            if (error) {
                console.log("Error-->routes-->ruleEngine-->rules---->getruleLookups--", error);
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
        console.log("Error-->routes-->ruleEngine-->rules---->getruleLookups--", ex);
        objectToSend["error"] = true;
        objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
        res.send(JSON.stringify(objectToSend))
    }
});

router.get('/getallrules:dtls', function (req, res) {
    var objectToSend = {};
    var b_acct_id = req.params.dtls;
    let db="svayam_"+b_acct_id+"_data";
    try {
        mysqlPool.getConnection(function (err, mysqlCon) {
            if (err) {
                console.log("Error-->routes-->rulesEngine-->rules-->addnewrule--", err)
                objectToSend["error"] = true
                objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
                res.send(objectToSend);
            }
            else {


                var query = "select r.rule_id,r.priority,r.rule_name,r.when,r.then,r.`status`,i.event_record_code from "
                    + db + ".rule r left join " + db +
                    ".rule_xref_input_file i on r.rule_id=i.rule_id  "
                    " group by r.rule_id,r.priority,r.rule_name,r.when,r.then,r.`status`,i.event_record_code";
                mysqlCon.beginTransaction(function (err1) {
                    if (err1) {
                        console.log("Error-->routes-->rulesEngine-->rules-->addnewrule--", err1)
                        objectToSend["error"] = true
                        objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
                        res.send(objectToSend);
                        mysqlCon.release();
                    }
                    else {
                        mysqlCon.query(query, function (error, results, fields) {
                            if (error) {
                                console.log("Error-->routes-->rulesEngine-->rules-->addnewrule--", error);
                                objectToSend["error"] = true;
                                objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support.";
                                res.send(JSON.stringify(objectToSend));
                                mysqlCon.rollback();
                                mysqlCon.release();
                            }
                            else {
                                mysqlCon.commit(function (err8) {
                                    if (err8) {
                                        console.log("Error-->routes-->rulesEngine-->rules-->addnewrule--", err8);
                                        objectToSend["error"] = true;
                                        objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
                                        res.end(JSON.stringify(objectToSend))
                                        mysqlCon.rollback();
                                        mysqlCon.release();
                                    } else {

                                        objectToSend["error"] = false;
                                        objectToSend["data"] = results;
                                        res.send(JSON.stringify(objectToSend));
                                        mysqlCon.release();
                                    }
                                });
                            }

                        });


                    }





                });

            }

        });

    }
    catch (ex) {
        console.log("Error-->routes-->rulesEngine-->rules-->getallrules--", ex)
        objectToSend["error"] = true
        objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
        res.send(objectToSend);
    }

});




router.get('/rulebyid:dtls', function (req, res) {
    var obj = JSON.parse(req.params.dtls);

    var objectToSend = {};
    let db="svayam_"+obj.b_acct_id+"_data";

    var query = "";
    query = "select r.rule_id,r.priority,r.rule_name,r.`when`,r.`then`,r.`status`,i.input_layout_id from " + db + ".rule r left join "
        + db + ".rule_xref_input_file i on r.rule_id=i.rule_id   where r.rule_id=" + obj.rule_id;
    mysqlPool.query(query, function (error, results, fields) {
        if (error) {
            console.log("Error-->routes-->rulesEngine-->rules-->rulerulebyidupdate", error);
            objectToSend["error"] = true;
            objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
            res.end(JSON.stringify(objectToSend))
        }
        else {
            // console.log("Update Successfully.");
            objectToSend["error"] = false;
            objectToSend["data"] = results;
            res.send(JSON.stringify(objectToSend))
        }
    });

});

router.delete('/deleterule:dtls', function (req, res) {
    var obj = JSON.parse(req.params.dtls);
    let db="svayam_"+obj.b_acct_id+"_data";
    var objectToSend = {};
    try {
        mysqlPool.getConnection(function (err, mysqlCon) {
            if (err) {
                console.log("Error-->routes-->rulesEngine-->rules-->addnewrule--", err)
                objectToSend["error"] = true
                objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
                res.send(objectToSend);
            }
            else {


                var query = "delete from " + db + ".rule where rule_id='" + obj.rule_id + "'";
                var query1 = "delete from " + db + ".rule_xref_input_file where rule_id='" + obj.rule_id + "'";

                mysqlCon.beginTransaction(function (err1) {
                    if (err1) {
                        console.log("Error-->routes-->rulesEngine-->rules-->addnewrule--", err1)
                        objectToSend["error"] = true
                        objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
                        res.send(objectToSend);
                        mysqlCon.release();
                    }
                    else {
                        mysqlCon.query(query + ";" + query1, function (error, results, fields) {
                            if (error) {
                                console.log("Error-->routes-->rulesEngine-->rules-->addnewrule--", error);
                                objectToSend["error"] = true;
                                objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support.";
                                res.send(JSON.stringify(objectToSend));
                                mysqlCon.rollback();
                                mysqlCon.release();
                            }
                            else {


                                mysqlCon.commit(function (err8) {
                                    if (err8) {
                                        console.log("Error-->routes-->rulesEngine-->rules-->addnewrule--", err8);
                                        objectToSend["error"] = true;
                                        objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
                                        res.end(JSON.stringify(objectToSend))
                                        mysqlCon.rollback();
                                        mysqlCon.release();
                                    } else {

                                        objectToSend["error"] = false;
                                        objectToSend["data"] = "Rule Delete Successfully";
                                        res.send(JSON.stringify(objectToSend));
                                        mysqlCon.release();

                                    }
                                });
                            }

                        });


                    }





                });

            }

        });

    }
    catch (ex) {
        console.log("Error-->routes-->rulesEngine-->rules-->getallrules--", ex)
        objectToSend["error"] = true
        objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
        res.send(objectToSend);
    }

});

router.put('/updatestatus', function (req, res) {
    try {

        var row = req.body;

        var objectToSend = {};
        let db="svayam_"+row.b_acct_id+"_data";
        var sqlQuery = "Update " + db + ".rule set status='" + row.status + "' where rule_id=" + row.rule_id;
        mysqlPool.query(sqlQuery, function (error, results, fields) {
            if (error) {
                console.log("Error-->routes-->ruleEngine-->rules---->updatestatus--", error);
                objectToSend["error"] = true;
                objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."

                res.end(JSON.stringify(objectToSend))
            }
            else {
                //  console.log("Error-->false-->routes-->userManagement-->userRole---->updaterole--");

                objectToSend["error"] = false;
                objectToSend["data"] = "status Update Successfully";
                res.send(JSON.stringify(objectToSend))
            }
        });
    }
    catch (ex) {
        console.log("Error-->routes-->ruleEngine-->rules---->updatestatus--", ex);
        objectToSend["error"] = true;
        objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
        res.send(JSON.stringify(objectToSend))
    }
});



router.put('/updateRule', function (req, res) {

    var rule = req.body.rule;
    var objectToSend = {};

    var rule_id = req.body.rule_id;
    var b_acct_id = req.body.b_acct_id
    var event_record_code = req.body.event_record_code;
    let db="svayam_"+b_acct_id+"_data";
    let dbs="svayam_"+b_acct_id+"_md";

    /* var is_extension_rule=req.body.is_extension_rule;
    if(is_extension_rule==1){
        var line_id=req.body.line_id;
    } */




    var rule_name = req.body.rule_name;

    try {

        var priority = req.body.priority;



        var query = "update " + db + ".rule set `when`='" + rule.when + "', `then`='" + rule.then + "',priority='" + priority + "',rule_name=" + SqlString.escape(rule_name) + " where rule_id=" + req.body.rule_id;

        var query1 = "select `when`,`then` from " + db + ".rule where rule_id= " + rule_id;

        var query3 = "select field_technical_name from " + dbs + ".field_info where field_logical_id='18'";

        mysqlPool.getConnection(function (err, mysqlCon) {

            if (err) {

                console.log("Error-->routes-->ruleEngine---->update--", err)

                objectToSend["error"] = true

                objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."

                res.send(objectToSend);

            }

            else {





                mysqlCon.beginTransaction(function (err1) {

                    if (err1) {

                        console.log("Error-->routes-->ruleEngine---->update--", err1)

                        objectToSend["error"] = true

                        objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."

                        res.send(objectToSend);

                        mysqlCon.release();

                    }

                    else {

                        mysqlCon.query(query + ";" + query1 + ";" + query3, function (error, results, fields) {

                            if (error) {

                                console.log("Error-->routes-->ruleEngine---->update--", error);

                                objectToSend["error"] = true;

                                objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support.";

                                res.send(JSON.stringify(objectToSend));

                                mysqlCon.rollback();

                                mysqlCon.release();

                            }

                            else {



                                var when = JSON.parse(results[1][0].when)

                                var then = JSON.parse(results[1][0].then)



                                content2 = '';

                                content2 += 'package com.svayam.RuleEngine;' + '\n';
                                content2 += 'global java.lang.String ev_id;' + '\n';

                                content2 += 'rule "' + rule_name + '_' + b_acct_id + '"' + '\n';

                                content2 += 'salience ' + priority + '\n';

                                content2 += 'when' + '\n' + 'input:InputRecord(' + '\n';

                                //  content2+='input.get("account_id")=='+acct_id+'\n';

                                if (JSON.stringify(when) != "[]") {

                                    //content2+='&&'+'\n';
                                    //if(is_extension_rule==0){
                                    content2 += '(Lookup.checkEventLayout(input.getString("' + results[2][0].field_technical_name + '"))=="' + event_record_code + '")\n';
                                    // }
                                    //if(is_extension_rule==1){

                                    // content2 +='(input.isKeyPresent("c_'+line_id+'")==true)\n';

                                    // }



                                    //  content2+='(Lookup.checkEventLayout(input.getString("event_cd"),"'+acct_id+'")=="'+file_id+'")\n';

                                    content2 += '&&' + '\n';

                                    content2 += '(' + createCondition(when ) + ')' + '\n';

                                }

                                content2 += ')' + '\n';



                                content2 += 'then' + '\n';

                                for (var i = 0; i < then.length; i++) {

                                    content2 += 'OutputRecord ' + then[i].outObj + '_' + i + '= new OutputRecord("' + then[i].outFileId +  '",ev_id);' + '\n';

                                    var writingtype = then[i].outObj + '_' + i + '.set';



                                    for (var j = 0; j < then[i].assignments.length; j++) {

                                        var value = then[i].assignments[j].value;

                                        var key = then[i].assignments[j].key;

                                        if (value == "static") {

                                            content2 += writingtype + '("' + key + '","' + then[i].assignments[j].newValue + '");' + '\n';

                                        } else if (value == "expression") {

                                            content2 += writingtype + '("' + key + '",' + then[i].assignments[j].newValue + ');' + '\n';

                                        } else if (value == "field") {

                                            content2 += writingtype + '("' + key + '",input.get("' + then[i].assignments[j].newValue + '"));' + '\n';

                                        }

                                        else if (value == "lookup") {

                                            content2 += writingtype + '("' + key + '",Lookup.getStringFrom("' + then[i].assignments[j].lookupValue + '",input.get("' + then[i].assignments[j].newValue + '")));' + '\n';

                                        }

                                    }

                                    content2 += 'input.setOutput(' + then[i].outObj + '_' + i + ');' + '\n';

                                }

                                content2 += 'end'

                                //   console.log(content2)



                                var sql1 = "update " + db + ".rule set  `drl`='" + content2 + "' where rule_id=" + req.body.rule_id;

                                mysqlCon.query(sql1, function (error3, results3) {

                                    if (error3) {

                                        console.log("Error-->routes-->ruleEngine---->update--", error3);

                                        objectToSend["error"] = true;

                                        objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support.";

                                        res.send(JSON.stringify(objectToSend));

                                        mysqlCon.rollback();

                                        mysqlCon.release();

                                    } else {

                                        mysqlCon.commit(function (err8) {

                                            if (err8) {

                                                console.log("Error-->routes-->ruleEngine---->update--", err8);

                                                objectToSend["error"] = true;

                                                objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."

                                                res.end(JSON.stringify(objectToSend))

                                                mysqlCon.rollback();

                                                mysqlCon.release();

                                            } else {

                                                

                                                objectToSend["error"] = false;



                                                objectToSend["data"] = "Updated Successfully";

                                                res.send(JSON.stringify(objectToSend));

                                                mysqlCon.release();

                                            }

                                        });

                                    }

                                })



                            }



                        });





                    }











                });



            }



        });

    }

    catch (ex) {



        console.log("Error-->routes-->ruleEngine---->update--", ex)

        objectToSend["error"] = true

        objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."

        res.send(objectToSend);

    }



});

router.post('/compileRule', function (req, res) {
    var obj = req.body;
    var objectToSend = {};
    let args = "";
    if (obj["data"] == undefined) {
        args = JSON.stringify(obj)
        args = SqlString.escape(args)
        args = args.substring(1, args.length - 1)
    } else {
        for (let i = 0; i < obj["data"].length; i++) {
            obj["data"][i] = JSON.stringify(obj["data"][i])
        }

        obj["data"] = JSON.stringify(obj["data"])

        args = SqlString.escape(JSON.stringify(obj))
        args = args.substring(1, args.length - 1)
    }




    //body = body.replace(/"/g, '\\"')
    var objectToSend = {};

    const exec = require('child_process').exec;
    //console.log("executing command-->java -jar jar/RuleValidator.jar "+args)
    const childPorcess = exec('java -cp jars/ProcessData.jar com.svayam.TestRules.ValidateRule  "' + args + '"', function (err, stdout, stderr) {
        if (err) {

            console.log("Error-->routes-->ruleEngine-->rules---->compileRule--", err);

            objectToSend["error"] = true;

            objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."



            res.end(JSON.stringify(objectToSend))

        }
        else if(stdout) {
            res.send(stdout)
        }else if(stderr){
            console.log("Error-->routes-->ruleEngine-->rules---->compileRule--STDERR", stderr);

            objectToSend["error"] = true;

            objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."

            res.end(JSON.stringify(objectToSend))
        }
        
    });

});

router.get('/getRulesForTestComponent:dtls', function (req, res) {
    var b_acct_id = req.params.dtls;

    var objectToSend = {};

    var query = "";
    let db="svayam_"+b_acct_id+"_data";
    query = "select r.rule_id,r.priority,r.rule_name,i.input_layout_id from " + db + ".rule r left join "
        + db + ".rule_xref_input_file i on r.rule_id=i.rule_id   ";
    mysqlPool.query(query, function (error, results, fields) {
        if (error) {
            console.log("Error-->routes-->rulesEngine-->rules-->getRulesForTestComponent", error);
            objectToSend["error"] = true;
            objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
            res.end(JSON.stringify(objectToSend))
        }
        else {
            // console.log("Update Successfully.");
            objectToSend["error"] = false;
            objectToSend["data"] = results;
            res.send(JSON.stringify(objectToSend))
        }
    });

});


router.post('/RuleReplication', function (req, res) {
    var objectToSend = {};
    try {
        mysqlPool.getConnection(function (err, mysqlCon) {
            if (err) {
                console.log("Error-->routes-->rulesEngine-->rules-->RuleReplication--", err)
                objectToSend["error"] = true
                objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
                res.send(objectToSend);
            }
            else {
                var rule_id = req.body.rule_id;
                var priority = req.body.priority;
                var rule_name = req.body.rule_name;
                var b_acct_id = req.body.b_acct_id;
                let db="svayam_"+b_acct_id+"_data";

                var query = "insert into " + db + ".rule (priority,rule_name,`when`,`then`,`status`) select "
                    + priority + ",'" + rule_name + "',u.`when`,u.`then`,u.status from " + db + ".rule u where u.rule_id=" + rule_id;


                mysqlCon.beginTransaction(function (err1) {
                    if (err1) {
                        console.log("Error-->routes-->rulesEngine-->rules-->RuleReplication--", err1)
                        objectToSend["error"] = true
                        objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
                        res.send(objectToSend);
                        mysqlCon.release();
                    }
                    else {
                        mysqlCon.query(query, function (error, results, fields) {
                            if (error) {
                                console.log("Error-->routes-->rulesEngine-->rules-->RuleReplication--", error);
                                objectToSend["error"] = true;
                                objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support.";
                                res.send(JSON.stringify(objectToSend));
                                mysqlCon.rollback();
                                mysqlCon.release();
                            }
                            else {
                                var query1 = "insert into " + db + ".rule_xref_input_file (rule_id,event_record_code) select "
                                    + results.insertId + ",x.event_record_code from " + db + ".rule_xref_input_file  x where x.rule_id=" + rule_id;

                                mysqlCon.query(query1, function (error1, results1, fields1) {
                                    if (error1) {
                                        console.log("Error-->routes-->rulesEngine-->rules-->RuleReplication--", error1);
                                        objectToSend["error"] = true;
                                        objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support.";
                                        res.send(JSON.stringify(objectToSend));
                                        mysqlCon.rollback();
                                        mysqlCon.release();
                                    }
                                    else {
                                        var query2 = "select * from " + db + ".rule where rule_id=" + results.insertId;

                                        mysqlCon.query(query2, function (error2, results2, fields2) {
                                            if (error2) {
                                                console.log("Error-->routes-->rulesEngine-->rules-->RuleReplication--", error2);
                                                objectToSend["error"] = true;
                                                objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support.";
                                                res.send(JSON.stringify(objectToSend));
                                                mysqlCon.rollback();
                                                mysqlCon.release();
                                            }
                                            else {


                                                mysqlCon.commit(function (err8) {
                                                    if (err8) {
                                                        console.log("Error-->routes-->rulesEngine-->rules-->RuleReplication--", err8);
                                                        objectToSend["error"] = true;
                                                        objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
                                                        res.send(JSON.stringify(objectToSend))
                                                        mysqlCon.rollback();
                                                        mysqlCon.release();
                                                    } else {

                                                        objectToSend["error"] = false;
                                                        objectToSend["data"] = results2;
                                                        res.send(objectToSend)
                                                        mysqlCon.release();
                                                    }
                                                });



                                            }
                                        });
                                    }
                                });




                            }

                        });


                    }





                });

            }

        });

    }
    catch (ex) {

    }

});





module.exports = router;
