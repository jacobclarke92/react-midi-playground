
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
		case 9: return messageObject.velocity === 0 ? 'Note off' : 'Note on'; break;
		case 8: return 'Note off'; break;
		case 11: return 'CC change'; break;
		case 13: return 'Aftertouch change'; break;
		case 14: return 'Pitchbend change'; break;
		default: return null;
	}
}