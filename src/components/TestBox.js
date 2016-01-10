import React, { Component } from 'react'
import deepEquals from 'deep-equal'

export default class TestBox extends Component {

	static defaultProps = {
		BG_color: [{alias: 'bg_R', value: 0}, {alias: 'bg_G', value: 50}, {alias: 'bg_B', value: 100}],
		border_color: [{alias: 'border_R', value: 150}, {alias: 'border_G', value: 200}, {alias: 'border_B', value: 250}],
	}

	render() {
		let { BG_color, border_color } = this.props;
		const BG = BG_color.reduce((total, current) => { total[current.alias] = current.value; return total; }, {});
		const border = border_color.reduce((total, current) => { total[current.alias] = current.value; return total; }, {});
		// console.log(BG, border);
		const style = {
			display: 'block',
			width: 200,
			height: 200,
			margin: '16px 1px 15px 2px',
			backgroundColor: 'rgb(' + BG.bg_R + ', ' + BG.bg_G + ', ' + BG.bg_B + ')',
			border: ' 10px solid rgb(' + border.border_R + ', ' + border.border_G + ', ' + border.border_B + ')',
			boxSizing: 'border-box',
		}
		return (
			<div className="flex-1" style={style}></div>
		)
	}
}