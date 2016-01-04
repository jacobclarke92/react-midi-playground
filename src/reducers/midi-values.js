import _ from 'lodash'
import { Map } from 'immutable'
import { getMidiMessageObject } from 'util/midiUtils'
import { NOTE_ON, NOTE_OFF, CC_CHANGE, AFTERTOUCH_CHANGE, PITCHBEND_CHANGE } from 'constants/midi-commands'

// other action types
const UNKNOWN_COMMAND = 'UNKNOWN_COMMAND'
const RESET_VALUES = 'RESET_VALUES'

/* structure of device object /*
{
	pitchbend: 0-127,
	aftertouch: 0-127,
	CCs: [
		// channel number
		0-15: [
			// cc value
			0-127: 0-127
		]
	],
	keys: [
		// channel number
		0-15: [
			// note velocity
			0-127: 0-127
		]
	],	
}
*/

// initial state
const initialState = new Map();

// reducer
export default function values(state = initialState, action = {}) {
	const message = action.message;
	switch (action.type) {
		case NOTE_ON:
			return state.setIn([action.device.id, 'keys', message.channel, message.key], message.velocity);
		case NOTE_OFF:
			return state.deleteIn([action.device.id, 'keys', message.channel, message.key]);
		case CC_CHANGE:
			return state.setIn([action.device.id, 'CCs', message.channel, message.key], message.velocity);
		case AFTERTOUCH_CHANGE:
			return state.setIn([action.device.id, 'aftertouch'], message.velocity);
		case PITCHBEND_CHANGE:
			return state.setIn([action.device.id, 'pitchbend'], message.velocity);
		case RESET_VALUES:
			return initialState;
		default:
			return state;
	}
}

// actions
export const resetValues = () => ({ type: RESET_VALUES });

export const setCC = (device, message) => ({ type: CC_CHANGE, device, message });

let lastTime = null
const currentTime = () => new Date().getTime();
const updateLastTime = () => { lastTime = currentTime() };
updateLastTime();

export function midiMessageReceived(device, _message, store) {

	// to prevent excess updates to redux store we filter out messages received from same key (cc or note)
	// throttling the function won't work because we don't want to ignore midi messages from different sources
	// therefore this will have to be optimized as it still chokes when two cc values are moved simultaneously
	const message = getMidiMessageObject(_message);
	if(currentTime() - lastTime < 1000/60) {
		const lastMidiMessage = store.getState().lastMidiMessage;
		if(lastMidiMessage.deviceId && lastMidiMessage.deviceId === device.id && lastMidiMessage.key === message.key) {
			updateLastTime()
			return { type: UNKNOWN_COMMAND };	
		}
	}
	updateLastTime();
	
	switch (message.command) {
		case 9: 
			return { device, message, type: message.velocity === 0 ? NOTE_OFF : NOTE_ON }
		case 8: 
			return { device, message, type: NOTE_OFF }
		case 11: 
			return { device, message, type: CC_CHANGE }
		case 13: 
			return { device, message, type: AFTERTOUCH_CHANGE }
		case 14: 
			return { device, message, type: PITCHBEND_CHANGE }
		default: 
			return { type: UNKNOWN_COMMAND }
	}
}

// queries
export function isNoteDown(globalState, deviceId, channel, key) {
	const value = globalState.midiValues.getIn([devideId, 'keys', channel, key]);
	return (value === 0) ? false : true;
}

export function getTotalNotesDownForDevice(globalState, deviceId) {
	const deviceChannels = globalState.midiValues.getIn([deviceId, 'keys']) || [];
	return deviceChannels.reduce((notes, channel) => notes + channel.size, 0);
}

export function getTotalNotesDownForDevices(globalState, deviceIds) {
	let keys = 0;
	for(let deviceId of deviceIds) {
		const deviceChannels = globalState.midiValues.getIn([deviceId, 'keys']) || [];
		deviceChannels.map(deviceChannel => {
			keys += deviceChannel.keySeq().size;
		});
	}
	return keys;
}

export function getCCValuesForDevice(globalState, deviceId) {
	const values = [];
	const deviceChannels = globalState.midiValues.getIn([deviceId, 'CCs']) || new Map();
	deviceChannels.map(deviceChannel => {
		deviceChannel.keySeq().toArray().map(key => {
			values[key] = deviceChannel.get(key);
		})
	});
	return values;
}