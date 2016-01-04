import { combineReducers } from 'redux'

import midiStatus from 'reducers/midi-status'
import midiDevices from 'reducers/midi-devices'
import midiValues from 'reducers/midi-values'
import lastMidiMessage from 'reducers/last-midi-message'
import selectedMidiDevices from 'reducers/selected-midi-devices'

export default combineReducers({
	midiStatus,
	midiDevices,
	midiValues,
	lastMidiMessage,
	selectedMidiDevices,
})