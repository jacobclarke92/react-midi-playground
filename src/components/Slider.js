import React, { Component } from 'react'
import { connect } from 'react-redux'

@connect(state => ({ mappingEnabled: state.midiStatus.mapping }))
export default class Slider extends Component {

	static defaultProps = {
		min: 0,
		max: 127,
		value: 0,
		step: 1,
		onChange: null,
		mapped: false,
	}

	onChange(event) {
		this.props.onChange(event.target.value);
	}

	render() {
		const { mappingEnabled, mapped, onChange, ...rest } = this.props;
		return (
			<input type="range" disabled={mappingEnabled} {...rest} onInput={this.onChange.bind(this)} />
		);
	}
}