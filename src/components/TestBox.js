import React, { Component } from 'react'
import deepEquals from 'deep-equal'

export default class TestBox extends Component {

	static defaultProps = {
		BG_color: [{alias: 'bg_R', value: 0}, {alias: 'bg_G', value: 50}, {alias: 'bg_B', value: 100}],
		border_color: [{alias: 'border_R', value: 150}, {alias: 'border_G', value: 200}, {alias: 'border_B', value: 250}],
	};
	
	shouldComponentUpdate(nextProps, nextState) {
		const { BG_color, border_color } = this.props;
		return (!deepEquals(BG_color, nextProps.BG_color) || !deepEquals(border_color, nextProps.border_color));
	}

	render() {
		let { BG_color, border_color } = this.props;
		const BG = BG_color.reduce((total, current) => { total[current.alias] = current.value; return total; }, {});
		const border = border_color.reduce((total, current) => { total[current.alias] = current.value; return total; }, {});
		const style = {
			backgroundColor: 'rgb(' + BG.bg_R + ', ' + BG.bg_G + ', ' + BG.bg_B + ')',
			border: '10px solid rgb(' + border.border_R + ', ' + border.border_G + ', ' + border.border_B + ')',
		}
		return (
			<div className="test-box flex-1" style={style}></div>
		)
	}
}