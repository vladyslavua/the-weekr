import React, { Component } from 'react';
import './styles.css';

import indexedDB from '../../indexedDB';
import app from 'firebase/app';
import { notification } from 'antd';

import { LineChart, Line, XAxis, CartesianGrid, ResponsiveContainer, YAxis } from 'recharts';

class StatsBottom extends Component {
	constructor(props) {
		super(props);
		this.state = {data: [], currentYear: null};
		// this.getItemForSpecificDay = this.getItemForSpecificDay.bind(this);
	}
	componentDidMount() {
		this.setState({currentYear: new Date().getFullYear()});
		this.getItems();
	}
	getItems() {
		if (this.props.authorised) {
			let days = app.database().ref('users/' + this.props.authorised + '/days');
			days.on('value', function(snapshot) {
				let data = snapshot.val();
				if (!data) {
					return false;
				}
				let items = Object.entries(data).map(([key, value]) => {
					let res = value;
					if (res.id === undefined) {
						res.id = key;
					}
					return res;
				});
				this.structureData(items);
			}.bind(this));
		} else {
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
	}
	structureData(items) {
		let data = [];
		for (let i = 0; i < 52; i++) {
			data.push({week: i + 1, done: 0, active: 0});
		}
		for (let i = 0; i < items.length; i++) {
			const firstJan = new Date((new Date()).getFullYear(), 0, 0);
			var taskDate = new Date(firstJan.setDate(firstJan.getDate() + items[i].day));
			if (taskDate.getFullYear() === new Date().getFullYear()) {
				const week = this.getWeekNumber(taskDate);
				let doneNum = data[week].done;
				let activeNum = data[week].active + 1;
				if (items[i].done) {
					doneNum++;
				}
				data[week] = {
					week: week,
					done: doneNum,
					active: activeNum
				};
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
		//num of elements to show
		const NUMBER_OF_ELEMENTS = 10;
		if (finalData.length > NUMBER_OF_ELEMENTS) {
			var firstEl = finalData.length - NUMBER_OF_ELEMENTS;
			var lastEl = finalData.length;
			finalData = finalData.slice(firstEl, lastEl)
		}
		this.setState({data: finalData}, () => {
			// console.log(this.state.data);
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
				<div className="stats-bottom__info">This chart shows task completion rate for last 10 active weeks in year {this.state.currentYear}</div>
			</section>
		);
	}
}

export default StatsBottom;