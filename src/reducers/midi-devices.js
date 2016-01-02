import _ from 'lodash'

// action types
const DEVICE_CONNECTED = 'DEVICE_CONNECTED'
const DEVICE_DISCONNECTED = 'DEVICE_DISCONNECTED'
const DEVICES_UPDATED = 'DEVICES_UPDATED'

// initial state
const initialState = [];

// reducer
export default function devices(state = initialState, action = {}) {
	switch (action.type) {
		case DEVICE_CONNECTED: 
			return [...state, action.device]
		case DEVICE_DISCONNECTED:
			return state.filter(device => !_.isEqual(device, action.device))
		case DEVICES_UPDATED:
			return action.devices
		default:
			return state
	}
}

// actions
export function deviceConnected(device) {
	return {
		type: DEVICE_CONNECTED,
		device,
	}
}

export function deviceDisconnected(device) {
	return {
		type: DEVICE_DISCONNECTED,
		device,
	}
}

export function devicesUpdated(devices) {
	return {
		type: DEVICES_UPDATED,
		devices,
	}
}