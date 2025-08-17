import React, { useState } from "react";
import { useRouter } from "expo-router";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
  ImageBackground,
  ActivityIndicator,
} from "react-native";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";
import { BASE_URL } from "../../pureleaf/constants/ApiConfig";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  // message object: { type: "error", text: string } or null
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(false);

  const router = useRouter();

  const validateForm = () => {
    setMessage(null);
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(email)) {
      setMessage({
        type: "error",
        text: "Please enter a valid email address.",
      });
      return false;
    }

    if (password.trim().length === 0) {
      setMessage({ type: "error", text: "Password cannot be empty." });
      return false;
    }

    return true;
  };

  const handleLogin = async () => {
    if (!validateForm()) return;

    setMessage(null);
    setLoading(true);

    try {
      // Firebase login
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      // Get Firebase ID token
      const token = await user.getIdToken();

      // Send token to backend
      const response = await fetch(`${BASE_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error("Login failed: " + errorText);
      }

      // Get user info from backend
      const data = await response.json();
      const userRole = data.role?.toLowerCase();
      const userId = data.userId || data.id;

      if (userId) {
        // Fetch driver data and store in AsyncStorage (using axios and BASE_URL)
        try {
          const driverRes = await axios.get(
            `${BASE_URL}/api/drivers/user/${userId}`
          );
          const driverData = driverRes.data;
          await AsyncStorage.setItem("driverData", JSON.stringify(driverData));
        } catch (err) {
          if (err.response) {
            console.warn(
              "Failed to fetch driver data",
              err.response.status,
              err.response.data
            );
          } else {
            console.error("Error fetching driver data:", err);
          }
        }
        // Store user data from login response
        await AsyncStorage.setItem("userData", JSON.stringify(data));

        // Fetch supplier request data and store in AsyncStorage
        try {
          const supplierReqRes = await fetch(
            `${BASE_URL}/api/supplier-requests?userId=${userId}`
          );
          if (supplierReqRes.ok) {
            const supplierRequestData = await supplierReqRes.json();
            await AsyncStorage.setItem(
              "supplierRequest",
              JSON.stringify(supplierRequestData)
            );
          } else {
            console.warn("Failed to fetch supplier request data");
          }
        } catch (err) {
          console.error("Error fetching supplier request data:", err);
        }

        // Fetch supplier table details and store in AsyncStorage
        try {
          const supplierTableRes = await fetch(
            `${BASE_URL}/api/suppliers/by-user?userId=${userId}`
          );
          if (supplierTableRes.ok) {
            const supplierTableData = await supplierTableRes.json();
            await AsyncStorage.setItem(
              "supplierData",
              JSON.stringify(supplierTableData)
            );
          } else {
            console.warn("Failed to fetch supplier table data");
          }
        } catch (err) {
          console.error("Error fetching supplier table data:", err);
        }
      }

      // Navigate based on role
      switch (userRole) {
        case "pending_user":
          router.replace("/(role)/(pending)");
          break;
        case "driver":
          router.replace("/(role)/(driver)");
          break;
        case "supplier":
          router.replace("/(role)/(supplier)");
          break;
        case "inhouse":
          router.replace("/(role)/(inhouse)");
          break;
        default:
          alert("Login successful, but unknown role: " + userRole);
          break;
      }
    } catch (error) {
      let errorMsg = "Login failed";
      // Always show 'Invalid credentials' for any credential error
      if (
        (error && error.code && error.code.includes("invalid-credential")) ||
        (error &&
          error.message &&
          error.message.includes("invalid-credential")) ||
        (error &&
          error.message &&
          error.message.toLowerCase().includes("password"))
      ) {
        errorMsg = "Invalid credentials";
      }
      setMessage({ type: "error", text: errorMsg });
      console.error("Login error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ImageBackground
      source={require("../assets/images/bg.jpg")}
      style={styles.bg}
      resizeMode="cover"
    >
      <View style={styles.card}>
        <Image
          source={require("../assets/images/logo2.png")}
          style={styles.logo}
        />
        <Text style={styles.title}>Welcome to PureLeaf</Text>
        <Text style={styles.subtitle}>Login</Text>

        {/* Inline Message Box */}
        {message && (
          <View
            style={[
              styles.messageBox,
              message.type === "error" && styles.errorBox,
            ]}
          >
            <Text style={styles.messageText}>{message.text}</Text>
          </View>
        )}

        <Text style={styles.label}>Email</Text>
        <TextInput
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          placeholder="Enter email"
          placeholderTextColor="#888"
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <Text style={styles.label}>Password</Text>
        <TextInput
          style={styles.input}
          value={password}
          onChangeText={setPassword}
          placeholder="Enter password"
          placeholderTextColor="#888"
          secureTextEntry
        />

        <TouchableOpacity
          style={[styles.loginBtn, loading && { opacity: 0.6 }]}
          onPress={handleLogin}
          disabled={loading}
        >
          {loading ? (
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <ActivityIndicator size="small" color="#fff" />
              <Text style={[styles.loginBtnText, { marginLeft: 8 }]}>
                Logging in...
              </Text>
            </View>
          ) : (
            <Text style={styles.loginBtnText}>Login</Text>
          )}
        </TouchableOpacity>
        <TouchableOpacity>
          <Text style={styles.forgot}>Forgot Password?</Text>
        </TouchableOpacity>
        <View style={styles.signupRow}>
          <Text style={styles.signupText}>{"Don't have an account yet?"}</Text>
          <TouchableOpacity onPress={() => router.push("/signup")}>
            <Text style={styles.signupLink}>Sign Up</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  bg: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
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
  },
  subtitle: {
    fontSize: 18,
    fontWeight: "500",
    marginBottom: 16,
    color: "#333",
  },
  label: {
    alignSelf: "flex-start",
    fontSize: 14,
    color: "#444",
    marginTop: 8,
    marginBottom: 4,
  },
  input: {
    width: "100%",
    backgroundColor: "#e6e6e6",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 16,
    marginBottom: 8,
    color: "#222",
  },
  loginBtn: {
    width: "100%",
    backgroundColor: "#183d2b",
    borderRadius: 16,
    paddingVertical: 12,
    alignItems: "center",
    marginTop: 16,
    marginBottom: 8,
  },
  loginBtnText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  forgot: {
    color: "#183d2b",
    marginTop: 4,
    marginBottom: 8,
    fontSize: 14,
    textDecorationLine: "underline",
  },
  signupRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
  },
  signupText: {
    color: "#444",
    fontSize: 14,
  },
  signupLink: {
    color: "#183d2b",
    fontWeight: "600",
    fontSize: 14,
    textDecorationLine: "underline",
  },
  messageBox: {
    width: "100%",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 5,
    marginBottom: 12,
    backgroundColor: "#f1b2bbff",
    borderWidth: 1,
    borderColor: "#ef7789ff",
    justifyContent: "center",
    alignItems: "center",
  },
  messageText: {
    color: "#d63031",
    fontSize: 14,
    fontWeight: "600",
    textAlign: "center",
  },
});
