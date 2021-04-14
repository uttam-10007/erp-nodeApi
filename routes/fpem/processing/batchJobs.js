var express = require('express');
var router = express.Router();
var SqlString=require('sqlstring')

router.post("/processFile",(req,res)=>{
console.log("Processing");
	    let objectToSend={}

	    var obj=req.body;

	   const exec = require('child_process').exec;

	    let command="spark-submit --master yarn --deploy-mode client --class com.svayam.DataProcessing.StartProcessing --num-executors 6 --executor-cores 1 --executor-memory 1536M --conf spark.yarn.am.nodeLabelExpression=L --conf spark.yarn.executor.nodeLabelExpression=SPARK --jars ./jar/FpemMain.jar,./jar/FpemMain_lib/* ./jar/FpemMain.jar "+obj.upload_id

	    exec(command, function (err, stdout, stderr) {
			if(stderr){
//console.log(stderr)
}		            
if (err){
	//console.log(err)
}
		        }) ;
	objectToSend["error"]=false;
	objectToSend["data"]="Submiiting Job";
	res.send(objectToSend);

})
router.post("/advanceppdtest", (req, res) => {
	let objectToSend = {}

	var obj = req.body;

	const exec = require('child_process').exec;

	let command = "spark-submit --master yarn --deploy-mode client --class com.svayam.BalanceProcessing.StartProcessing --num-executors 6 --executor-cores 3 --executor-memory 5g --conf spark.yarn.am.nodeLabelExpression=L --conf spark.yarn.executor.nodeLabelExpression=SHARED --jars ./jar/AdvancePPD.jar,./jar/AdvancePPD_lib/* ./jar/AdvancePPD.jar " + obj.acct_id
	exec(command, function (err, stdout, stderr) {
		if (err) {

			console.log("Error-->routes-->ruleEngine-->rules---->compileRule--", err);

			objectToSend["error"] = true;

			objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."



			res.send(objectToSend)

		}
		else {

			
			res.send(stdout)
		}
	})
});

module.exports=router;
