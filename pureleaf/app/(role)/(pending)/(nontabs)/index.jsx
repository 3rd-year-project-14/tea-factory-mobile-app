import React, { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  View,
  Text,
  StyleSheet,
  Image,
  SafeAreaView,
  ImageBackground,
  ScrollView,
} from "react-native";

export default function Index2() {
  const [userName, setUserName] = useState("");
  useEffect(() => {
    const loadUserName = async () => {
      try {
        const userDataStr = await AsyncStorage.getItem("userData");
        if (userDataStr) {
          const userData = JSON.parse(userDataStr);
          setUserName(userData.name || "");
        }
      } catch {
        setUserName("");
      }
    };
    loadUserName();
  }, []);
  return (
    <View style={styles.bg}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.greetingCard}>
          <ImageBackground
            source={require("../../../../assets/images/hero.jpg")}
            style={styles.greetingImage}
            imageStyle={styles.greetingImageBorder}
          >
            <View style={styles.greetingOverlay}>
              <Text style={styles.greetingText}>
                Welcome {userName ? userName : "User"}!
              </Text>
            </View>
          </ImageBackground>
        </View>

        <View style={styles.mainCard}>
          <ScrollView
            contentContainerStyle={{
              minHeight: 460,
              paddingBottom: 220,
              justifyContent: "center",
              alignItems: "center",
              flexGrow: 1,
            }}
            showsVerticalScrollIndicator={false}
          >
            <Text style={styles.headerText}>
              Your Request is Not Approved Yet
            </Text>
            <Text style={styles.subText}>
              Your submission is under review by our team. You will receive a
              notification once your profile has been approved for supplying.
              Please be patient.
            </Text>
          </ScrollView>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  bg: { flex: 1, backgroundColor: "#eaf2ea" },
  safeArea: { flex: 1, alignItems: "center" },
  greetingCard: {
    width: "97%",
    borderRadius: 22,
    overflow: "hidden",
    marginTop: 18,
    marginBottom: 12,
    alignSelf: "center",
    elevation: 5,
    backgroundColor: "#eaeaeae0",
  },
  greetingImage: { width: "100%", height: 100, justifyContent: "center" },
  greetingImageBorder: { borderRadius: 22 },
  greetingOverlay: {
    flex: 1,
    backgroundColor: "rgba(40,64,35,0.22)",
    borderRadius: 22,
    paddingHorizontal: 20,
    justifyContent: "center",
  },
  greetingText: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "700",
    textShadowColor: "#222c",
    textShadowRadius: 7,
    marginLeft: 6,
  },
  mainCard: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 12,
    width: "97%",
    alignSelf: "center",
    elevation: 4,
    marginBottom: 20,
    flex: 1,
  },
  headerText: {
    fontSize: 22,
    fontWeight: "700",
    color: "#183d2b",
    marginBottom: 10,
    textAlign: "center",
  },
  subText: {
    fontSize: 16,
    fontWeight: "400",
    color: "#365948",
    marginHorizontal: 20,
    textAlign: "center",
  },
});
