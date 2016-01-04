import _ from 'lodash'
import { renderCycleMS } from 'constants/general'

// action types
const DEVICE_CONNECTED = 'DEVICE_CONNECTED'
const DEVICE_DISCONNECTED = 'DEVICE_DISCONNECTED'
const DEVICES_UPDATED = 'DEVICES_UPDATED'
const DEVICE_ACTIVE = 'DEVICE_ACTIVE'
const DEVICE_INACTIVE = 'DEVICE_INACTIVE'

// constants
const deviceActiveStatusTimeoutMS = 50;

// initial state
const initialState = [];
let blacklistedDevices = [];

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
		type: _.contains(blacklistedDevices, device.id) ? null : DEVICE_CONNECTED,
		device,
	}
}

export function deviceDisconnected(device) {
	return {
		type: _.contains(blacklistedDevices, device.id) ? null : DEVICE_DISCONNECTED,
		device,
	}
}

export function devicesUpdated(_devices) {
	const devices = _.clone(_devices).filter(device => !_.contains(blacklistedDevices, device.id));
	return {
		type: DEVICES_UPDATED,
		devices,
	}
}

export function setBlacklistedDevices(deviceIds) {
	blacklistedDevices = deviceIds;
}

// this action is throttled as there's no need to update redux store more than once per render cycle
const deviceActiveTimeouts = [];
export const deviceActive = _.throttle((device, store) => {
	
	if(deviceActiveTimeouts[device.id]) clearTimeout(deviceActiveTimeouts[device.id]);

	deviceActiveTimeouts[device.id] = setTimeout(() => {
		store.dispatch({
			type: DEVICE_INACTIVE,
			device,
		});
	}, deviceActiveStatusTimeoutMS);

	return {
		type: DEVICE_ACTIVE,
		device,
	}
}, renderCycleMS);