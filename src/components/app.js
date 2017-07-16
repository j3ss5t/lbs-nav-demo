import { h, Component } from 'preact';
import { Router } from 'preact-router';

import {
	withGoogleMap,
	GoogleMap,
	Marker,
	Polyline
} from 'react-google-maps';

var polyline = require('@mapbox/polyline');

const GettingStartedGoogleMap = withGoogleMap(props => ( <
	GoogleMap ref = {
		props.onMapLoad
	}
	defaultZoom = {
		15
	}
	defaultCenter = {
		{
			lat: 52.371937,
			lng: 10.730174,
		}
	}
	onClick = { props.onMapClick }
	center={props.center}
	>
	{
		props.markers.map(marker => ( <
			Marker { ...marker
			}
			onRightClick = {
				() => props.onMarkerRightClick(marker)
			}
			/>
		))
	}
	<Polyline path={props.polylinePath} />
	</GoogleMap>
));

export default class App extends Component {
	/** Gets fired when the route changes.
	 *	@param {Object} event		"change" event from [preact-router](http://git.io/preact-router)
	 *	@param {string} event.url	The newly routed URL
	 */
	handleRoute = e => {
		this.currentUrl = e.url;
	};

	state = {
		markers: [{
      position: {
        lat: 52.371937,
        lng: 10.730174,
      },
      key: `Taiwan`,
      defaultAnimation: 2,
    }],
		center: {
			lat: 52.371937,
			lng: 10.730174,
		},
		polylinePath: [],
	};

	handleMapLoad = this.handleMapLoad.bind(this);
	handleMapClick = this.handleMapClick.bind(this);

	baseUrl = 'ws://127.0.0.1:3000';
	elementUrl = '/routeguidance/guides/d6ebae92-d2c1-11e6-9376-df943f51f0d8';
	guidanceWS = null;
	currentRoute = '';
	currentPath = [];
	currentPosition = '';

	handleMapLoad(map) {
		this._mapComponent = map;
		if (map) {
			console.log(map.getZoom());
		}

		this.guidanceWS = new WebSocket(this.baseUrl);

		this.guidanceWS.onmessage = ((data) => {
			let object = JSON.parse(data.data);
			if(object.type == 'data') {
				if(object.data.route) {
					if(this.currentRoute != object.data.route.id) {
						this.currentRoute = object.data.route.id;
						this.currentPath = [];

						let thisPath = polyline.decode(object.data.route.path);
						thisPath.forEach((item)=>{
							this.currentPath.push({
								lat: parseFloat(item[0]),
								lng: parseFloat(item[1]),
							});
						});

						this.setState({
							polylinePath: this.currentPath
						});
					}

					if(object.data.positioning) {
						if(this.currentPosition != object.data.positioning.name) {
							this.currentPosition = object.data.positioning.name;

							let coord = this.currentPosition.split(', ');

							if(this.state.markers.length > 0) {
								const nextMarkers = [
									{
										position: {
											lat: parseFloat(coord[0]),
											lng: parseFloat(coord[1]),
										},
										key: Date.now(), // Add a key property for: http://fb.me/react-warning-keys
									},
								];

								this.setState({
									markers: nextMarkers,
									center: {
										lat: parseFloat(coord[0]),
										lng: parseFloat(coord[1]),
									},
								});
							}
						}
					}
				}
			}
		}).bind(this);

		this.guidanceWS.onopen = () => {
			this.guidanceWS.send(JSON.stringify({
				type: 'subscribe',
				event: this.elementUrl
			}));
		};
	}

	/*
	 * This is called when you click on the map.
	 * Go and try click now.
	 */
	handleMapClick(event) {
		/*const nextMarkers = [
			...this.state.markers,
			{
				position: event.latLng,
				defaultAnimation: 2,
				key: Date.now(), // Add a key property for: http://fb.me/react-warning-keys
			},
		];
		this.setState({
			markers: nextMarkers,
		});

		if (nextMarkers.length === 3) {
			this.props.toast(
				`Right click on the marker to remove it`,
				`Also check the code!`
			);
		}*/
	}

	render() {
		return (
			<div style={{height: `100%`}}>
				<GettingStartedGoogleMap containerElement={
						<div style={{ height: `100%` }} />
					}
					mapElement={
					  <div style={{ height: `100%` }} />
					}
					onMapLoad={this.handleMapLoad}
					onMapClick={this.handleMapClick}
					markers={this.state.markers}
					center={this.state.center}
					polylinePath={this.state.polylinePath}
				/>
			</div>
		);
	}
}
