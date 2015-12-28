let midiAccess = null;

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
					onMIDISuccess(midiAccessObject);
					successCallback(midiAccessObject);
				}, 
				error => {
					onMIDIFailure(e);
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
		devices.push(input.value);
	}
	return devices;
}

function nope() {
	console.warn('No midi access at present');
	return false;
}

function onMIDISuccess(_midiAccess) {
	midiAccess = _midiAccess;
	console.log('MIDI Access Granted!', _midiAccess);
}

function onMIDIFailure(error) {
	// when we get a failed response, run this code
	console.warn('No access to MIDI devices or your browser doesn\'t support WebMIDI API. ' + error);
}