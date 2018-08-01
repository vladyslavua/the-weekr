import React, { Component } from 'react';
import './styles.css';

import indexedDB from '../../indexedDB';
import { notification } from 'antd';

import { LineChart, Line, XAxis, CartesianGrid, ResponsiveContainer, YAxis } from 'recharts';

class StatsBottom extends Component {
	constructor(props) {
		super(props);
		this.state = {data: []};
		// this.getItemForSpecificDay = this.getItemForSpecificDay.bind(this);
	}
	componentDidMount() {
		this.getItems();
	}
	getItems() {
		indexedDB.table('days')
			.toArray()
			.then((items) => {
				this.structureData(items);
			})
			.catch(() => {
				notification.open({
					message: 'Error',
					description: 'Something went wrong. Please refresh the browser.',
				});
			});
	}
	structureData(items) {
		let data = [];
		for (let i = 0; i < 52; i++) {
			data.push({week: i + 1, done: 0, active: 0});
		}
		for (let i = 0; i < items.length; i++) {
			const firstJan = new Date((new Date()).getFullYear(), 0, 0);
			const week = this.getWeekNumber(new Date(firstJan.setDate(firstJan.getDate() + items[i].day)));
			let doneNum = data[week].done;
			let activeNum = data[week].active + 1;
			if (items[i].done) {
				doneNum++;
			}
			data[week] = {
				week: week,
				done: doneNum,
				active: activeNum
			}
		}
		let finalData = [];
		for (let i = 0; i < data.length; i++) {
			if (data[i].active !== 0) {
				let rate = data[i].done / data[i].active;
				finalData.push({
					week: data[i].week + '',
					successRate: rate
				});
			}
		}
		this.setState({data: finalData}, () => {
			console.log(this.state.data);
		});
	}
	getWeekNumber(d) {
		d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
		d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay()||7));
		var yearStart = new Date(Date.UTC(d.getUTCFullYear(),0,1));
		var weekNo = Math.ceil(( ( (d - yearStart) / 86400000) + 1)/7);
		return weekNo;
	}
	render() {
		return (
			<section className="stats-bottom__wrap">
				<ResponsiveContainer width='100%'>
					<LineChart height={180} data={this.state.data}>
						<CartesianGrid strokeDasharray="3 3" />
						<XAxis dataKey="week" stroke="#9e9e9e">
						</XAxis>
						<YAxis stroke="#9e9e9e" />
						<Line type="linear" isAnimationActive={false} dataKey="successRate" stroke="#ff8d57" />
					</LineChart>
				</ResponsiveContainer>
				<div className="stats-bottom__x-axis-legend">Weeks</div>
				<div className="stats-bottom__y-axis-legend">Completion Rate</div>
			</section>
		);
	}
}

export default StatsBottom;