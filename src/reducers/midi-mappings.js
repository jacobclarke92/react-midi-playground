import _ from 'lodash'
import guid from 'utils/guid'
import { getMidiMessageObject } from 'utils/midiUtils'

// action types
const RESET_MAPPINGS = 'RESET_MAPPINGS'
const MAPPING_DELETED = 'MAPPING_DELETED'
const MAPPING_CREATED = 'MAPPING_CREATED'
const MAPPING_CHANGED = 'MAPPING_MODIFIED'

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
			console.log('deleting mapping for ', action.mappingId);
			return state.filter(_mapping => _mapping.id !== action.mappingId);
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

export function deleteMapping(mappingId) {
	return { type: MAPPING_DELETED, mappingId };
}

export function resetMappings() {
	return { type: RESET_MAPPINGS };
}