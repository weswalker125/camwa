const foscam = require('Foscam');
const fs = require('fs');
const commandLineArgs = require('command-line-args');

const optionDefinitions = [
  { name: 'host', alias: 'h', type: String },
  { name: 'username', alias: 'u', type: String, defaultValue: 'admin' },
  { name: 'password', alias: 's', type: String, defaultValue: '' },
  { name: 'port', alias: 'p', type: Number, defaultValue: 80 },
  { name: 'output', alias: 'o', type: String, defaultValue: '/tmp/camwa' },
  { name: 'maxHistory', type: Number, defaultValue: 100 },
  { name: 'interval', alias: 'i', type: Number, defaultValue: 5 }
]

const options = commandLineArgs(optionDefinitions);

console.log(options);

function takePhoto() {
    console.log("taking snapshot");
    var outputFile = options['output'] + "/snapshot_"+(new Date()).getTime()+".jpg";
    foscam.snapshot(outputFile, cleanUp);
}

function cleanUp() {
    var outputDir = options['output'];
    fs.readdir(outputDir, function(err, files) {
        if (files.length > options['maxHistory']) {
            console.log("cleaning up output directory...");
            // delete oldest
            files.sort();
            while (files.length > options['maxHistory'] - 1) {
                console.log("deleting file: %s", files[0]);
                fs.unlink(outputDir +"/"+ files[0], console.log);
                files.shift();
            }
        }
    });
}

foscam.setup({
    host: options['host'],
    user: options['username'],
    password: options['password'],
    port: options['port']
}, console.log);

setInterval(takePhoto, options['interval']*1000);