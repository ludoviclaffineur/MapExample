import React, { Component } from 'react';
import { AppRegistry, StyleSheet, View, Dimensions, Text, Image} from 'react-native';
import MapView, { PROVIDER_GOOGLE } from 'react-native-maps';
import { SearchBar } from 'react-native-elements'
import RetroMapStyles from './MapStyles/paper.json';
let { width, height } = Dimensions.get('window');
const ASPECT_RATIO = width / height;
const LATITUDE = 51.2139;
const LONGITUDE = 4.4184;
const LATITUDE_DELTA = 0.02922;
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
    const response = await fetch("http://35.187.78.219/around")
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
    return (
      <View
      style={ styles.container }>
      <MapView
        provider={ PROVIDER_GOOGLE }
        style={ styles.mapview }
        customMapStyle={ RetroMapStyles }
        showsUserLocation={ true }
        region={ this.state.region }
        onRegionChange={ region => this.setState({region}) }
        onRegionChangeComplete={ region => this.setState({region}) }
      >
        {this.state.markers.map(marker => (
            <MapView.Marker
              coordinate={ marker.latlng}
              title={marker.meta.name}
              description={marker.meta.carType}
              key={marker.id}
            >
            <View style={styles.circle}>
            <Image
              style={{width: "90%", height: "90%"}}
              source={{uri: marker.meta.pictureUrl}}
            />
                </View>
            </MapView.Marker>
        ))}
      </MapView>
      <SearchBar
      style= {styles.searchbar}
        onChangeText={(text) => this.setState({text})}
        noIcon={true}
        placeholder=' Type a destination here...' />
</View>
    );
  }
}
const styles = StyleSheet.create({
  container: {
    height: '100%',
    width: '100%',
  },
  mapview:{
    position:'absolute',
      height: '100%',
      width:'100%',
  },
  searchbar: {
    position: 'absolute',
    width: '80%',
    height: 40,
    top: 30,
    left: 40,
    borderWidth: 1,
    borderRadius: 2,
    borderColor: '#FFF',
    borderBottomWidth: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 2,
    elevation: 1,
    backgroundColor:'#FFF',
    padding:10
  },
  circle: {
    width: 50,
    height: 50,
    borderRadius: 50 / 2,
    backgroundColor: 'white',
    borderColor: '#6495ED',
    borderWidth: 1,
},
pinText: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
    fontSize: 20,
    marginBottom: 10,
},
});
AppRegistry.registerComponent('MapExample', () => MapExample);
