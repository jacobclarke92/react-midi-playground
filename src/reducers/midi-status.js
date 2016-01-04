
// action types
const MIDI_ENABLED = 'MIDI_ENABLED'
const MIDI_DISABLED = 'MIDI_DISABLED'

// initial state
const initialState = { enabled: false }

// reducer
export default function midi(state = initialState, action = {}) {
	switch (action.type) {
		case MIDI_ENABLED: 
			return { ...state, enabled: true }
		case MIDI_DISABLED:
			return { ...state, enabled: false }
		default:
			return state
	}
}

// actions
export const midiEnabled = () => ({ type: MIDI_ENABLED });
export const midiDisabled = () => ({ type: MIDI_DISABLED });