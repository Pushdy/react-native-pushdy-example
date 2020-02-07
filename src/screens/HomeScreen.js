import React from 'react';

import {
  SafeAreaView,
  StyleSheet,
  ScrollView,
  View,
  Text,
  StatusBar,
  TouchableOpacity,
} from 'react-native';

import {
  Header,
  LearnMoreLinks,
  Colors,
  DebugInstructions,
  ReloadInstructions,
} from 'react-native/Libraries/NewAppScreen';

import NavigationService from '../services/NavigationService'

import RNZalo from 'rn-zalo';



export default class HomeScreen extends React.Component {
  static navigationOptions = ({ navigation }) => ({
    headerTitle: "Home",
  });

  render() {
    const { params = {} } = this.props.navigation.state;

    return (
      <>
        <StatusBar barStyle="dark-content" />
        <SafeAreaView>
          <ScrollView
            contentInsetAdjustmentBehavior="automatic"
            style={styles.scrollView}>
            <Header />
            {global.HermesInternal == null ? null : (
              <View style={styles.engine}>
                <Text style={styles.footer}>Engine: Hermes</Text>
              </View>
            )}
            <View style={styles.body}>

              {/*
              ======== Jump to Hello World Page =======
              */}
              <View style={styles.sectionContainer}>
                <Text style={styles.sectionTitle}>Go to another screen</Text>
                <Text>TS: {params.ts}</Text>
                <View style={styles.sectionDescription}>
                  <TouchableOpacity
                    onPress={() => {
                      NavigationService.navigate('HelloWorld', {
                        foo: 'bar',
                        ts: +(new Date),
                      })
                    }}
                    style={styles.btn}
                  >
                    <View><Text style={{ color: '#333'}}>Go to HelloWorld Screen</Text></View>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => {
                      NavigationService.navigate('ArticleDetail', {
                        article_id: 222,
                        title: 'Example title 222',
                        body: 'Example body',
                        ts: +(new Date),
                      })
                    }}
                    style={[styles.btn, {marginTop: 20,}]}
                  >
                    <View><Text style={{ color: '#333'}}>Go to Article Detail Screen</Text></View>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => {
                      this.loginZalo()
                    }}
                    style={[styles.btn, {marginTop: 20,}]}
                  >
                    <View><Text style={{ color: '#333'}}>Login by Zalo</Text></View>
                  </TouchableOpacity>
                </View>
              </View>


              <View style={styles.sectionContainer}>
                <Text style={styles.sectionTitle}>Step One</Text>
                <Text style={styles.sectionDescription}>
                  Edit <Text style={styles.highlight}>src/screens/HomeScreen.js</Text> to change this
                  screen.
                </Text>
              </View>


              <View style={styles.sectionContainer}>
                <Text style={styles.sectionTitle}>See Your Changes</Text>
                <Text style={styles.sectionDescription}>
                  <ReloadInstructions />
                </Text>
              </View>
              <View style={styles.sectionContainer}>
                <Text style={styles.sectionTitle}>Debug</Text>
                <Text style={styles.sectionDescription}>
                  <DebugInstructions />
                </Text>
              </View>
              <View style={styles.sectionContainer}>
                <Text style={styles.sectionTitle}>Learn More</Text>
                <Text style={styles.sectionDescription}>
                  Read the docs to discover what to do next:
                </Text>
              </View>
              <LearnMoreLinks />
            </View>
          </ScrollView>
        </SafeAreaView>
      </>
    );
  }

  loginZalo = async () => {
    try {
      const data = await RNZalo.login();
      console.log('{loginZalo} data: ', data);
    } catch (e) {
      console.log('{loginZalo} e:', e);
    }
  };
}

const styles = StyleSheet.create({
  scrollView: {
    backgroundColor: Colors.lighter,
  },
  engine: {
    position: 'absolute',
    right: 0,
  },
  body: {
    backgroundColor: Colors.white,
  },
  sectionContainer: {
    marginTop: 32,
    paddingHorizontal: 24,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: Colors.black,
  },
  sectionDescription: {
    marginTop: 8,
    fontSize: 18,
    fontWeight: '400',
    color: Colors.dark,
  },
  highlight: {
    fontWeight: '700',
  },
  footer: {
    color: Colors.dark,
    fontSize: 12,
    fontWeight: '600',
    padding: 4,
    paddingRight: 12,
    textAlign: 'right',
  },
  btn: {
    backgroundColor: '#00ccff',
    borderRadius: 6,
    padding: 10,
  },
});