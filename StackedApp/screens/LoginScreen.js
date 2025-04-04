import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Alert } from "react-native";
import auth from "@react-native-firebase/auth";
import PhoneInput from "react-native-phone-number-input";

const LoginScreen = ({ navigation }) => {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [confirm, setConfirm] = useState(null);
  const [code, setCode] = useState("");

  const signInWithPhoneNumber = async () => {
    try {
      const confirmation = await auth().signInWithPhoneNumber(phoneNumber);
      setConfirm(confirmation);
    } catch (error) {
      Alert.alert("Error", "Failed to send OTP");
    }
  };

  const confirmCode = async () => {
    try {
      await confirm.confirm(code);
      Alert.alert("Success", "You are now logged in!");
      navigation.navigate("HomeScreen");
    } catch (error) {
      Alert.alert("Error", "Invalid OTP");
    }
  };

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      {!confirm ? (
        <>
          <Text>Enter your phone number:</Text>
          <PhoneInput
            defaultValue={phoneNumber}
            defaultCode="US"
            onChangeFormattedText={(text) => setPhoneNumber(text)}
          />
          <TouchableOpacity onPress={signInWithPhoneNumber}>
            <Text>Send Code</Text>
          </TouchableOpacity>
        </>
      ) : (
        <>
          <Text>Enter the OTP sent to your phone:</Text>
          <TextInput
            style={{ borderBottomWidth: 1, width: 200 }}
            placeholder="123456"
            keyboardType="number-pad"
            onChangeText={setCode}
          />
          <TouchableOpacity onPress={confirmCode}>
            <Text>Verify</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
};

export default LoginScreen;