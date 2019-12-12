import React from 'react';
import { View, Text, TouchableOpacity, } from 'react-native';
import NavigationService from "../services/NavigationService";

export default class ArticleDetailScreen extends React.Component {
  static navigationOptions = ({ navigation }) => ({
    headerTitle: "Article Detail",
  });

  render() {
    const { params = {} } = this.props.navigation.state;
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <Text>Article ID: {params.article_id}</Text>
        <Text>TS: {params.ts}</Text>
        <Text>{params.title}</Text>
        <Text style={{ marginTop: 20, marginBottom: 20 }}>{params.body}</Text>

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
            marginTop: 10,
          }}
        >
          <View><Text style={{ color: '#333'}}>Come Home</Text></View>
        </TouchableOpacity>
      </View>
    );
  }
}