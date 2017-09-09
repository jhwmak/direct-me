import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Image } from 'react-native';
import { Camera, Permissions } from 'expo';

export default class App extends React.Component {

  constructor() {
    super()
    this.state = {
        hasCameraPermission: null,
        takenPicture: false,
        text: "Analyze"
    };
  }

  async componentWillMount() {
    const { status } = await Permissions.askAsync(Permissions.CAMERA);
    this.setState({ hasCameraPermission: status === 'granted' });
  }

  takeImage() {
    if (!this.state.takenPicture) {
      this.state.takenPicture = true;
      this.setState({ text: 'Analyze' });
      if (this.camera) {
        this.setState({ text: "Working..."})
        this.camera.takePictureAsync().then((image_uri) => {
          this.setState({ text: image_uri, takenPicture: false });
          fetch('https://vision.googleapis.com/v1/images:annotate?key=AIzaSyDYS0lJLIALU-kBZsJqlyjNGGhkVnmo9wM', {
            method: 'POST',
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              "requests": [
                {
                  "image": {
                    "source": {
                      "imageUri": "https://www.bluescentric.com/images/product/large/245.jpg"
                    }
                  },
                  "features": [
                    {
                      "type": "TEXT_DETECTION"
                    }
                  ]
                }
              ]
            })
          }).then((response) => {
            this.setState({ text: response })
          })
        });
      }
    }
  }



  render() {
    const { hasCameraPermission } = this.state;
    if (hasCameraPermission === null) {
      return <View />;
    } else if (hasCameraPermission === false) {
      return <Text>No access to camera</Text>;
    } else {
      return (
        <View style={{ flex: 1 }}>
          <Camera style={{ flex: 1 }} type={this.state.type} ref={ref => { this.camera = ref; }}>
            <View
              style={{
                flex: 1,
                backgroundColor: 'transparent',
                flexDirection: 'row',
              }}>
              <TouchableOpacity
                style={{
                  flex: 1,
                  alignSelf: 'flex-end',
                  alignItems: 'center',
                  marginBottom: 80,
                  backgroundColor: 'rgba(0, 0, 0, 0.5)',
                }}
                onPress={() => this.takeImage()}>
                <Text
                  style={{ fontSize: 18, marginBottom: 10, color: 'white' }}>
                  {' '}{ this.state.text }{' '}
                </Text>
              </TouchableOpacity>
            </View>
          </Camera>
        </View>
      );
    }
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
