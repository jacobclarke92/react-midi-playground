import _ from 'lodash'
import { UPDATE_STATE, fps60, fps30, deviceActiveStatusTimeoutMS } from 'constants/general'

// action types
export const DEVICE_ACTIVE = 'DEVICE_ACTIVE'
export const DEVICE_INACTIVE = 'DEVICE_INACTIVE'
export const DEVICES_INACTIVE = 'DEVICES_INACTIVE'
const DEVICE_CONNECTED = 'DEVICE_CONNECTED'
const DEVICE_DISCONNECTED = 'DEVICE_DISCONNECTED'
const DEVICES_UPDATED = 'DEVICES_UPDATED'
const BLACKLISTED_DEVICE_CONNECTED = 'BLACKLISTED_DEVICE_CONNECTED'
const BLACKLISTED_DEVICE_DISCONNECTED = 'BLACKLISTED_DEVICE_DISCONNECTED'

// initial state
const initialState = [];
let blacklistedDevices = [];

// reducer
export default function devices(state = initialState, action = {}) {
	switch (action.type) {
		case UPDATE_STATE:
			return action.midiDevices || state;
		case DEVICE_CONNECTED: 
			return [...state, action.device]
		case DEVICE_DISCONNECTED:
			return state.filter(device => !_.isEqual(device, action.device))
		case DEVICES_UPDATED:
			return action.devices
		case DEVICE_ACTIVE:
			return state.map(device => {
				if(device.id === action.device.id) device.active = true;
				return device;
			});
		case DEVICE_INACTIVE:
			return state.map(device => {
				if(device.id === action.device.id) device.active = false;
				return device;
			});
		case DEVICES_INACTIVE:
			return state.map(device => {
				if(action.deviceIds.indexOf(device.id) >= 0) device.active = false;
				return device;
			});
		default:
			return state
	}
}

// actions
export const deviceConnected = device => ({
	type: _.contains(blacklistedDevices, device.id) ? BLACKLISTED_DEVICE_CONNECTED : DEVICE_CONNECTED,
	device,
});

export const deviceDisconnected = device => ({
	type: _.contains(blacklistedDevices, device.id) ? BLACKLISTED_DEVICE_DISCONNECTED : DEVICE_DISCONNECTED,
	device,
});

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
export const deviceActive = /*_.throttle(*/(device, store) => {
	
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
}//, fps60);
