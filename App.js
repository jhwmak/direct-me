import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Linking } from 'react-native';
import { ImageStore, ImageEditor } from 'react-native';
import { Image as img } from 'react-native';
import { Camera, Permissions } from 'expo';

// "__ ____" - Jonathan

export default class App extends React.Component {

  constructor() {
    super()
    this.state = {
        hasCameraPermission: null,
        takenPicture: false,
        text: "Analyze",
        url: null
    };
  }

  async componentWillMount() {
    const { status } = await Permissions.askAsync(Permissions.CAMERA);
    this.setState({ hasCameraPermission: status === 'granted' });
    this.setState({ url: "https://vision.googleapis.com/v1/images"})
  }

  get64string(image_uri, cb) {
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
            });
          }, (err) => {
            console.log(err);
          });
        }, (err) => {
          console.log(err);
       });
  }

  takeImage() {
    if (!this.state.takenPicture) {
      this.setState({ takenPicture: true });
      if (this.camera) {
        this.setState({ text: "Working..."})
        this.camera.takePictureAsync().then((image_uri) => {
        	this.get64string(image_uri, (image_string) => {
          fetch(this.state.url, {
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
          }).then((response) => response.json()).then((responseJSON) => {
			  var mydata = responseJSON; //store JSON data as js object
			  var re = /^(http:\/\/www\.|https:\/\/www\.|http:\/\/|https:\/\/)?[a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,5}(:[0-9]{1,5})?(\/.*)?$/;
			  var url = "";
			  for(var i = 0; i < mydata["responses"][0]["textAnnotations"].length; i++) {
		        if(re.test(mydata["responses"][0]["textAnnotations"][i]["description"])) {
				  url = mydata["responses"][0]["textAnnotations"][i]["description"];
				}
		      }
		      if (url.slice(0, 4) !== 'http') {
	          	url = 'https://' + url
	          }
	          Linking.openURL(url);
	          this.setState({takenPicture: false, text: 'Analyze'})
	        })
        });
      })
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