import _ from 'lodash'
import { Map } from 'immutable'
import { getMidiMessageObject } from 'util/midiUtils'

// action types
const NOTE_ON = 'NOTE_ON'
const NOTE_OFF = 'NOTE_OFF'
const CC_CHANGE = 'CC_CHANGE'
const AFTERTOUCH_CHANGE = 'AFTERTOUCH_CHANGE'
const PITCHBEND_CHANGE = 'PITCHBEND_CHANGE'
const UNKNOWN_COMMAND = 'UNKNOWN_COMMAND'

/*
// device structure
device = {
	pitchbend: 0-127,
	aftertouch: 0-127,
	CCs: [
		0-15: [
			0-127: 0-127
		]
	],
	keys: [
		0-15: [
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
		default:
			return state;
	}
}

// actions
let lastTime = new Date().getTime();
export function midiMessageReceived(device, _message, store) {
	const message = getMidiMessageObject(_message);
	if(new Date().getTime() - lastTime < 1000/60) {
		const lastMidiMessage = store.getState().lastMidiMessage;
		if(lastMidiMessage.deviceId && lastMidiMessage.deviceId === device.id && lastMidiMessage.key === message.key) {
			lastTime = new Date().getTime();
			return { type: UNKNOWN_COMMAND };	
		}
	}
	lastTime = new Date().getTime();
	
	switch (message.command) {
		case 9: 
			return { device, message, type: NOTE_ON }
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

export function getDeviceNotesDownTotal(globalState, deviceId) {
	const device = globalState.midiValues.get(deviceId);
	if(!device) return 0;
	return device.get('keys').reduce((notes, channel) => notes + channel.size, 0);
}
