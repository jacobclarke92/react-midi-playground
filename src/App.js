import React, { Component } from 'react'
import autobind from 'autobind-decorator'
import keycode from 'keycode'
import _ from 'lodash'

import Slider from 'rc-slider'

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
			errorMessage: null,
			sliderValue: 0,
		};
	}

	componentWillMount() {
		Midi.requestAccess(
			midiAccessObject => {
				Midi.addStateListener(this.handleMidiStateChange);
				this.updateDevices();
			},
			error => {
				this.setState({errorMessage: (
					<p>
						MIDI is not supported natively on your browser. 
						<a href="http://jazz-soft.net/download/Jazz-Plugin/">Download plugin</a>
					</p>
				)})
			}
		);
		document.addEventListener('keydown', this.handleKeyDown);
		document.addEventListener('keyup', this.handleKeyUp);
	}

	componentWillUnmount() {
		document.removeEventListener('keydown', this.handleKeyDown);
		document.removeEventListener('keyup', this.handleKeyUp);
	}

	@autobind
	handleKeyDown(e) {
		switch(keycode(e)) {
			case 'command': this.ctrlKeyPressed = true; break;
		}
	}

	@autobind
	handleKeyUp(e) {
		switch(keycode(e)) {
			case 'command': this.ctrlKeyPressed = false; break;
		}
	}

	@autobind
	handleMidiStateChange(event) {
		if(event.constructor.name == 'MIDIConnectionEvent') this.updateDevices();
	}

	// used to show midi status next to device name
	@autobind
	handleMidiMessage(device, message) {
		let { devicesReceivingData } = this.state;
		const messageObject = getMidiMessageObject(message);
		if(messageObject.command === 11) this.setState({sliderValue: messageObject.velocity});
		this.setState({lastMidiMessage: messageObject});
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

	// called after midi state change, usually implies device connected/disconnected
	@autobind
	updateDevices() {
		const devices = Midi.getMidiInputDevices();
		const deviceNames = devices.map(device => device.name);
		console.log('Current input devices: ', deviceNames);
		this.setState({devices});
		
		for(let device of devices) {
			Midi.addDeviceListener(device, message => this.handleMidiMessage(device, message));
		}
	}

	// called by device onClock
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

	// easier than doing the logic in render
	getLastMessageString() {
		const { lastMidiMessage } = this.state;
		if(!lastMidiMessage) return null;
		return (
			<span>
				{getCommandString(lastMidiMessage.command)} <b>{lastMidiMessage.note}</b> 
				&nbsp;({lastMidiMessage.velocity ? 'velocity: '+lastMidiMessage.velocity+', ' : ''}channel: {lastMidiMessage.channel}, key: {lastMidiMessage.key})
			</span>
		);
	}

	render() {
		const { devices, activeDevices, devicesReceivingData, lastMidiMessage, errorMessage } = this.state;

		return (
			<div>
				<h1>React MIDI Interface</h1>
				<div className="status">

				</div>
				<fieldset className="devices">
					<legend>Current MIDI input devices:</legend>
					<ul>
						{errorMessage ? errorMessage : devices.map((device,i) =>
							<li key={i} className={_.contains(activeDevices, device) && 'active'} onClick={event => this.handleDeviceClick(device)}>
								{(_.contains(devicesReceivingData, device) ? '◉ ' : '◎ ') + device.name}
							</li>
						)}
					</ul>
					<p><b>Last MIDI message: </b>{this.getLastMessageString()}</p>
				</fieldset>
				<br />
				<fieldset>
					<legend>Some slider</legend>
					<Slider max={127} value={this.state.sliderValue} onChange={sliderValue => this.setState({sliderValue})} />
				</fieldset>

			</div>
		);
	}

}