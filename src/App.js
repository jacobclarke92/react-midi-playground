import React, { Component } from 'react'
import { connect } from 'react-redux'
import autobind from 'autobind-decorator'
import _ from 'lodash'

import Url from 'components/Url'
import Slider from 'components/Slider'

import { getLastMessageString } from 'util/midiUtils'
import { resetValues, getTotalNotesDownForDevices } from 'reducers/midi-values'
import { deviceSelected, deviceDeselected, setSelectedDevices } from 'reducers/selected-midi-devices'

const links = {
	jazzPlugin: 'http://jazz-soft.net/download/Jazz-Plugin/',
	touchOSC_iOS: 'https://itunes.apple.com/au/app/touchosc/id288120394?mt=8',
	touchOSC_android: 'https://play.google.com/store/apps/details?id=net.hexler.touchosc_a',
	touchOSCbridge: 'http://hexler.net/software/touchosc#downloads',
	touchOSCbridge_mac: 'http://hexler.net/mint/pepper/orderedlist/downloads/download.php?file=http%3A//hexler.net/pub/touchosc/touchosc-bridge-1.3.1-osx.zip',
	touchOSCbridge_windows: 'http://hexler.net/mint/pepper/orderedlist/downloads/download.php?file=http%3A//hexler.net/pub/touchosc/touchosc-bridge-1.3.1-win32.zip',
}

// connect redux store to App with custom variables
@connect(state => {
	const devices = state.midiDevices.filter(device => device.type == 'input');
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

		// variables that don't need to be stored in state
		this.ctrlKeyPressed = false;

		// set react state
		this.state = {
			sliderValue: 0,
		};
	}

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

	handleResetDevices() {
		this.props.dispatch(resetValues());
	}

	render() {
		const { midiEnabled, devices, selectedDevices, notesDown, lastMidiMessage } = this.props;
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
									Download <Url href={links.jazzPlugin}>Jazz Plugin</Url> for all major browsers.
								</p>
							) : (!devices || !devices.length)  ? (
								<p>
									No MIDI devices found.<br />
									If you have no USB MIDI interfaces try TouchOSC for <Url href={links.touchOSC_iOS}>iOS</Url> and <Url href={links.touchOSC_android}>Android</Url>,<br />
									coupled with the <Url href={links.touchOSC_bridge}>TouchOSC Bridge</Url> app for <Url href={links.touchOSCbridge_windows}>Windows</Url> and <Url href={links.touchOSCbridge_mac}>Mac</Url>. 
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
								<button onClick={event => this.handleResetDevices()}>Reset state for all devices</button>
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