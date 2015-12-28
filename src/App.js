import React, { Component } from 'react'
import autobind from 'autobind-decorator'
import keyCode from 'keycode'
import _ from 'lodash'

import * as Midi from 'api/Midi'
import { getMidiMessageObject, getCommandString } from 'util/midiUtils'


export default class App extends Component {

	constructor(props) {
		super(props);
		this.ctrlKeyPressed = false;
		this.deviceDataTimeouts = [];

		this.updateDevices = _.debounce(this.updateDevices, 250);
		this.state = {
			devices: [],
			activeDevices: [],
			devicesReceivingData: [],
			lastMidiMessage: null,
		};
	}

	componentWillMount() {
		Midi.requestAccess(midiAccessObject => {
			Midi.addStateListener(this.handleMidiStateChange);
			this.updateDevices();
		});
		document.addEventListener('keydown', this.handleKeyDown);
		document.addEventListener('keyup', this.handleKeyUp);
	}

	componentWillUnmount() {
		document.removeEventListener('keydown', this.handleKeyDown);
		document.removeEventListener('keyup', this.handleKeyUp);
	}

	@autobind
	handleKeyDown(e) {
		switch(keyCode(e)) {
			case 'command': this.ctrlKeyPressed = true; break;
		}
	}

	@autobind
	handleKeyUp(e) {
		switch(keyCode(e)) {
			case 'command': this.ctrlKeyPressed = false; break;
		}
	}

	@autobind
	handleMidiStateChange(event) {
		if(event.constructor.name == 'MIDIConnectionEvent') this.updateDevices();
	}

	@autobind
	handleMidiMessage(device, message) {
		let { devicesReceivingData } = this.state;
		this.setState({lastMidiMessage: message});
		if(!_.contains(devicesReceivingData, device)) {
			devicesReceivingData = [...devicesReceivingData, device];
			this.setState({devicesReceivingData});
		}
		if(this.deviceDataTimeouts[device.id]) clearTimeout(this.deviceDataTimeouts[device.id]);
		this.deviceDataTimeouts[device.id] = setTimeout(() => {
			devicesReceivingData = devicesReceivingData.filter(_device => !_.isEqual(_device, device));
			this.setState({devicesReceivingData})
		}, 50);
	}

	@autobind
	updateDevices() {
		const devices = Midi.getMidiInputDevices();
		const deviceNames = devices.map(device => device.name);
		console.log('Current input devices: ', deviceNames);
		this.setState({devices});
		
		for(let device of devices) {
			device.onmidimessage = event => this.handleMidiMessage(device, event.data);
		}
	}

	@autobind
	handleDeviceClick(device) {
		let { activeDevices } = this.state;
		const isActive = _.contains(activeDevices, device);
		if(this.ctrlKeyPressed) {
			activeDevices = !isActive ? [...activeDevices, device] : activeDevices.filter(activeDevice => !_.isEqual(activeDevice, device));
		}else{
			activeDevices = [device];
		}

		this.setState({activeDevices});
	}

	getLastMessageString() {
		const { lastMidiMessage } = this.state;
		if(!lastMidiMessage) return null;
		const midiObject = getMidiMessageObject(lastMidiMessage);
		return getCommandString(midiObject.command) + ', channel: ' + midiObject.channel + ', note: ' + midiObject.note + (midiObject.velocity ? ', velocity: ' + midiObject.velocity : '');
	}

	render() {
		const { devices, activeDevices, devicesReceivingData, lastMidiMessage } = this.state;

		return (
			<div>
				<h1>React MIDI Interface</h1>
				<div className="status">

				</div>
				<fieldset className="devices">
					<legend>Current MIDI input devices:</legend>
					<ul>
						{devices.map((device,i) =>
							<li key={i} className={_.contains(activeDevices, device) && 'active'} onClick={event => this.handleDeviceClick(device)}>
								{(_.contains(devicesReceivingData, device) ? '◉ ' : '◎ ') + device.name}
							</li>
						)}
					</ul>
					<p><b>Last MIDI message: </b>{this.getLastMessageString()}</p>
				</fieldset>
			</div>
		);
	}

}