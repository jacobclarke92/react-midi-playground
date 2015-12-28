import React, { Component } from 'react'
import autobind from 'autobind-decorator'

import * as Midi from 'api/Midi'

export default class App extends Component {

	@autobind
	handleMidiAccess(midiAccessObject) {

		const devices = Midi.getMidiInputDevices();
		const deviceNames = devices.map(device => device.name);
		console.log(deviceNames);
		midiAccessObject.onstatechange = event => {
			const eventType = event.constructor.name;
			if(eventType == 'MIDIConnectionEvent') {
				const port = event.port;
				const status = port.state == 'connected' ? '🔵' : '🔴';
				console.log(status+' '+port.type+' '+port.state+': '+port.name);
			}
		}
	}

	componentDidMount() {
		Midi.requestAccess(this.handleMidiAccess);
	}

	render() {
		return (<h1>HI</h1>);
	}

}