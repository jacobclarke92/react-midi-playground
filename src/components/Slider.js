import React, { Component } from 'react'

export default class Slider extends Component {

	static defaultProps = {
		min: 0,
		max: 127,
		value: 0,
		step: 1,
		onChange: null,
	}

	onChange(event) {
		this.props.onChange(event.target.value);
	}

	render() {
		return (
			<input type="range" min={this.props.min} max={this.props.max} value={this.props.value} step={this.props.step} onInput={this.onChange.bind(this)} />
		);
	}
}