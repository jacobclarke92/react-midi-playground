
export function getMidiMessageObject(message = []) {
	return {
		command: 	message[0] >> 4,
		channel: 	message[0] & 0xf,
		type: 		message[0] & 0xf0,
		note: 		message[1],
		velocity: 	message[2],
	}
}

export function getCommandString(commandNum) {
	switch(commandNum) {
		case 9: return 'Note on'; break;
		case 8: return 'Note off'; break;
		case 11: return 'CC change'; break;
		case 13: return 'Aftertouch change'; break;
		case 14: return 'Pitchbend change'; break;
		default: return null;
	}
}