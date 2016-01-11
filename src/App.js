import React, { Component } from 'react'
import { connect } from 'react-redux'
import autobind from 'autobind-decorator'
import classnames from 'classnames'
import titleCase from 'to-title-case'
import keycode from 'keycode'
import _ from 'lodash'

import Url from 'components/Url'
import Slider from 'components/Slider'
import TestBox from 'components/TestBox'

import * as Links from 'constants/links'
import { fps60, fps30 } from 'constants/general'
import { SLIDER, BUTTON } from 'constants/mapping-types'
import { getLastMessageString } from 'utils/midiUtils'
import { updateParamValue } from 'reducers/params'
import { enableMapping, disableMapping, clearCurrentMappingAlias } from 'reducers/midi-status'
import { resetMappings, deleteMapping } from 'reducers/midi-mappings'
import { setCC, resetValues, getTotalNotesDownForDevices, getCCValuesForDevice, getCCValue } from 'reducers/midi-values'
import { deviceSelected, deviceDeselected, setSelectedDevices } from 'reducers/selected-midi-devices'

// connect redux store to App with custom variables
@connect(state => {
	const devices = state.midiDevices.filter(device => device.type == 'input').sort((a,b) => a.name < b.name ? -1 : a.name > b.name ? 1 : 0);
	const selectedDevices = state.selectedMidiDevices;
	const totalNotesDown = selectedDevices.length ? getTotalNotesDownForDevices(state, selectedDevices) : 0;
	const ccValues = selectedDevices.map(deviceId => getCCValuesForDevice(state, deviceId)).reduce((value, deviceKeys) => value.concat(deviceKeys), []);
	const paramGroups = {};
	state.params.map(param => {
		if(!paramGroups[param.group]) paramGroups[param.group] = [];
		paramGroups[param.group].push(param);
	})
	return {
		devices,
		selectedDevices,
		totalNotesDown,
		ccValues,
		paramGroups,
		midiEnabled: state.midiStatus.enabled,
		mappingEnabled: state.midiStatus.mapping,
		currentMappingAlias: state.midiStatus.currentMappingAlias,
		lastMidiMessage: state.lastMidiMessage,
		getCCValue: mapping => getCCValue(state, mapping),
	}
})
export default class App extends Component {

	constructor(props) {
		super(props);
		// questionable i know
		this.render = _.throttle(this.render, fps60);
	}

	componentWillMount() {
		window.addEventListener('keyup', this.handleKeyUp);
	}

	componentWillUnmount() {
		window.removeEventListener('keyup', this.handleKeyUp);
	}

	@autobind
	handleKeyUp(event) {
		console.log(keycode(event));
		switch(keycode(event)) {
			case 'm':
				this.toggleMapping()
			case 'backspace':
				this.handleDeleteCurrentMapping()
			case 'delete':
				this.handleDeleteCurrentMapping()
		}
	}

	handleDeviceClick(deviceId) {
		let { dispatch, selectedDevices } = this.props;
		const isActive = _.contains(selectedDevices, deviceId);
		dispatch( isActive ? deviceDeselected(deviceId) : deviceSelected(deviceId) );
	}

	toggleMapping() {
		this.props.dispatch(this.props.mappingEnabled ? disableMapping() : enableMapping());
	}

	handleDeleteCurrentMapping() {
		const { dispatch, mappingEnabled, currentMappingAlias } = this.props;
		if(!mappingEnabled || !currentMappingAlias) return;
		dispatch(deleteMapping(currentMappingAlias));
		dispatch(clearCurrentMappingAlias());
	}

	setSliderValue(key, velocity) {
		const { dispatch, lastMidiMessage, selectedDevices } = this.props;
		const id = ('id' in lastMidiMessage) ? lastMidiMessage.id : selectedDevices.length ? selectedDevices[0] : null;
		dispatch(setCC({ id }, { key, velocity: parseFloat(velocity), channel: 0 }));
	}

	render() {
		const { dispatch, ccValues, midiEnabled, mappingEnabled, devices, paramGroups, selectedDevices, totalNotesDown, lastMidiMessage } = this.props;
		const { dispatch, ccValues, midiEnabled, mappingEnabled, currentMappingAlias, devices, paramGroups, selectedDevices, totalNotesDown, lastMidiMessage } = this.props;
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
								<button onClick={event => dispatch(resetMappings())}>Reset all mappings</button>
							</p>
						</fieldset>
					)}
					
					{Object.keys(paramGroups).map((key, i) => 
						<fieldset className="flex-1" key={i}>
							<legend>{titleCase(key)} <button className={mappingEnabled ? 'mapping' : 'primary'} onClick={event => this.toggleMapping()}>Map</button></legend>
							{paramGroups[key].map((param, n) => {
								const { type, ...rest } = param;
								if(param.type === SLIDER) return (
									<Slider 
										key={n} 
										{...rest} 
										dispatch={dispatch}
										mappingEnabled={mappingEnabled}
										currentMappingAlias={currentMappingAlias}
										onChange={val => dispatch(updateParamValue(param.alias, val/param.max))} />
								);
								if(param.type === BUTTON) return (
									<button key={n} {...rest} onChange={val => console.log(val)} />
								);
								return null;
							})}
						</fieldset>
					)}

					<TestBox {...paramGroups} />

				</div>
			</main>
		);
	}

}