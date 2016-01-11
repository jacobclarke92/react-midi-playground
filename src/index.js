import React from 'react'
import ReactDOM from 'react-dom'
import { compose, createStore, applyMiddleware } from 'redux'
import { Provider } from 'react-redux'
import persistState from 'redux-localstorage'

// for debugging
import thunk from 'redux-thunk'
import promise from 'redux-promise'
import createLogger from 'redux-logger'
import Perf from 'react-addons-perf'

import App from 'App'
import * as Midi from 'api/Midi'
import { getMidiMessageObject } from 'utils/midiUtils'
import { fps60, fps30 } from 'constants/general'

import reducer from 'reducers'
import { midiEnabled, midiDisabled, clearCurrentMappingAlias } from 'reducers/midi-status'
import { deviceConnected, deviceDisconnected, devicesUpdated, deviceActive, setBlacklistedDevices } from 'reducers/midi-devices'
import { midiMessageReceived, midiMessagesReceived } from 'reducers/midi-values'
import { addMapping } from 'reducers/midi-mappings'
import { updateLastMidiMessage } from 'reducers/last-midi-message'
import { addParams } from 'reducers/params'

/*
// for debugging redux
window.lastUpdated = new Date().getTime();
window.lastAction = null;
const logger = createLogger({
	predicate: (getState, action) => {
		// console.log(action.type);
		window.lastUpdated = new Date().getTime();
		window.lastAction = action.type;
		return false;
	},
});
const createStoreWithMiddleware = applyMiddleware(thunk, promise, logger)(createStore);
const store = createStoreWithMiddleware(reducer);

Perf.start();
// setInterval(() => { Perf.printDOM(); Perf.stop(); Perf.start(); }, 5000);
// setInterval(() => Perf.printWasted(), 5000);
*/

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

const params = [];
params.push({group: 'border_color', alias: 'border_R', max: 255, value: 151});
params.push({group: 'border_color', alias: 'border_G', max: 255, value: 201});
params.push({group: 'border_color', alias: 'border_B', max: 255, value: 251});
params.push({group: 'BG_color', alias: 'bg_R', max: 255, value: 1});
params.push({group: 'BG_color', alias: 'bg_G', max: 255, value: 51});
params.push({group: 'BG_color', alias: 'bg_B', max: 255, value: 101});
store.dispatch(addParams(params));

// function called on midi state change, typically on device [dis]connect
function handleMidiStateChange(event) {
	if(event.constructor.name == 'MIDIConnectionEvent') {
		const device = event.port;
		store.dispatch(
			device.state == 'connected' ? deviceConnected(device) : deviceDisconnected(device)
		);
	}
}

let bulkMidiMessagesTimeout = null;
let bulkMidiMessages = [];

// functioned called on midi message for any device, channel etc.
function handleMidiMessage(device, message) {
	
	// first check if we're currently mapping
	const state = store.getState();
	const { mapping, currentMappingAlias } = state.midiStatus;
	if(mapping) {
		// is an element primed for mapping?
		if(currentMappingAlias !== null) {
			const obj = getMidiMessageObject(message);
			const deviceId = state.lastMidiMessage.deviceId || null;
			let mappingInUse = false;
			let overwritingMapping = false;
			const mappingIds = state.midiMappings.map(mm => {
				if(mm.id === currentMappingAlias) overwritingMapping = true;
				if(mm.deviceId === deviceId && mm.channel === obj.channel && mm.key === obj.key) {
					mappingInUse = true;
				}
			});
			if(!mappingInUse) {
				if(overwritingMapping) {
					console.log('Overwriting mapping');
				}
				const mapping = {
					alias: currentMappingAlias,
					deviceId,
					channel: obj.channel,
					key: obj.key,
				};
				store.dispatch(addMapping(mapping, currentMappingAlias));
				store.dispatch(clearCurrentMappingAlias());
			}else if(!overwritingMapping) {
				console.warn('That midi key is mapped to something else! TODO: prompt replace or use for both');
			}
		}
	}else{
		// otherwise dispatch midi message as usual
		if(bulkMidiMessagesTimeout) {
			bulkMidiMessages.push({message, device});
		}else{
			bulkMidiMessagesTimeout = setTimeout(() => {
				const time = new Date().getTime();
				store.dispatch(midiMessagesReceived([...bulkMidiMessages], store, state));
				// console.log('processed '+bulkMidiMessages.length+' midi messages in '+(new Date().getTime()-time)+'ms');
				bulkMidiMessages = [];
				bulkMidiMessagesTimeout = null;
			}, fps60);
		}
	}
}

// wrap app instance with redux store and yer away m8
ReactDOM.render(
	<Provider store={store}>
		<App />
	</Provider>,
	document.getElementById('app')
);