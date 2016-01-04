import React from 'react'
import ReactDOM from 'react-dom'
import { compose, createStore } from 'redux'
import { Provider } from 'react-redux'
import persistState from 'redux-localstorage'

import App from 'App'
import * as Midi from 'api/Midi'
import { getMidiMessageObject } from 'utils/midiUtils'

import reducer from 'reducers'
import { midiEnabled, midiDisabled, clearCurrentMappingAlias } from 'reducers/midi-status'
import { deviceConnected, deviceDisconnected, devicesUpdated, deviceActive, setBlacklistedDevices } from 'reducers/midi-devices'
import { midiMessageReceived } from 'reducers/midi-values'
import { addMapping } from 'reducers/midi-mappings'
import { updateLastMidiMessage } from 'reducers/last-midi-message'

// define what parts of store will be saved to localStorage
const createPersistentStore = compose(persistState([
	'selectedMidiDevices',
	'midiMappings',
]))(createStore);

// create store
const store = createPersistentStore(reducer);

// I have ipMIDI installed and I don't need it to be listed
const blacklistedDevices = ['-1157686251'];

// request midi access
Midi.requestAccess(
	midiAccessObject => {
		// add midi listeners to adjust store
		Midi.addStateListener(handleMidiStateChange);
		Midi.addGlobalMidiListener(handleMidiMessage);

		// set init state for store
		store.dispatch(midiEnabled());
		setBlacklistedDevices(blacklistedDevices);
		store.dispatch(devicesUpdated([
			...Midi.getMidiInputDevices(),
			...Midi.getMidiOutputDevices()
		]));
	},
	error => {
		store.dispatch(midiDisabled());
	}
);

// function called on midi state change, typically on device [dis]connect
function handleMidiStateChange(event) {
	if(event.constructor.name == 'MIDIConnectionEvent') {
		const device = event.port;
		store.dispatch(
			device.state == 'connected' ? deviceConnected(device) : deviceDisconnected(device)
		);
	}
}

// functioned called on midi message for any device, channel etc.
function handleMidiMessage(device, message) {
	// keep midi stats up to date
	store.dispatch(deviceActive(device, store));
	store.dispatch(updateLastMidiMessage(device, message));

	// first check if we're currently mapping
	const state = store.getState();
	const { mapping, currentMappingAlias } = state.midiStatus;
	if(mapping) {
		// is an element primed for mapping?
		if(currentMappingAlias !== null) {
			const obj = getMidiMessageObject(message);
			const mapping = {
				deviceId: state.lastMidiMessage.deviceId || null,
				channel: obj.channel,
				key: obj.key,
			};
			store.dispatch(addMapping(mapping, currentMappingAlias));
			store.dispatch(clearCurrentMappingAlias());
		}
	}else{
		// otherwise dispatch midi message as usual
		store.dispatch(midiMessageReceived(device, message, store));
	}
}

// wrap app instance with redux store and yer away m8
ReactDOM.render(
	<Provider store={store}>
		<App />
	</Provider>,
	document.getElementById('app')
);