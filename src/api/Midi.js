import _ from 'lodash'

let midiAccess = null;
let stateListeners = [];
let deviceListeners = {};

export function isAvailable() {
	return (navigator.requestMIDIAccess) ? true : false;
}

export function requestAccess(successCallback = () => {}, failureCallback = () => {}) {
	if(midiAccess !== null) {
		return midiAccess;
	}else{
		console.log('Requesting MIDI Access');
		if(isAvailable()) {
			return navigator.requestMIDIAccess({sysex: false}).then(
				midiAccessObject => {
					onMidiSuccess(midiAccessObject);
					successCallback(midiAccessObject);
				}, 
				error => {
					onMidiFailure(error);
					failureCallback(error);
				}
			);
		}else{
			console.warn('No MIDI support in your browser - just Chrome as of now');
			return false;
		}
	}
}

export function getAccessObject() {
	return midiAccess;
}

export function getMidiInputDevices() {
	if(!midiAccess) return nope();

	const devices = [];
	const inputs = midiAccess.inputs.values();
	for(let input = inputs.next(); input && !input.done; input = inputs.next()) {
		const device = input.value;
		devices.push(device);
		device.onmidimessage = event => onMidiMessage(device, event.data);
	}
	return devices;
}

export function getMidiOutputDevices() {
	if(!midiAccess) return nope();

	const devices = [];
	const outputs = midiAccess.outputs.values();
	for(let output = outputs.next(); output && !output.done; output = outputs.next()) {
		devices.push(output.value);
	}
	return devices;
}

export function addStateListener(callback) {
	if(!_.contains(stateListeners, callback)) {
		stateListeners.push(callback);
	}
}

export function removeStateListener(callback) {
	if(_.contains(stateListeners, callback)) {
		stateListeners = stateListeners.filter(stateListener => !_.isEqual(stateListener, listener));
	}
}

export function addDeviceListener(device, callback) {
	if(!_.contains(Object.keys(deviceListeners), device.id)) {
		deviceListeners[device.id] = callback;
	}
}

export function removeDeviceListener(device, callback) {
	if(_.contains(Object.keys(deviceListeners), device.id)) {
		deviceListeners[device.id] = undefined;
	}
}

function nope() {
	console.warn('No midi access at present');
	return false;
}

function onMidiSuccess(_midiAccess) {
	midiAccess = _midiAccess;
	console.log('MIDI Access Granted!', _midiAccess);
	_midiAccess.onstatechange = onStateChange;
}

function onMidiFailure(error) {
	// when we get a failed response, run this code
	console.warn(error.message);
}

function onStateChange(event) {
	for(let listener of stateListeners) {
		listener(event);
	}
	if(event.constructor.name == 'MIDIConnectionEvent') {
		const port = event.port;
		const status = port.state == 'connected' ? '🔵' : '🔴';
		console.log(status+' '+port.type+' '+port.state+': '+port.name);
	}		
}

function onMidiMessage(device, message) {
	Object.keys(deviceListeners).map(key => {
		if(device.id === key) {
			const midiObject = message;//getMidiMessageObject(message);
			deviceListeners[key](midiObject);
		}
	});
}
