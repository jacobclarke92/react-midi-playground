import _ from 'lodash'

// action types
const DEVICE_CONNECTED = 'DEVICE_CONNECTED'
const DEVICE_DISCONNECTED = 'DEVICE_DISCONNECTED'
const DEVICES_UPDATED = 'DEVICES_UPDATED'
const DEVICE_ACTIVE = 'DEVICE_ACTIVE'
const DEVICE_INACTIVE = 'DEVICE_INACTIVE'

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
		case DEVICE_ACTIVE:
			return state.filter(device => {
				if(device.id === action.device.id) device.active = true;
				return device;
			});
		case DEVICE_INACTIVE:
			return state.filter(device => {
				if(device.id === action.device.id) device.active = false;
				return device;
			});
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

const deviceActiveTimeouts = [];

export const deviceActive = _.throttle(function(device, store) {
	
	if(deviceActiveTimeouts[device.id]) clearTimeout(deviceActiveTimeouts[device.id]);

	deviceActiveTimeouts[device.id] = setTimeout(() => {
		store.dispatch({
			type: DEVICE_INACTIVE,
			device,
		});
	}, 50);

	return {
		type: DEVICE_ACTIVE,
		device,
	}
}, 1000/60);