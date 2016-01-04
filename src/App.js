import React, { Component } from 'react'
import { connect } from 'react-redux'
import autobind from 'autobind-decorator'
import _ from 'lodash'

import Url from 'components/Url'
import Slider from 'components/Slider'

import * as Links from 'constants/links'
import { getLastMessageString } from 'util/midiUtils'
import { resetValues, getTotalNotesDownForDevices } from 'reducers/midi-values'
import { deviceSelected, deviceDeselected, setSelectedDevices } from 'reducers/selected-midi-devices'

// connect redux store to App with custom variables
@connect(state => {
	const devices = state.midiDevices.filter(device => device.type == 'input').sort((a,b) => a.name < b.name ? -1 : a.name > b.name ? 1 : 0);
	const selectedDevices = state.selectedMidiDevices;
	const notesDown = selectedDevices.length ? getTotalNotesDownForDevices(state, selectedDevices) : 0;
	return {
		devices,
		selectedDevices,
		notesDown,
		midiEnabled: state.midiStatus.enabled,
		lastMidiMessage: state.lastMidiMessage,
	}
})
export default class App extends Component {

	// extends class constructor to create inititial class vars
	constructor(props) {
		super(props);

		// set react state
		this.state = {
			sliderValue: 0,
		};
	}

	// temporary code for displaying how midi CC values can change elements
	componentWillUpdate(nextProps, nextState) {
		if(!_.isEqual(this.props.lastMidiMessage, nextProps.lastMidiMessage) && nextProps.lastMidiMessage.command === 11) {
			this.setState({sliderValue: nextProps.lastMidiMessage.velocity});
		}
	}

	// called by device onClick
	handleDeviceClick(deviceId) {
		let { dispatch, selectedDevices } = this.props;
		const isActive = _.contains(selectedDevices, deviceId);
		dispatch( isActive ? deviceDeselected(deviceId) : deviceSelected(deviceId) );
	}

	render() {
		const { dispatch, midiEnabled, devices, selectedDevices, notesDown, lastMidiMessage } = this.props;
		const { devicesReceivingData, sliderValue } = this.state;
		return (
			<div>
				<h1>React MIDI Interface</h1>
				<div className="status">

				</div>
				<div className="flex-container">
					<fieldset className="devices flex-1">
						<legend>Current MIDI input devices:</legend>
						<ul>
							{!midiEnabled ? (
								<p>
									MIDI is not supported natively on your browser.<br />
									Download <Url href={Links.jazzPlugin}>Jazz Plugin</Url> for all major browsers.
								</p>
							) : (!devices || !devices.length) ? (
								<p>
									No MIDI devices found.<br />
									If you have no USB MIDI interfaces try TouchOSC for <Url href={Links.touchOSC_iOS}>iOS</Url> and <Url href={Links.touchOSC_android}>Android</Url>,<br />
									coupled with the <Url href={Links.touchOSC_bridge}>TouchOSC Bridge</Url> app for <Url href={Links.touchOSCbridge_windows}>Windows</Url> and <Url href={Links.touchOSCbridge_mac}>Mac</Url>. 
								</p>
							) : devices.map((device,i) =>
								<li key={i} className={_.contains(selectedDevices, device.id) && 'active'} onClick={event => this.handleDeviceClick(device.id)}>
									{(device.active ? '◉ ' : '◎ ') + device.name}
								</li>
							)}
						</ul>
					</fieldset>

					{midiEnabled && devices && devices.length > 0 && (
						<fieldset className="flex-1 flex-grow-2">
							<legend>MIDI Stats</legend>
							<p>
								Last MIDI message: {getLastMessageString(lastMidiMessage)}<br />
								Total notes down: {notesDown}<br />
								<button onClick={event => dispatch(resetValues())}>Reset local state for all MIDI devices</button>
							</p>
						</fieldset>
					)}
					
					<fieldset className="flex-1">
						<legend>Some control panel</legend>
						<Slider value={sliderValue} onChange={sliderValue => this.setState({sliderValue})} />
					</fieldset>
				</div>
			</div>
		);
	}

}