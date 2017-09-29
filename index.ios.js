import React, { Component } from 'react';
import { AppRegistry, StyleSheet, View, Dimensions } from 'react-native';
import MapView, { PROVIDER_GOOGLE } from 'react-native-maps';
// import RetroMapStyles from './MapStyles/RetroMapStyles.json';
let { width, height } = Dimensions.get('window');
const ASPECT_RATIO = width / height;
const LATITUDE = 0;
const LONGITUDE = 0;
const LATITUDE_DELTA = 0.0922;
const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;
export default class MapExample extends Component {
  constructor() {
    super();
    this.state = {
      region: {
        latitude: LATITUDE,
        longitude: LONGITUDE,
        latitudeDelta: LATITUDE_DELTA,
        longitudeDelta: LONGITUDE_DELTA,
      },
      markers:[]
    };
  }
  async fetchData() {
    const response = await fetch("http:127.0.0.1:8080/around")
    const resp = await response.json()

    var elements = resp.map(function(e) {
      return {
          id: e.leg.agencyId,
          latlng: {
              latitude: e.leg.from.lat,
              longitude: e.leg.from.lon,
          },
          meta: JSON.parse(e.meta),
      }
    });
    this.setState({
        markers: elements
    });
  }

  componentDidMount() {
    this.fetchData().done()
    navigator.geolocation.getCurrentPosition(
      position => {
        this.setState({
          region: {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            latitudeDelta: LATITUDE_DELTA,
            longitudeDelta: LONGITUDE_DELTA,
          }
        });
      },
    (error) => console.log(error.message),
    { enableHighAccuracy: true, timeout: 20000, maximumAge: 1000 },
    );
    this.watchID = navigator.geolocation.watchPosition(
      position => {
        this.setState({
          region: {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            latitudeDelta: LATITUDE_DELTA,
            longitudeDelta: LONGITUDE_DELTA,
          }
        });
      }
    );

  }
  componentWillUnmount() {
    navigator.geolocation.clearWatch(this.watchId);
  }
  render() {
    console.log(this.state.markers)
    return (
      <MapView
        provider={ PROVIDER_GOOGLE }
        style={ styles.container }
        // customMapStyle={ RetroMapStyles }
        showsUserLocation={ true }
        region={ this.state.region }
        onRegionChange={ region => this.setState({region}) }
        onRegionChangeComplete={ region => this.setState({region}) }
      >
        <MapView.Marker
          coordinate={ this.state.region }
        />
        {this.state.markers.map(marker => (
            <MapView.Marker
              coordinate={ marker.latlng}
              title={marker.meta.name}
              description={"YAPS"}
              key={marker.id}
            />
        ))}
      </MapView>
    );
  }
}
const styles = StyleSheet.create({
  container: {
    height: '100%',
    width: '100%',
  }
});
AppRegistry.registerComponent('MapExample', () => MapExample);
