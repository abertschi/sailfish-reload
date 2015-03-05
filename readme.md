![license: MIT]( https://img.shields.io/badge/license-MIT-green.svg?style=flat-square)
[![twitter: @andrinbertschi]( https://img.shields.io/badge/twitter-andrinbertschi-yellow.svg?style=flat-square)](twitter.com/andrinbertschi)  

# sailfish-reload
   > Auto update source changes and sync them to the Sailfish Emulator or the Jolla Phone.

This module aims to speed up QML prototyping for SailfishOS by autosyncing any changes to a target. It is analogous to an autorefresh feature in web development.

[![NPM](https://nodei.co/npm/sailfish-reload.png)](https://nodei.co/npm/sailfish-reload/)

![sailfish-reload-demo](http://abertschi.ch/default_public/sailfish-reload-demo.700.gif)

### Requirements
0. sailfish-sdk - https://sailfishos.org/develop/
1. node.js - http://nodejs.org/download/  
2. sshfs - http://fuse.sourceforge.net/sshfs.html  

### How to use it
1. Install globally with `npm install -g sailfish-reload`.
2. Create and configure reloadfile. Use `sailfish-reload --create-reloadfile`.
3. Start autosyncing with `sailfish-reload`

#### CLI options
- `--cwd` specify the working directory to run sailfish-reload
- `--reloadfile` specify an exact reloadfile path
- `--verbose` show some debugging info about how sailfish-reload is working.

### Compatibility
- Tested under OSX. GNU/Linux should work as well.
- Not yet tested under Windows. There may be issues due to no native Bash support.

### Sample reloadfile
```json
{
    "sshfs": {
        "host": "localhost",
        "user": "root",
        "port": "2223",
        "keyfile": "/Applications/sailfish-sdk/vmshare/ssh/private_keys/SailfishOS_Emulator/root"
    },
    "sync": {
        "src": [
            "/home/abertschi/beandata/pgm/proj/sailfish-wlan-keyboard/harbour-wlan-keyboard/qml/**/*.*"
        ],
        "dest": "/usr/share/harbour-wlan-keyboard/qml"
    },
    "mount": "/mnt/jolla",
    "sailfish": {
        "autoLaunch": true,
        "app": "harbour-wlan-keyboard",
        "ssh": {
            "host": "localhost",
            "user": "nemo",
            "port": "2223",
            "keyfile": "/Applications/sailfish-sdk/vmshare/ssh/private_keys/SailfishOS_Emulator/nemo"
        }
    }
}
```

#### sshfs
Credentials used to mount filesystem of target device to host.

##### sshfs.host
Ip address of the target. Either Emulator or jolla phone.

##### sshfs.user
User for sshfs connection.

##### sshfs.port
Port for sshfs connection.

##### sshfs.keyfile

#### sync

##### sshfs.src

##### sshfs.dest

##### mount

##### sailfish

##### sailfish.autoLaunch

##### sailfish.app

##### sailfish.ssh
Credentials to execute autolaunch command.

### Under the hook
 - sshfs to map target.
 - Gulp.js to detect and sync any file changes.
