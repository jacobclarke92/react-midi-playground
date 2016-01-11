import _ from 'lodash'
import { Map } from 'immutable'
import { UPDATE_STATE, fps60, deviceActiveStatusTimeoutMS } from 'constants/general'
import { getMidiMessageObject } from 'utils/midiUtils'
import { NOTE_ON, NOTE_OFF, CC_CHANGE, AFTERTOUCH_CHANGE, PITCHBEND_CHANGE } from 'constants/midi-commands'
import paramsReducer, { updateParamValue } from 'reducers/params'
import midiDevicesReducer, { deviceActive, DEVICE_ACTIVE, DEVICES_INACTIVE } from 'reducers/midi-devices'
import lastMidiMessageReducer, { updateLastMidiMessage, MIDI_MESSAGE_RECEIVED } from 'reducers/last-midi-message'

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
		case UPDATE_STATE: 
			return action.midiValues || state;
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

let inactiveIdsTimeout = null;
let pendingInactiveDeviceIds = [];
export function midiMessagesReceived(messages, store, state) {
	let { midiValues, params, midiMappings, midiDevices, lastMidiMessage } = state;
	// const deviceIds = [];
	for(let i=0; i < messages.length; i ++) {
		
		const _message = messages[i];
		const message = getMidiMessageObject(_message.message);
		const device = _message.device;
		
		// update midi values
		switch (message.command) {
			case 9: 
				midiValues = values(midiValues, { device, message, type: message.velocity === 0 ? NOTE_OFF : NOTE_ON });
			case 8: 
				midiValues = values(midiValues, { device, message, type: NOTE_OFF });
			case 11: 
				midiValues = values(midiValues, { device, message, type: CC_CHANGE });
			case 13: 
				midiValues = values(midiValues, { device, message, type: AFTERTOUCH_CHANGE });
			case 14: 
				midiValues = values(midiValues, { device, message, type: PITCHBEND_CHANGE });
		}

		// update param values if mapping exists
		midiMappings.map(mapping => {
			if(mapping.deviceId === device.id && mapping.channel === message.channel && mapping.key === message.key) {
				params = paramsReducer(params, updateParamValue(mapping.alias, message.velocity/127));
			}
		});

		// update lastMidiMessage
		if(i === messages.length-1) {
			lastMidiMessage = lastMidiMessageReducer(lastMidiMessage, {type: MIDI_MESSAGE_RECEIVED, device, message});
		}

		// update device active state
		midiDevices = midiDevicesReducer(midiDevices, {type: DEVICE_ACTIVE, device});
		if(pendingInactiveDeviceIds.indexOf(device.id) < 0) pendingInactiveDeviceIds.push(device.id);
	}

	if(inactiveIdsTimeout) clearTimeout(inactiveIdsTimeout);
	inactiveIdsTimeout = setTimeout(() => {
		store.dispatch({type: DEVICES_INACTIVE, deviceIds: pendingInactiveDeviceIds});
		inactiveIdsTimeout = null;
		pendingInactiveDeviceIds = [];
	}, deviceActiveStatusTimeoutMS);

	return {
		type: UPDATE_STATE,
		params,
		midiValues,
		midiDevices,
		lastMidiMessage,
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

export function getCCValue(globalState, mapping) {
	const value = globalState.midiValues.getIn([mapping.deviceId, mapping.channel, mapping.key]);
	return value || 0;
}