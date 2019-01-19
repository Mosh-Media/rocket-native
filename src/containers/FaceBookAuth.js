import React, { Component } from "react";
import {
  Text,
  TouchableOpacity,
  ScrollView,
  View,
  StyleSheet
} from "react-native";
import { Facebook, Constants } from "expo";
import facebook from "../constants/facebook";
import { Firebase } from "../lib/firebase";
export default class PhoneAuth extends Component {
  state = {
    responseJSON: null
  };
  callGraph = async token => {
    /// Look at the fields... I don't have an `about` on my profile but everything else should get returned.
    const response = await fetch(
      `https://graph.facebook.com/me?access_token=${token}&fields=id,name,email,about,picture`
    );
    const responseJSON = JSON.stringify(await response.json());
    this.setState({ responseJSON });
  };

  login = async () => {
    const { type, token } = await Facebook.logInWithReadPermissionsAsync(
      facebook.appId,
      { behavior: "native", public_profile: "email" }
    );
    if (type === "success") {
      await this.callGraph(token);
      const credential = await Firebase.auth.FacebookAuthProvider.credential(token)
      this.firebaseLogin(credential)
      
    }
  };

  // Sign in with credential from the Facebook user.
  firebaseLogin =  (credential) => {
     Firebase.auth()
      .signInAndRetrieveDataWithCredential(credential)
      .catch(error => {
        // Handle Errors here.
        console.warn("Login Error ⚠️ ", error);
      });
  };
  /**
   * Register a subscription callback for changes of the currently authenticated user
   * 
   * @param callback Called with the current authenticated user as first argument
   */
 static subscribeAuthChange(callback) {
    Firebase.auth().onAuthStateChanged(callback);
  }
  renderButton = () => (
    <TouchableOpacity onPress={() => this.login()}>
      <View
        style={{
          width: "50%",
          alignSelf: "center",
          borderRadius: 4,
          padding: 24,
          backgroundColor: "#3B5998"
        }}
      >
        <Text style={{ color: "white", fontWeight: "bold" }}>
          Login with Facebook
        </Text>
      </View>
    </TouchableOpacity>
  );
  renderValue = value => (
    <Text key={value} style={styles.paragraph}>
      {value}
    </Text>
  );
  render() {
    return (
      <ScrollView>
        {this.state.responseJSON &&
          this.renderValue("User data : " + this.state.responseJSON)}

        {this.renderButton()}
      </ScrollView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    paddingTop: Constants.statusBarHeight,
    backgroundColor: "#ecf0f1"
  },
  paragraph: {
    margin: 24,
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
    color: "#34495e"
  }
});