import { combineReducers } from 'redux'
import midi from 'reducers/midi'
import midiDevices from 'reducers/midi-devices'
import midiValues from 'reducers/midi-values'
import lastMidiMessage from 'reducers/last-midi-message'

export default combineReducers({
	midi,
	midiDevices,
	midiValues,
	lastMidiMessage,
})