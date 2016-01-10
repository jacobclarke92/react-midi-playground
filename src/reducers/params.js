import { SLIDER, BUTTON } from 'constants/mapping-types'

// action types
const PARAM_ADDED = 'PARAM_ADDED'
const PARAMS_ADDED = 'PARAMS_ADDED'
const PARAM_VALUE_UPDATED = 'PARAM_VALUE_UPDATED'

// initial state
const initialState = []

// reducer
export default function params(state = initialState, action = {}) {
	switch (action.type) {
		case PARAM_ADDED: 
			return [ ...state, action.param ]
		case PARAMS_ADDED:
			return [ ...state, ...action.params ]
		case PARAM_VALUE_UPDATED: 
			return state.map(param => {
				if(param.alias === action.alias) param.value = Math.round(param.min + (param.max - param.min) * action.multiple);
				return param;
			})
		default:
			return state
	}
}

const defaultParam = {
	min: 0,
	max: 127,
	step: 1,
	type: SLIDER,
	value: 0,
	defaultValue: 0,
}

// actions
export const addParam = param => {
	return { type: PARAM_ADDED, param: { ...defaultParam, ...param }};
}
export const addParams = params => {
	params = params.map(param => ({ ...defaultParam, ...param }));
	return { type: PARAMS_ADDED, params };
}
export const updateParamValue = (alias, multiple) => ({ type: PARAM_VALUE_UPDATED, alias, multiple });