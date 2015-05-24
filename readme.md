![license: MIT]( https://img.shields.io/badge/license-MIT-green.svg?style=flat-square)
[![twitter: @andrinbertschi]( https://img.shields.io/badge/twitter-andrinbertschi-yellow.svg?style=flat-square)](twitter.com/andrinbertschi)  

# sailfish-reload
   > Auto update source changes and sync them to the a target device like the Sailfish Emulator or the Jolla Phone.

This module aims to speed up QML prototyping for SailfishOS by auto syncing changes to a target. It is analogous to an auto refresh feature in web development.

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
        "password": "",
        "keyfile": "/sailfish-sdk/vmshare/ssh/private_keys/SailfishOS_Emulator/root",
        "from": ["./harbour-wlan-keyboard/main.py",
                 "./harbour-wlan-keyboard/qml/**/*.*"],
        "to": "/usr/share/harbour-wlan-keyboard"
    },
    "run": {
        "user": "nemo",
        "password": "",
        "keyfile": "/sailfish-sdk/vmshare/ssh/private_keys/SailfishOS_Emulator/nemo",
        "exec": ["pkill sailfish-qml",
                 "sailfish-qml harbour-wlan-keyboard"]
    }
}
```

#### device
```
"device":
{
    "host": "",
    "port": ""
}
```
Host and port of target device.  
One may configure multiple reloadfiles for more than one device and use the `--reloadfile` flag to specify the file.

#### sync

```
"sync": 
{
    "user": "",
    "password": "",
    "keyfile": "",
    "from": [],
    "to": ""
}
```
#### run
```
"run": {
    "user": "",
    "password": "",
    "keyfile": "",
    "exec": []
}
```

### Under the hood
 - sshfs to mount target filesystem
 - ssh to execute exec commands
 - Gulp.js to detect and sync any file changes


##Contributing
Help is always welcome. Contribute to the project by forking and submitting a pull request.