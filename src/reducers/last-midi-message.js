import _ from 'lodash'
import { fps60, UPDATE_STATE } from 'constants/general'
import { getMidiMessageObject } from 'utils/midiUtils'

// action types
export const MIDI_MESSAGE_RECEIVED = 'MIDI_MESSAGE_RECEIVED'

// initial state
const initialState = {};

// reducer
export default function lastMidiMessage(state = initialState, action = {}) {
	switch (action.type) {
		case UPDATE_STATE:
			return action.lastMidiMessage || state;
		case MIDI_MESSAGE_RECEIVED:
			return {
				...action.message,
				deviceId: action.device.id,
			};
		default:
			return state;
	}
}

// actions
// this action is throttled as there's no need to update redux store more than once per render cycle
export const updateLastMidiMessage = (device, message) => {
	return {
		type: MIDI_MESSAGE_RECEIVED,
		message: getMidiMessageObject(message),
		device,
	}
}