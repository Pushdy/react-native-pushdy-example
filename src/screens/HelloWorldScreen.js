import React from 'react';
import { View, Text, TouchableOpacity, } from 'react-native';
import NavigationService from "../services/NavigationService";

export default class HelloWorldScreen extends React.Component {
  static navigationOptions = ({ navigation }) => ({
    headerTitle: "Hello World",
  });

  render() {
    const { params = {} } = this.props.navigation.state;
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <Text>Hello World Screen</Text>
        <Text>TS: {params.ts}</Text>

        <TouchableOpacity
          onPress={() => {
            NavigationService.navigate('Home', {
              foo: 'bar',
              ts: +(new Date),
            })
          }}
          style={{
            backgroundColor: '#00ccff',
            borderRadius: 6,
            padding: 10,
          }}
        >
          <View><Text style={{ color: '#333'}}>Come Home</Text></View>
        </TouchableOpacity>
      </View>
    );
  }
}