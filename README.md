# Web MIDI Playground

This is a test environment for all things web audio and midi

## Install

* Install dependencies `npm install`
* Generate https certificate `./generate_rsa.sh`

I run a https server because I plan to access microphone stream (chrome only allows 'getUserMedia' on a secure url now).  
However it's not essential at present and will not break the node server if you don't generate the cert files.

## Run

* To quickstart just run `npm run start`
* Otherwse, to start the secure local server seperately run `node server.js`
* Then run either `npm run watch` or `npm run watch:deploy` to build js and css

'npm run watch:deploy' simply minifies js and css as it goes.

## Fiddle

You should be able to access the project at

* `https://localhost:3000/`
* `http://localhost:8080/`

Microphone access isn't currently implemented so simply opening `index.html` works also.
