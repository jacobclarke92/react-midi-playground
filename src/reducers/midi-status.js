
// action types
const MIDI_ENABLED = 'MIDI_ENABLED'
const MIDI_DISABLED = 'MIDI_DISABLED'
const MAPPING_ENABLED = 'MAPPING_ENABLED'
const MAPPING_DISABLED = 'MAPPING_DISABLED'
const MAPPING_ALIAS_SET = 'MAPPING_ALIAS_SET'
const MAPPING_ALIAS_CLEARED = 'MAPPING_ALIAS_CLEARED'

// initial state
const initialState = {
	enabled: false,
	mapping: false,
	currentMappingAlias: null,
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
			return { ...state, mapping: false, currentMappingAlias: null }
		case MAPPING_ALIAS_SET:
			return { ...state, currentMappingAlias: action.alias }
		case MAPPING_ALIAS_CLEARED:
			return { ...state, currentMappingAlias: null }
		default:
			return state
	}
}

// actions
export const midiEnabled = () => ({ type: MIDI_ENABLED });
export const midiDisabled = () => ({ type: MIDI_DISABLED });
export const enableMapping = () => ({ type: MAPPING_ENABLED });
export const disableMapping = () => ({ type: MAPPING_DISABLED });
export const setCurrentMappingAlias = alias => ({ type: MAPPING_ALIAS_SET, alias });
export const clearCurrentMappingAlias = () => ({ type: MAPPING_ALIAS_CLEARED });