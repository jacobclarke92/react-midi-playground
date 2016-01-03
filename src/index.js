import React from 'react'
import ReactDOM from 'react-dom'
import { createStore } from 'redux'
import { Provider } from 'react-redux'

import App from 'App'
import * as Midi from 'api/Midi'
import reducer from 'reducers'
import { midiEnabled, midiDisabled } from 'reducers/midi-status'
import { deviceConnected, deviceDisconnected, devicesUpdated, deviceActive } from 'reducers/midi-devices'
import { midiMessageReceived } from 'reducers/midi-values'
import { updateLastMidiMessage } from 'reducers/last-midi-message'

const store = createStore(reducer);
// store.subscribe(() => console.log('STORE UPDATED', store.getState()));

Midi.requestAccess(
	midiAccessObject => {
		Midi.addStateListener(handleMidiStateChange);
		Midi.addGlobalMidiListener(handleMidiMessage);
		store.dispatch(midiEnabled());
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

// functioned called on midi message, regardless of device, channel etc.
function handleMidiMessage(device, message) {
	store.dispatch(deviceActive(device, store));
	store.dispatch(midiMessageReceived(device, message, store));
	store.dispatch(updateLastMidiMessage(device, message));
}

// wrap app instance with redux store and yer away m8
ReactDOM.render(
	<Provider store={store}>
		<App />
	</Provider>,
	document.getElementById('app')
);