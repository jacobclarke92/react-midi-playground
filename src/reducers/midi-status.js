
// action types
const MIDI_ENABLED = 'MIDI_ENABLED'
const MIDI_DISABLED = 'MIDI_DISABLED'
const MAPPING_ENABLED = 'MAPPING_ENABLED'
const MAPPING_DISABLED = 'MAPPING_DISABLED'

// initial state
const initialState = {
	enabled: false,
	mapping: false,
}

// reducer
export default function midi(state = initialState, action = {}) {
	switch (action.type) {
		case MIDI_ENABLED: 
			return { ...state, enabled: true }
		case MIDI_DISABLED:
			return { ...state, enabled: false }
		case MAPPING_ENABLED: 
			return { ...state, mapping: true }
		case MAPPING_DISABLED:
			return { ...state, mapping: false }
		default:
			return state
	}
}

// actions
export const midiEnabled = () => ({ type: MIDI_ENABLED });
export const midiDisabled = () => ({ type: MIDI_DISABLED });
export const enableMapping = () => ({ type: MAPPING_ENABLED });
export const disableMapping = () => ({ type: MAPPING_DISABLED });