import React, { Component } from 'react'
import { connect } from 'react-redux'
import classnames from 'classnames'
import titleCase from 'to-title-case'

import { setCurrentMappingAlias, clearCurrentMappingAlias } from 'reducers/midi-status'

@connect((state, props) => ({
	mappingEnabled: state.midiStatus.mapping,
	isMappingTarget: state.midiStatus.currentMappingAlias === props.alias,
	currentMappingAlias: state.midiStatus.currentMappingAlias,
}))
export default class Slider extends Component {

	static defaultProps = {
		min: 0,
		max: 127,
		value: 0,
		step: 1,
		onChange: null,
		mapped: false,
		alias: null,
	}

	handleChange(event) {
		this.props.onChange(event.target.value);
	}

	handleClick(event) {
		const { dispatch, alias, mappingEnabled, isMappingTarget } = this.props;
		if(mappingEnabled) {
			dispatch(isMappingTarget ? clearCurrentMappingAlias() : setCurrentMappingAlias(alias));
		}
	}

	render() {
		const { mappingEnabled, isMappingTarget, mapped, onChange, alias, ...rest } = this.props;
		return (
			<label htmlFor={alias}>
				{alias && titleCase(alias)}
				<input type="range" id={alias}
					{...rest} 
					className={classnames({'mapping': mappingEnabled, 'primed': isMappingTarget})} 
					readOnly={mappingEnabled} 
					onChange={::this.handleChange} 
					onClick={::this.handleClick} />
			</label>
		);
	}
}