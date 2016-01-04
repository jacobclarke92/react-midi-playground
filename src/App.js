import React, { Component } from 'react'
import { connect } from 'react-redux'
import autobind from 'autobind-decorator'
import classnames from 'classnames'
import _ from 'lodash'

import Url from 'components/Url'
import Slider from 'components/Slider'

import * as Links from 'constants/links'
import { SLIDER, BUTTON } from 'constants/mapping-types'
import { getLastMessageString } from 'utils/midiUtils'
import { enableMapping, disableMapping } from 'reducers/midi-status'
import { setCC, resetValues, getTotalNotesDownForDevices, getCCValuesForDevice, getCCValue } from 'reducers/midi-values'
import { deviceSelected, deviceDeselected, setSelectedDevices } from 'reducers/selected-midi-devices'

const testCCvalues = [7, 16, 17, 18, 10, 19, 80, 81, 20];

// connect redux store to App with custom variables
@connect(state => {
	const devices = state.midiDevices.filter(device => device.type == 'input').sort((a,b) => a.name < b.name ? -1 : a.name > b.name ? 1 : 0);
	const selectedDevices = state.selectedMidiDevices;
	const totalNotesDown = selectedDevices.length ? getTotalNotesDownForDevices(state, selectedDevices) : 0;
	const ccValues = selectedDevices.map(deviceId => getCCValuesForDevice(state, deviceId)).reduce((value, deviceKeys) => value.concat(deviceKeys), []);
	return {
		devices,
		selectedDevices,
		totalNotesDown,
		ccValues,
		mappings: state.midiMappings,
		midiEnabled: state.midiStatus.enabled,
		mappingEnabled: state.midiStatus.mapping,
		lastMidiMessage: state.lastMidiMessage,
		getCCValue: mapping => getCCValue(state, mapping),
	}
})
export default class App extends Component {

	handleDeviceClick(deviceId) {
		let { dispatch, selectedDevices } = this.props;
		const isActive = _.contains(selectedDevices, deviceId);
		dispatch( isActive ? deviceDeselected(deviceId) : deviceSelected(deviceId) );
	}

	setSliderValue(key, velocity) {
		const { dispatch, lastMidiMessage, selectedDevices } = this.props;
		const id = ('id' in lastMidiMessage) ? lastMidiMessage.id : selectedDevices.length ? selectedDevices[0] : null;
		dispatch(setCC({ id }, { key, velocity: parseFloat(velocity), channel: 0 }));
	}

	render() {
		const { dispatch, ccValues, midiEnabled, mappingEnabled, devices, mappings, selectedDevices, totalNotesDown, lastMidiMessage } = this.props;
		return (
			<main className={classnames({'mapping': mappingEnabled})}>
				<h1>React MIDI Interface</h1>
				<div className="status">

				</div>
				<div className="flex-container">

					{/* Midi device list */}
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

					{/* Midi stats */}
					{midiEnabled && devices && devices.length > 0 && (
						<fieldset className="flex-1 flex-grow-2">
							<legend>MIDI Stats</legend>
							<p>
								Last MIDI message: {getLastMessageString(lastMidiMessage)}<br />
								Total notes down: {totalNotesDown}<br />
								<button onClick={event => dispatch(resetValues())}>Reset local state for all MIDI devices</button>
							</p>
						</fieldset>
					)}
					
					{/* Makeshift control panel */}
					<fieldset className="flex-1">
						<legend>Some control panel <button className={mappingEnabled ? 'mapping' : 'primary'} onClick={event => dispatch(mappingEnabled ? disableMapping() : enableMapping())}>Map</button></legend>
						{mappings.map((mapping, i) => 
							mapping.type === SLIDER ? (
								<Slider key={i} value={this.props.getCCValue(mapping)} mapping={mapping} />
							) : mapping.type == BUTTON ? (
								<button />
							) : null
						)}
						<br />
						{testCCvalues.map((cc, i) => 
							<Slider key={i} alias={'slider'+i} value={ccValues[cc] || 0} onChange={sliderValue => this.setSliderValue(cc, sliderValue)} />
						)}
					</fieldset>

				</div>
			</main>
		);
	}

}