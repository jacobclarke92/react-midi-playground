import _ from 'lodash'
import { getMidiMessageObject } from 'util/midiUtils'

const MIDI_DEVICE_SELECTED = 'MIDI_DEVICE_SELECTED'
const MIDI_DEVICE_DESELECTED = 'MIDI_DEVICE_DESELECTED'
const SET_SELECTED_MIDI_DEVICES = 'SET_SELECTED_MIDI_DEVICES'

const initialState = [];

export default function selectedMidiDevices(state = initialState, action = {}) {
	switch (action.type) {
		case MIDI_DEVICE_SELECTED:
			return _.contains(state, action.deviceId) ? state : [...state, action.deviceId];
		case MIDI_DEVICE_DESELECTED:
			return !_.contains(state, action.deviceId) ? state : state.filter(id => id !== action.deviceId);
		case SET_SELECTED_MIDI_DEVICES:
			return action.deviceIds
		default:
			return state;
	}
}

export const deviceSelected = deviceId => ({ type: MIDI_DEVICE_SELECTED, deviceId });
export const deviceDeselected = deviceId => ({ type: MIDI_DEVICE_DESELECTED, deviceId });
export const setSelectedDevices = deviceIds => ({ type: SET_SELECTED_MIDI_DEVICES, deviceIds})