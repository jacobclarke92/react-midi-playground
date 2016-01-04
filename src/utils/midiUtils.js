import React from 'react'
import { musicNotes } from 'constants/general'
import { NOTE_ON, NOTE_OFF, CC_CHANGE, AFTERTOUCH_CHANGE, PITCHBEND_CHANGE } from 'constants/midi-commands'

export function getMidiMessageObject(message = []) {
	return {
		command: 	message[0] >> 4,
		channel: 	message[0] & 0xf,
		type:		message[0] & 0xf0,
		key: 		message[1],
		octave:		Math.floor(message[1]/12),
		note:		musicNotes[message[1]%12],
		velocity:	message[2],
	}
}

export function getCommandString(messageObject) {
	switch(messageObject.command) {
		case NOTE_ON: return messageObject.velocity === 0 ? '🔇' : '🔈'; break;
		case NOTE_OFF: return '🔇'; break;
		case CC_CHANGE: return (<span><span style={{fontSize: '28px'}}>⫯</span> cc</span>); break;
		case AFTERTOUCH_CHANGE: return (<span><span style={{fontSize: '28px'}}>⫰</span> aftertouch</span>); break;
		case PITCHBEND_CHANGE: return (<span><span style={{fontSize: '28px'}}>⫮</span> pitchbend</span>); break;
		default: return null;
	}
}

export function getLastMessageString(lastMidiMessage) {
	if(!lastMidiMessage || !Object.keys(lastMidiMessage).length) return null;
	return (
		<span>
			{getCommandString(lastMidiMessage)} <b>{lastMidiMessage.note}</b> 
			&nbsp;({'velocity: '+lastMidiMessage.velocity}, channel: {lastMidiMessage.channel + 1}, key: {lastMidiMessage.key})
		</span>
	);
}