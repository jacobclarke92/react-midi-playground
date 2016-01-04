import _ from 'lodash'

// initial state
let midiAccess = null;
let stateListeners = [];
let globalListeners = [];
let deviceListeners = {};

export function isAvailable() {
	return (navigator.requestMIDIAccess) ? true : false;
}

export function requestAccess(successCallback = () => {}, failureCallback = () => {}) {
	if(midiAccess !== null) {
		return midiAccess;
	}else{
		if(isAvailable()) {
			console.log('🕐 Requesting MIDI Access');

			// sysex is midi system messages, such as clock sync, which is considered garbage data most of the time
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

export function getMidiInputDevices() {
	const devices = [];
	if(!midiAccess) return nope(devices);

	const inputs = midiAccess.inputs.values();
	for(let input = inputs.next(); input && !input.done; input = inputs.next()) {
		const device = input.value;
		devices.push(device);
		device.onmidimessage = event => onMidiMessage(device, event.data);
	}
	return devices;
}

export function getMidiOutputDevices() {
	const devices = [];
	if(!midiAccess) return nope(devices);

	const outputs = midiAccess.outputs.values();
	for(let output = outputs.next(); output && !output.done; output = outputs.next()) {
		devices.push(output.value);
	}
	return devices;
}

// we need to create listeners because onmidimessage & onstatechange can only be attached to one function at a time
// so we keep those attached functions private in here and trigger callbacks manually
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

export function addGlobalMidiListener(callback) {
	if(!_.contains(globalListeners, callback)) {
		globalListeners.push(callback);
	}
}

export function removeGlobalMidiListener(callback) {
	if(_.contains(globalListeners, callback)) {
		globalListeners = globalListeners.filter(globalListener => !_.isEqual(globalListener, listener));
	}
}

// api system functions
function nope(returning = false) {
	console.warn('No midi access at present');
	return returning;
}

function onMidiSuccess(_midiAccess) {
	midiAccess = _midiAccess;
	console.log('✅ MIDI Access Granted!', _midiAccess);
	_midiAccess.onstatechange = onStateChange;
}

function onMidiFailure(error) {
	console.warn(error.message);
}

function onStateChange(event) {
	for(let listener of stateListeners) {
		listener(event);
	}

	// unsure if checking constructor name is kosher, onStateChange seems to only be MIDIConnectionEvent anyway
	if(event.constructor.name == 'MIDIConnectionEvent') {
		const port = event.port;
		const status = port.state == 'connected' ? '🔵' : '🔴';
		console.log(status+' '+port.type+' '+port.state+': '+port.name);
	}		
}

function onMidiMessage(device, message) {
	for(let globalListener of globalListeners) {
		globalListener(device, message);
	}
	Object.keys(deviceListeners).map(key => {
		if(device.id === key) {
			const midiObject = message;//getMidiMessageObject(message);
			deviceListeners[key](midiObject);
		}
	});
}
