![license: MIT]( https://img.shields.io/badge/license-MIT-green.svg?style=flat-square)
[![twitter: @andrinbertschi]( https://img.shields.io/badge/twitter-andrinbertschi-yellow.svg?style=flat-square)](twitter.com/andrinbertschi)  

# sailfish-reload
   > Auto update source changes and sync them to the a target device like the Sailfish Emulator or the Jolla Phone.

This module aims to speed up QML prototyping for SailfishOS by auto syncing changes to a target.
It is analogous to an auto refresh feature in web development.

[![NPM](https://nodei.co/npm/sailfish-reload.png)](https://nodei.co/npm/sailfish-reload/)

![sailfish-reload-demo](http://abertschi.ch/default_public/sailfish-reload-demo.700.gif)

### Requirements
1. node.js - http://nodejs.org/download/  
2. sshfs - http://fuse.sourceforge.net/sshfs.html  

### How to use it
1. Install globally with `npm install -g sailfish-reload`.
2. Create and configure reloadfile. Use `sailfish-reload --create-reloadfile`.
3. Start auto syncing with `sailfish-reload`

#### CLI options
- `--cwd` specify the working directory to run sailfish-reload
- `--reloadfile` specify an exact reloadfile path
- `--verbose` show some debugging info about how sailfish-reload is working.
- `--create-reloadfile` generate a configuration file

### Compatibility
- Tested under OSX. GNU/Linux should work as well.

### Sample reloadfile
```json
{
    "device": {
        "host": "localhost",
        "port": "2223"
    },
    "sync": {
        "user": "root",
        "privateKeyFile": "/sailfish-sdk/vmshare/ssh/private_keys/SailfishOS_Emulator/root",
        "files": [
        {
            "from": ["./src/**/*.*"],
            "to": "/usr/share/test/src"
        },
        {
            "from": ["./qml/**/*.*"],
            "to": "/usr/share/test/qml"
        },
        {
            "from": ["./test.pro", "./test.test"],
            "to": "/usr/share/test"
        }]
    },
    "run": {
        "user": "nemo",
        "privateKeyFile": "/sailfish-sdk/vmshare/ssh/private_keys/SailfishOS_Emulator/nemo",
        "exec": ["echo hello"]
    }
}
```

#### device
```
"device": {
    "host": "",
    "port": ""
}
```
The device section covers the host and the port of target device.
One may configure multiple reload files for more than one device and use the `--reloadfile` flag to specify the file.

#### sync
The sync section defines the user being used to mount the target device.
Further it defines what to sync with the target.

The `keyfile` property is optional. If not set, the script prompts to enter the password.


```
"sync": {
    "user": "",
    "privateKeyFile": "",
    "files": [
        {
            "from": [],
            "to": ""
        }]
}
```
#### run

The run section is optional.
One may use it to execute commands on the target device after files are synchronized.

```
"run": {
    "user": "",
    "privateKeyFile": "",
    "exec": []
}
```

`exec` is an array containing commands being executed on the target device in their specified order.

### Under the hood
 - sshfs to mount target filesystem
 - ssh to execute exec commands
 - Gulp.js to detect and sync any file changes

There is no dependency to SailfishOS. One may use that module or componets of it for other devices or purposes.

##Contributing
Help is always welcome. Contribute to the project by forking and submitting a pull request.
