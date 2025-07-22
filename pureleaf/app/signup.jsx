import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  SafeAreaView,
  TextInput,
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { createUserWithEmailAndPassword, getIdToken } from "firebase/auth";
import { auth } from "../firebase"; // adjust path if firebase.js is elsewhere

export default function SignupBasicForm() {
  const [form, setForm] = useState({
    fullName: "",
    nic: "",
    phone: "",
    email: "",
    address: "",
    password: "",
    confirmpw: "",
  });

  const router = useRouter();
  const allFieldsFilled = Object.values(form).every((v) => v.trim().length > 0);

  const handleSignup = async () => {
    if (form.password !== form.confirmpw) {
      Alert.alert("Error", "Passwords do not match");
      return;
    }

    try {
      // ⿡ Create user in Firebase
      const userCred = await createUserWithEmailAndPassword(
        auth,
        form.email,
        form.password
      );
      const user = userCred.user;

      // ⿢ Get Firebase token
      const token = await getIdToken(user);

      // ⿣ Send to Spring Boot backend
      const response = await fetch(
        "http://192.168.33.92:8080/api/auth/signup",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            token,
            name: form.fullName,
            nic: form.nic,
            contactNo: form.phone,
            email: form.email,
            address: form.address,
          }),
        }
      );

      const result = await response.text();

      if (response.ok) {
        Alert.alert("Success", "Signup successful!");
        router.replace("/login");
      } else {
        Alert.alert("Signup failed", result);
      }
    } catch (error) {
      console.error("Signup error:", error);
      Alert.alert("Error", error.message || "Something went wrong");
    }
  };

  return (
    <ImageBackground
      source={require("../assets/images/bg.jpg")}
      style={styles.bg}
      resizeMode="cover"
    >
      <View style={styles.overlay} />
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          style={{ flex: 1, width: "100%" }}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          keyboardVerticalOffset={Platform.OS === "ios" ? 80 : 0}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.card}>
              <Image
                source={require("../assets/images/logo2.png")}
                style={styles.logo}
              />
              <Text style={styles.title}>Tell us about you!</Text>

              <Text style={styles.label}>Full name</Text>
              <TextInput
                style={styles.input}
                value={form.fullName}
                onChangeText={(t) => setForm((f) => ({ ...f, fullName: t }))}
                placeholder="Full name"
                placeholderTextColor="#888"
              />

              <Text style={styles.label}>NIC</Text>
              <TextInput
                style={styles.input}
                value={form.nic}
                onChangeText={(t) => setForm((f) => ({ ...f, nic: t }))}
                placeholder="NIC"
                placeholderTextColor="#888"
              />

              <Text style={styles.label}>Phone number</Text>
              <TextInput
                style={styles.input}
                value={form.phone}
                onChangeText={(t) => setForm((f) => ({ ...f, phone: t }))}
                placeholder="Phone number"
                keyboardType="phone-pad"
                placeholderTextColor="#888"
              />

              <Text style={styles.label}>Email</Text>
              <TextInput
                style={styles.input}
                value={form.email}
                onChangeText={(t) => setForm((f) => ({ ...f, email: t }))}
                placeholder="Email"
                keyboardType="email-address"
                placeholderTextColor="#888"
              />

              <Text style={styles.label}>Address</Text>
              <TextInput
                style={styles.input}
                value={form.address}
                onChangeText={(t) => setForm((f) => ({ ...f, address: t }))}
                placeholder="Address"
                placeholderTextColor="#888"
              />

              <Text style={styles.label}>Password</Text>
              <TextInput
                style={styles.input}
                value={form.password}
                onChangeText={(t) => setForm((f) => ({ ...f, password: t }))}
                placeholder="Password"
                placeholderTextColor="#888"
                secureTextEntry={true}
              />

              <Text style={styles.label}>Confirm Password</Text>
              <TextInput
                style={styles.input}
                value={form.confirmpw}
                onChangeText={(t) => setForm((f) => ({ ...f, confirmpw: t }))}
                placeholder="Confirm password"
                placeholderTextColor="#888"
                secureTextEntry={true}
              />

              <TouchableOpacity
                style={[
                  styles.nextBtn,
                  !allFieldsFilled && { backgroundColor: "#bbb" },
                ]}
                disabled={!allFieldsFilled}
                onPress={handleSignup}
              >
                <Text style={styles.nextBtnText}>Sign up</Text>
              </TouchableOpacity>

              <View style={styles.loginRow}>
                <Text style={styles.loginText}>
                  Already have an account yet?{" "}
                </Text>
                <TouchableOpacity onPress={() => router.replace("/login")}>
                  <Text style={styles.loginLink}>Log in</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 40,
  },
  bg: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(30,30,30,0.5)",
    zIndex: 1,
  },
  safeArea: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 2,
  },
  card: {
    width: "85%",
    backgroundColor: "rgba(255,255,255,0.95)",
    borderRadius: 24,
    paddingVertical: 32,
    paddingHorizontal: 24,
    alignItems: "center",
    elevation: 8,
  },
  logo: {
    width: 48,
    height: 48,
    marginBottom: 16,
    resizeMode: "contain",
  },
  title: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 8,
    color: "#222",
    textAlign: "center",
  },
  label: {
    alignSelf: "flex-start",
    fontSize: 15,
    color: "#222",
    marginTop: 8,
    marginBottom: 2,
    fontWeight: "500",
  },
  input: {
    width: "100%",
    backgroundColor: "#dedede",
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 16,
    marginBottom: 4,
    color: "#222",
  },
  nextBtn: {
    width: "85%",
    backgroundColor: "#183d2b",
    borderRadius: 16,
    paddingVertical: 12,
    alignItems: "center",
    marginTop: 16,
  },
  nextBtnText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  loginRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 6,
  },
  loginText: {
    color: "#444",
    fontSize: 14,
  },
  loginLink: {
    color: "#183d2b",
    fontWeight: "600",
    fontSize: 14,
    textDecorationLine: "underline",
  },
});