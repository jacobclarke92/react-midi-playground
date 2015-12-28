import React, { Component } from 'react'
import autobind from 'autobind-decorator'
import keyCode from 'keycode'
import _ from 'lodash'

import * as Midi from 'api/Midi'

export default class App extends Component {

	constructor(props) {
		super(props);
		this.ctrlKeyPressed = false;
		this.updateDevices = _.debounce(this.updateDevices, 250);
		this.state = {
			devices: [],
			activeDevices: [],
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
			case 'ctrl': this.ctrlKeyPressed = true; break;
			case 'command': this.ctrlKeyPressed = true; break;
		}
	}

	@autobind
	handleKeyUp(e) {
		switch(keyCode(e)) {
			case 'ctrl': this.ctrlKeyPressed = false; break;
			case 'command': this.ctrlKeyPressed = false; break;
		}
	}

	@autobind
	handleMidiStateChange(event) {
		if(event.constructor.name == 'MIDIConnectionEvent') this.updateDevices();
	}

	@autobind
	updateDevices() {
		const devices = Midi.getMidiInputDevices();
		const deviceNames = devices.map(device => device.name);
		console.log('Current input devices: ', deviceNames);
		this.setState({devices});
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

	render() {
		const { devices, activeDevices } = this.state;
		return (
			<div>
				<h1>React MIDI Interface</h1>
				<p>Current MIDI input devices:</p>
				<ul className="devices">
					{devices.map((device,i) =>
						<li key={i} className={_.contains(activeDevices, device) && 'active'} onClick={event => this.handleDeviceClick(device)}>{device.name}</li>
					)}
				</ul>
			</div>
		);
	}

}