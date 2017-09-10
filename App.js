import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Linking } from 'react-native';
import { ImageStore, ImageEditor } from 'react-native';
import { Image as img } from 'react-native';
import { Camera, Permissions } from 'expo';

// "I'm hard" - Jonathan

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

  get64string(image_uri, cb) {
  	var ___sadfasdf = this
  	const cropData = {
	    offset: {x:0,y:0},
	    size: {width:20, height:20},
	  };

	  const size = img.getSize(image_uri, (width, height) => {
	  	const cropData = {
	      offset:{x:0,y:0},
	      size:{width: width, height: height},
	    };
	    ImageEditor.cropImage(image_uri, cropData, (uri) => {
	      ImageStore.getBase64ForTag(uri, (stuff) => {
	      	cb(stuff);
	      }, (err) => {
              console.log(err);
             cb('asdf1');
            });
          }, (err) => {
            console.log(err);
            cb('asdf2');
          });
        }, (err) => {
          console.log(err);
          cb('asdf3');
        });
  }

  takeImage() {
    if (!this.state.takenPicture) {
      this.setState({ takenPicture: true });
      if (this.camera) {
        this.setState({ text: "Working..."})
        this.camera.takePictureAsync().then((image_uri) => {
        	this.get64string(image_uri, (image_string) => {
        		this.setState({ text: image_string.slice(0, 100) });

          fetch('https://vision.googleapis.com/v1/images:annotate?key=AIzaSyDYS0lJLIALU-kBZsJqlyjNGGhkVnmo9wM', {
            method: 'POST',
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              "requests": [
                {
                  "image": {
                    "content": image_string
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
          	this.setState({ text: JSON.stringify(response) });
          })
        	});
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