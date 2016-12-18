const foscam = require('Foscam');
const fs = require('fs');
const commandLineArgs = require('command-line-args');

const optionDefinitions = [
  { name: 'action', alias: 'a', type: String},
  { name: 'host', alias: 'h', type: String },
  { name: 'username', alias: 'u', type: String, defaultValue: 'admin' },
  { name: 'password', alias: 's', type: String, defaultValue: '' },
  { name: 'port', alias: 'p', type: Number, defaultValue: 80 },
  { name: 'output', alias: 'o', type: String },
  { name: 'maxHistory', type: Number, defaultValue: 100 },
  { name: 'interval', alias: 'i', type: Number, defaultValue: 5 },
  { name: 'direction', type: String },
];

function takePhoto() {
    console.log("taking snapshot");
    var outputFile = options['output'] + "/snapshot_"+(new Date()).getTime()+".jpg";
    foscam.snapshot(outputFile, cleanUp);
}

function cleanUp() {
    fs.readdir(options['output'], function(err, files) {
        if (err) {
            console.log(err);
        }
        if (files.length > options['maxHistory']) {
            console.log("cleaning up output directory...");
            // delete oldest
            files.sort();
            while (files.length > options['maxHistory'] - 1) {
                console.log("deleting file: %s", files[0]);
                fs.unlink(options['output'] +"/"+ files[0], console.log);
                files.shift();
            }
        }
    });
}

// Get cli args
const options = commandLineArgs(optionDefinitions);
console.log(options);

// Connect to camera (output connection status to console)
foscam.setup({
    host: options['host'],
    user: options['username'],
    password: options['password'],
    port: options['port']
}, console.log);

// Validate output directory
if (undefined === options['output']) {
    // store locally if no output is defined
    options['output'] = '.';
} else {
    // check the dir's existence
    if (!fs.existsSync(options['output'])){
        // create if not there
        fs.mkdirSync(options['output']);
    }
}

switch (options['action']) {
    case 'record':
        // start periodic snapping
        setInterval(takePhoto, options['interval']*1000);
    break;
    case 'move':
        // adjust camera angle
        foscam.control.decoder (options['direction'], function () {
            console.log ('start sleep');
            setTimeout(function () {
                console.log('woke.');
                // stop rotation
                foscam.control.decoder ('stop ' + options['direction'], function () {
                    takePhoto();
                });
            }, 1500);
            
        });
    break;
    default:
        // take single snapshot
        takePhoto();
    break;
}
console.log('done');
return;