import React, { Component } from 'react';
import './styles.css';

import { LineChart, Line } from 'recharts';

class StatsBottom extends Component {
	render() {
		const data = [
			{name: 'Page A', uv: 4000, pv: 2400, amt: 2400},
			{name: 'Page B', uv: 3000, pv: 1398, amt: 2210},
			{name: 'Page C', uv: 2000, pv: 9800, amt: 2290},
			{name: 'Page D', uv: 2780, pv: 3908, amt: 2000}
		];
		return (
			<section className="stats-bottom-wrap">
				<LineChart width={400} height={400} data={data}>
					<Line type="monotone" dataKey="uv" stroke="#8884d8" />
				</LineChart>
			</section>
		);
	}
}

export default StatsBottom;