var express = require('express');
var app = express();
var multer = require('multer');
var upload = multer();
const fs = require('fs')
const fspromises = require('fs/promises')


/* Adding a middleware for preflight */
app.use(function (req, res, next) {
   res.setHeader('Access-Control-Allow-Origin', '*');
   res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
   res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type,boundary');
   next();
});

app.use(upload.single('minidump'));
app.use(express.static('ui'));

app.get("/", function (req, res) {
   res.sendFile('ui/index.html', { root: '.' });
})

app.post('/dump', function (req, res) {
   console.log(req.file);
   const ret = write_dump_file(req.file.originalname, req.file.buffer);
   ret.then(success => {
      return execute_shell(req.file.originalname);
   }, fail => { console.error("Failed to write the file!!!!"); }).then(
      success => {
         callback(res, req.file.originalname, success.toString());
      }, fail => {
         callback(res, req.file.originalname, fail.toString());
         console.error("Failed to execute command!!!");
      }
   ).catch(err => { console.error("Error occured in one of the step!!") })
})


async function write_dump_file(filename, data) {
   const pr = await fspromises.writeFile(filename, data);
   return pr;
}

function execute_shell(filename) {
   return new Promise((resolve, reject) => {
      let result = "";
      const { spawn } = require('child_process');
      const ls = spawn('ls', [filename]);

      ls.stdout.on('data', (data) => {
         result += data;
         console.log(`stdout: ${data}`);
      });

      ls.stderr.on('data', (data) => {
         result += data;
         console.log(`stderr: ${data}`);
      });

      ls.on('close', (code) => {
         if (code == 0) {
            console.error("Command succeded!!!");
            resolve(result);
         }
         else {
            console.error("Command execution failed!!!");
            reject(result);
         }
      });
   });
}

function callback(res, file, data) {
   console.log(data);
   res.json({ filename: file, result: data });
}

var server = app.listen(80, function () {
   var host = server.address().address
   var port = server.address().port

   console.log("Server is listening at http://%s:%s", host, port)
})
