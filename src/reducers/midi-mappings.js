import _ from 'lodash'
import guid from 'utils/guid'
import { getMidiMessageObject } from 'utils/midiUtils'

// action types
const RESET_MAPPINGS = 'RESET_MAPPINGS'
const MAPPING_CREATED = 'MAPPING_CREATED'
const MAPPING_CHANGED = 'MAPPING_MODIFIED'
const MAPPING_DELETED = 'MAPPING_MODIFIED'

// initial state
const initialState = [];

// reducer
export default function midi(state = initialState, action = {}) {
	const mapping = action.mapping;
	const mappingIds = state.map(x => x.id);
	switch (action.type) {
		case RESET_MAPPINGS:
			return initialState;
		case MAPPING_CREATED: 
			return (mapping.id in mappingIds) ? state.map(_mapping => _mapping.id === mapping.id ? mapping : _mapping) : [...state, mapping]
		case MAPPING_CHANGED:
			return state.map(_mapping => _mapping.id === mapping.id ? mapping : _mapping)
		case MAPPING_DELETED:
			return state.filter(_mapping => _mapping.id !== mapping.id);
		default:
			return state
	}
}

// actions
export function addMapping(mapping, id = null) {
	mapping.id = id ? id : guid();
	return { type: MAPPING_CREATED, mapping };
}

export function changeMapping(mapping) {
	return { type: MAPPING_CHANGED, mapping };
}

export function deleteMapping(mapping) {
	return { type: MAPPING_DELETED };
}

export function resetMappings() {
	return { type: RESET_MAPPINGS };
}