// multer to upload image
const multer = require('multer');

const fs = require('fs');


module.exports = {
    uploadImage: (req, res) => {
        console.log(req.files)
        let tmp_path = req.files[0].path;
        let target_path = 'uploads/upload_hr_file/' + req.files[0].originalname + "_" + req.files[0].fieldname.split(" ")[1]+ "_" + req.files[0].fieldname.split(" ")[2];
        var src = fs.createReadStream(tmp_path);
        var dest = fs.createWriteStream(target_path);
        src.pipe(dest);
        src.on('end', function() { res.sendStatus(200); });
        src.on('error', function(err) { res.sendStatus(500); });
    }
}