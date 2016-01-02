import { getMidiMessageObject } from 'util/midiUtils'

const MIDI_MESSAGE_RECEIVED = 'MIDI_MESSAGE_RECEIVED'

const initialState = {};

export default function lastMidiMessage(state = initialState, action = {}) {
	switch (action.type) {
		case MIDI_MESSAGE_RECEIVED:
			return action.message;
		default:
			return state;
	}
}

export function updateLastMidiMessage(device, message) {
	return {
		type: MIDI_MESSAGE_RECEIVED,
		message: getMidiMessageObject(message),
	}
}