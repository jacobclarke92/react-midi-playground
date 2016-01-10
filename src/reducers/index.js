import { combineReducers } from 'redux'

import params from 'reducers/params'
import midiStatus from 'reducers/midi-status'
import midiDevices from 'reducers/midi-devices'
import midiValues from 'reducers/midi-values'
import midiMappings from 'reducers/midi-mappings'
import lastMidiMessage from 'reducers/last-midi-message'
import selectedMidiDevices from 'reducers/selected-midi-devices'

export default combineReducers({
	params,
	midiStatus,
	midiDevices,
	midiValues,
	midiMappings,
	lastMidiMessage,
	selectedMidiDevices,
})