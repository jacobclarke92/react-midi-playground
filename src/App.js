import React, { Component } from 'react'
import { connect } from 'react-redux'
import autobind from 'autobind-decorator'
import keycode from 'keycode'
import _ from 'lodash'

import Slider from 'rc-slider'

import * as Midi from 'api/Midi'
import { getMidiMessageObject, getCommandString } from 'util/midiUtils'
import { getDeviceNotesDownTotal } from 'reducers/midi-values'

@connect(state => {
	const devices = state.midiDevices.filter(device => device.type == 'input');
	const notesDown = devices.length ? getDeviceNotesDownTotal(state, devices[0].id) : 0;
	return {
		devices,
		notesDown,
		midiEnabled: state.midi.enabled,
		lastMidiMessage: state.lastMidiMessage,
	}
})
export default class App extends Component {

	// extends class constructor to create inititial class vars
	constructor(props) {
		super(props);

		// variables that don't need to be stored in state
		this.ctrlKeyPressed = false;;

		// set react state
		this.state = {
			activeDevices: [],
			sliderValue: 0,
		};
	}

	// bind key events before first render
	componentWillMount() {
		document.addEventListener('keydown', this.handleKeyDown);
		document.addEventListener('keyup', this.handleKeyUp);
	}

	// unbind key events before component unmounts
	componentWillUnmount() {
		document.removeEventListener('keydown', this.handleKeyDown);
		document.removeEventListener('keyup', this.handleKeyUp);
	}

	@autobind
	handleKeyDown(e) {
		if(keycode(e) == 'command') this.ctrlKeyPressed = true;
	}

	@autobind
	handleKeyUp(e) {
		if(keycode(e) == 'command') this.ctrlKeyPressed = false;
	}

	componentWillUpdate(nextProps, nextState) {
		if(!_.isEqual(this.props.lastMidiMessage, nextProps.lastMidiMessage) && nextProps.lastMidiMessage.command === 11) {
			this.setState({sliderValue: nextProps.lastMidiMessage.velocity});
		}
	}

	// called by device onClick
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

	// easier than doing the logic in render function
	getLastMessageString() {
		const { lastMidiMessage } = this.props;
		if(!lastMidiMessage || !Object.keys(lastMidiMessage).length) return null;
		return (
			<span>
				{getCommandString(lastMidiMessage.command)} <b>{lastMidiMessage.note}</b> 
				&nbsp;({lastMidiMessage.velocity ? 'velocity: '+lastMidiMessage.velocity+', ' : ''}channel: {lastMidiMessage.channel}, key: {lastMidiMessage.key})
			</span>
		);
	}

	render() {
		const { midiEnabled, devices, notesDown } = this.props;
		const { activeDevices, devicesReceivingData, sliderValue } = this.state;
		return (
			<div>
				<h1>React MIDI Interface</h1>
				<div className="status">

				</div>
				<fieldset className="devices">
					<legend>Current MIDI input devices:</legend>
					<ul>
						{!midiEnabled ? (
							<p>
								MIDI is not supported natively on your browser. 
								<a href="http://jazz-soft.net/download/Jazz-Plugin/">Download plugin</a>
							</p>
						) : !devices ? (
							<p>
								No MIDI devices.
							</p>
						) : devices.map((device,i) =>
							<li key={i} className={_.contains(activeDevices, device) && 'active'} onClick={event => this.handleDeviceClick(device)}>
								{(device.active ? '◉ ' : '◎ ') + device.name}
							</li>
						)}
					</ul>
					<p><b>Last MIDI message: </b>{this.getLastMessageString()}</p>
					<p>Notes down: {notesDown}</p>
				</fieldset>
				<br />
				<fieldset>
					<legend>Some slider</legend>
					<Slider max={127} value={sliderValue} onChange={sliderValue => this.setState({sliderValue})} />
				</fieldset>

			</div>
		);
	}

}