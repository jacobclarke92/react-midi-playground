import React, { Component } from 'react'
import classnames from 'classnames'
import titleCase from 'to-title-case'

import { setCurrentMappingAlias, clearCurrentMappingAlias } from 'reducers/midi-status'

export default class Slider extends Component {

	static defaultProps = {
		min: 0,
		max: 127,
		value: 0,
		step: 1,
		onChange: null,
		mapped: false,
		alias: null,
	};

	handleChange(event) {
		this.props.onChange(event.target.value);
	}

	handleClick(event) {
		const { dispatch, alias, mappingEnabled, currentMappingAlias } = this.props;
		const isMappingTarget = alias === currentMappingAlias;
		if(mappingEnabled) {
			dispatch(isMappingTarget ? clearCurrentMappingAlias() : setCurrentMappingAlias(alias));
		}
	}

	render() {
		const { mappingEnabled, currentMappingAlias, mapped, onChange, alias, ...rest } = this.props;
		const isMappingTarget = alias === currentMappingAlias;
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