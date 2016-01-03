import React from 'react'
const notes = ['C', 'C♯', 'D', 'E♭', 'E', 'F', 'F♯', 'G', 'A♭', 'A', 'B♭', 'B'];

export function getMidiMessageObject(message = []) {
	return {
		command: 	message[0] >> 4,
		channel: 	message[0] & 0xf,
		type:		message[0] & 0xf0,
		key: 		message[1],
		octave:		Math.floor(message[1]/12),
		note:		notes[message[1]%12],
		velocity:	message[2],
	}
}

export function getCommandString(messageObject) {
	switch(messageObject.command) {
		case 9: return messageObject.velocity === 0 ? '🔇' : '🔈'; break;
		case 8: return '🔇'; break;
		case 11: return (<span><span style={{fontSize: '28px'}}>⫯</span> cc</span>); break;
		case 13: return (<span><span style={{fontSize: '28px'}}>⫰</span> aftertouch</span>); break;
		case 14: return (<span><span style={{fontSize: '28px'}}>⫮</span> pitchbend</span>); break;
		default: return null;
	}
}