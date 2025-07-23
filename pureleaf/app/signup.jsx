// import React, { useState } from "react";
// import {
//   View,
//   Text,
//   TouchableOpacity,
//   StyleSheet,
//   Image,
//   SafeAreaView,
//   TextInput,
//   ImageBackground,
//   KeyboardAvoidingView,
//   Platform,
//   ScrollView,
//   Alert,
// } from "react-native";
// import { useRouter } from "expo-router";
// import { createUserWithEmailAndPassword, getIdToken } from "firebase/auth";
// import { auth } from "../firebase"; // adjust path if firebase.js is elsewhere

// export default function SignupBasicForm() {
//   const [form, setForm] = useState({
//     fullName: "",
//     nic: "",
//     phone: "",
//     email: "",
//     address: "",
//     password: "",
//     confirmpw: "",
//   });

//   const router = useRouter();
//   const allFieldsFilled = Object.values(form).every((v) => v.trim().length > 0);

//   const handleSignup = async () => {
//     if (form.password !== form.confirmpw) {
//       Alert.alert("Error", "Passwords do not match");
//       return;
//     }

//     try {
//       // ⿡ Create user in Firebase
//       const userCred = await createUserWithEmailAndPassword(
//         auth,
//         form.email,
//         form.password
//       );
//       const user = userCred.user;

//       // ⿢ Get Firebase token
//       const token = await getIdToken(user);

//       // ⿣ Send to Spring Boot backend
//       const response = await fetch(
//         "http://192.168.33.92:8080/api/auth/signup",
//         {
//           method: "POST",
//           headers: {
//             "Content-Type": "application/json",
//           },
//           body: JSON.stringify({
//             token,
//             name: form.fullName,
//             nic: form.nic,
//             contactNo: form.phone,
//             email: form.email,
//             address: form.address,
//           }),
//         }
//       );

//       const result = await response.text();

//       if (response.ok) {
//         Alert.alert("Success", "Signup successful!");
//         router.replace("/login");
//       } else {
//         Alert.alert("Signup failed", result);
//       }
//     } catch (error) {
//       console.error("Signup error:", error);
//       Alert.alert("Error", error.message || "Something went wrong");
//     }
//   };

//   return (
//     <ImageBackground
//       source={require("../assets/images/bg.jpg")}
//       style={styles.bg}
//       resizeMode="cover"
//     >
//       <View style={styles.overlay} />
//       <SafeAreaView style={styles.safeArea}>
//         <KeyboardAvoidingView
//           style={{ flex: 1, width: "100%" }}
//           behavior={Platform.OS === "ios" ? "padding" : "height"}
//           keyboardVerticalOffset={Platform.OS === "ios" ? 80 : 0}
//         >
//           <ScrollView
//             contentContainerStyle={styles.scrollContent}
//             keyboardShouldPersistTaps="handled"
//           >
//             <View style={styles.card}>
//               <Image
//                 source={require("../assets/images/logo2.png")}
//                 style={styles.logo}
//               />
//               <Text style={styles.title}>Tell us about you!</Text>

//               <Text style={styles.label}>Full name</Text>
//               <TextInput
//                 style={styles.input}
//                 value={form.fullName}
//                 onChangeText={(t) => setForm((f) => ({ ...f, fullName: t }))}
//                 placeholder="Full name"
//                 placeholderTextColor="#888"
//               />

//               <Text style={styles.label}>NIC</Text>
//               <TextInput
//                 style={styles.input}
//                 value={form.nic}
//                 onChangeText={(t) => setForm((f) => ({ ...f, nic: t }))}
//                 placeholder="NIC"
//                 placeholderTextColor="#888"
//               />

//               <Text style={styles.label}>Phone number</Text>
//               <TextInput
//                 style={styles.input}
//                 value={form.phone}
//                 onChangeText={(t) => setForm((f) => ({ ...f, phone: t }))}
//                 placeholder="Phone number"
//                 keyboardType="phone-pad"
//                 placeholderTextColor="#888"
//               />

//               <Text style={styles.label}>Email</Text>
//               <TextInput
//                 style={styles.input}
//                 value={form.email}
//                 onChangeText={(t) => setForm((f) => ({ ...f, email: t }))}
//                 placeholder="Email"
//                 keyboardType="email-address"
//                 placeholderTextColor="#888"
//               />

//               <Text style={styles.label}>Address</Text>
//               <TextInput
//                 style={styles.input}
//                 value={form.address}
//                 onChangeText={(t) => setForm((f) => ({ ...f, address: t }))}
//                 placeholder="Address"
//                 placeholderTextColor="#888"
//               />

//               <Text style={styles.label}>Password</Text>
//               <TextInput
//                 style={styles.input}
//                 value={form.password}
//                 onChangeText={(t) => setForm((f) => ({ ...f, password: t }))}
//                 placeholder="Password"
//                 placeholderTextColor="#888"
//                 secureTextEntry={true}
//               />

//               <Text style={styles.label}>Confirm Password</Text>
//               <TextInput
//                 style={styles.input}
//                 value={form.confirmpw}
//                 onChangeText={(t) => setForm((f) => ({ ...f, confirmpw: t }))}
//                 placeholder="Confirm password"
//                 placeholderTextColor="#888"
//                 secureTextEntry={true}
//               />

//               <TouchableOpacity
//                 style={[
//                   styles.nextBtn,
//                   !allFieldsFilled && { backgroundColor: "#bbb" },
//                 ]}
//                 disabled={!allFieldsFilled}
//                 onPress={handleSignup}
//               >
//                 <Text style={styles.nextBtnText}>Sign up</Text>
//               </TouchableOpacity>

//               <View style={styles.loginRow}>
//                 <Text style={styles.loginText}>
//                   Already have an account yet?{" "}
//                 </Text>
//                 <TouchableOpacity onPress={() => router.replace("/login")}>
//                   <Text style={styles.loginLink}>Log in</Text>
//                 </TouchableOpacity>
//               </View>
//             </View>
//           </ScrollView>
//         </KeyboardAvoidingView>
//       </SafeAreaView>
//     </ImageBackground>
//   );
// }

// const styles = StyleSheet.create({
//   scrollContent: {
//     flexGrow: 1,
//     justifyContent: "center",
//     alignItems: "center",
//     paddingVertical: 40,
//   },
//   bg: {
//     flex: 1,
//     width: "100%",
//     height: "100%",
//   },
//   overlay: {
//     ...StyleSheet.absoluteFillObject,
//     backgroundColor: "rgba(30,30,30,0.5)",
//     zIndex: 1,
//   },
//   safeArea: {
//     flex: 1,
//     justifyContent: "center",
//     alignItems: "center",
//     zIndex: 2,
//   },
//   card: {
//     width: "85%",
//     backgroundColor: "rgba(255,255,255,0.95)",
//     borderRadius: 24,
//     paddingVertical: 32,
//     paddingHorizontal: 24,
//     alignItems: "center",
//     elevation: 8,
//   },
//   logo: {
//     width: 48,
//     height: 48,
//     marginBottom: 16,
//     resizeMode: "contain",
//   },
//   title: {
//     fontSize: 20,
//     fontWeight: "600",
//     marginBottom: 8,
//     color: "#222",
//     textAlign: "center",
//   },
//   label: {
//     alignSelf: "flex-start",
//     fontSize: 15,
//     color: "#222",
//     marginTop: 8,
//     marginBottom: 2,
//     fontWeight: "500",
//   },
//   input: {
//     width: "100%",
//     backgroundColor: "#dedede",
//     borderRadius: 18,
//     paddingHorizontal: 16,
//     paddingVertical: 10,
//     fontSize: 16,
//     marginBottom: 4,
//     color: "#222",
//   },
//   nextBtn: {
//     width: "85%",
//     backgroundColor: "#183d2b",
//     borderRadius: 16,
//     paddingVertical: 12,
//     alignItems: "center",
//     marginTop: 16,
//   },
//   nextBtnText: {
//     color: "#fff",
//     fontSize: 16,
//     fontWeight: "600",
//   },
//   loginRow: {
//     flexDirection: "row",
//     alignItems: "center",
//     marginTop: 6,
//   },
//   loginText: {
//     color: "#444",
//     fontSize: 14,
//   },
//   loginLink: {
//     color: "#183d2b",
//     fontWeight: "600",
//     fontSize: 14,
//     textDecorationLine: "underline",
//   },
// });

// ==========================================================
// import React, { useState } from "react";
// import {
//   View,
//   Text,
//   TouchableOpacity,
//   StyleSheet,
//   Image,
//   SafeAreaView,
//   TextInput,
//   ImageBackground,
//   KeyboardAvoidingView,
//   Platform,
//   ScrollView,
//   Alert,
// } from "react-native";
// import { useRouter } from "expo-router";
// import { createUserWithEmailAndPassword, getIdToken } from "firebase/auth";
// import { auth } from "../firebase"; // adjust path if firebase.js is elsewhere

// export default function SignupBasicForm() {
//   const [form, setForm] = useState({
//     fullName: "",
//     nic: "",
//     phone: "",
//     email: "",
//     address: "",
//     password: "",
//     confirmpw: "",
//   });

//   const router = useRouter();
//   const allFieldsFilled = Object.values(form).every((v) => v.trim().length > 0);

//   const validateForm = () => {
//     const nicPattern = /^(?:\d{9}[vV]|\d{12})$/;
//     const phonePattern = /^\d{10}$/;
//     const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

//     if (!nicPattern.test(form.nic)) {
//       Alert.alert("Invalid NIC", "NIC should be 9 digits ending with 'V/v' or 12 digits.");
//       return false;
//     }

//     if (!phonePattern.test(form.phone)) {
//       Alert.alert("Invalid Phone Number", "Phone number should be exactly 10 digits.");
//       return false;
//     }

//     if (!emailPattern.test(form.email)) {
//       Alert.alert("Invalid Email", "Please enter a valid email address.");
//       return false;
//     }

//     if (form.password !== form.confirmpw) {
//       Alert.alert("Password Mismatch", "Passwords do not match.");
//       return false;
//     }

//     return true;
//   };

//   const handleSignup = async () => {
//     if (!validateForm()) return;

//     try {
//       const userCred = await createUserWithEmailAndPassword(
//         auth,
//         form.email,
//         form.password
//       );
//       const user = userCred.user;
//       const token = await getIdToken(user);

//       const response = await fetch(
//         "http://192.168.33.92:8080/api/auth/signup",
//         {
//           method: "POST",
//           headers: {
//             "Content-Type": "application/json",
//           },
//           body: JSON.stringify({
//             token,
//             name: form.fullName,
//             nic: form.nic,
//             contactNo: form.phone,
//             email: form.email,
//             address: form.address,
//           }),
//         }
//       );

//       const result = await response.text();

//       if (response.ok) {
//         Alert.alert("Success", "Signup successful!");
//         router.replace("/login");
//       } else {
//         Alert.alert("Signup failed", result);
//       }
//     } catch (error) {
//       console.error("Signup error:", error);
//       Alert.alert("Error", error.message || "Something went wrong");
//     }
//   };

//   return (
//     <ImageBackground
//       source={require("../assets/images/bg.jpg")}
//       style={styles.bg}
//       resizeMode="cover"
//     >
//       <View style={styles.overlay} />
//       <SafeAreaView style={styles.safeArea}>
//         <KeyboardAvoidingView
//           style={{ flex: 1, width: "100%" }}
//           behavior={Platform.OS === "ios" ? "padding" : "height"}
//           keyboardVerticalOffset={Platform.OS === "ios" ? 80 : 0}
//         >
//           <ScrollView
//             contentContainerStyle={styles.scrollContent}
//             keyboardShouldPersistTaps="handled"
//           >
//             <View style={styles.card}>
//               <Image
//                 source={require("../assets/images/logo2.png")}
//                 style={styles.logo}
//               />
//               <Text style={styles.title}>Tell us about you!</Text>

//               <Text style={styles.label}>Full name</Text>
//               <TextInput
//                 style={styles.input}
//                 value={form.fullName}
//                 onChangeText={(t) => setForm((f) => ({ ...f, fullName: t }))}
//                 placeholder="Full name"
//                 placeholderTextColor="#888"
//               />

//               <Text style={styles.label}>NIC</Text>
//               <TextInput
//                 style={styles.input}
//                 value={form.nic}
//                 onChangeText={(t) => setForm((f) => ({ ...f, nic: t }))}
//                 placeholder="NIC"
//                 placeholderTextColor="#888"
//               />

//               <Text style={styles.label}>Phone number</Text>
//               <TextInput
//                 style={styles.input}
//                 value={form.phone}
//                 onChangeText={(t) => setForm((f) => ({ ...f, phone: t }))}
//                 placeholder="Phone number"
//                 keyboardType="phone-pad"
//                 placeholderTextColor="#888"
//               />

//               <Text style={styles.label}>Email</Text>
//               <TextInput
//                 style={styles.input}
//                 value={form.email}
//                 onChangeText={(t) => setForm((f) => ({ ...f, email: t }))}
//                 placeholder="Email"
//                 keyboardType="email-address"
//                 placeholderTextColor="#888"
//               />

//               <Text style={styles.label}>Address</Text>
//               <TextInput
//                 style={styles.input}
//                 value={form.address}
//                 onChangeText={(t) => setForm((f) => ({ ...f, address: t }))}
//                 placeholder="Address"
//                 placeholderTextColor="#888"
//               />

//               <Text style={styles.label}>Password</Text>
//               <TextInput
//                 style={styles.input}
//                 value={form.password}
//                 onChangeText={(t) => setForm((f) => ({ ...f, password: t }))}
//                 placeholder="Password"
//                 placeholderTextColor="#888"
//                 secureTextEntry={true}
//               />

//               <Text style={styles.label}>Confirm Password</Text>
//               <TextInput
//                 style={styles.input}
//                 value={form.confirmpw}
//                 onChangeText={(t) => setForm((f) => ({ ...f, confirmpw: t }))}
//                 placeholder="Confirm password"
//                 placeholderTextColor="#888"
//                 secureTextEntry={true}
//               />

//               <TouchableOpacity
//                 style={[
//                   styles.nextBtn,
//                   !allFieldsFilled && { backgroundColor: "#bbb" },
//                 ]}
//                 disabled={!allFieldsFilled}
//                 onPress={handleSignup}
//               >
//                 <Text style={styles.nextBtnText}>Sign up</Text>
//               </TouchableOpacity>

//               <View style={styles.loginRow}>
//                 <Text style={styles.loginText}>
//                   Already have an account yet?{" "}
//                 </Text>
//                 <TouchableOpacity onPress={() => router.replace("/login")}>
//                   <Text style={styles.loginLink}>Log in</Text>
//                 </TouchableOpacity>
//               </View>
//             </View>
//           </ScrollView>
//         </KeyboardAvoidingView>
//       </SafeAreaView>
//     </ImageBackground>
//   );
// }

// const styles = StyleSheet.create({
//   scrollContent: {
//     flexGrow: 1,
//     justifyContent: "center",
//     alignItems: "center",
//     paddingVertical: 40,
//   },
//   bg: {
//     flex: 1,
//     width: "100%",
//     height: "100%",
//   },
//   overlay: {
//     ...StyleSheet.absoluteFillObject,
//     backgroundColor: "rgba(30,30,30,0.5)",
//     zIndex: 1,
//   },
//   safeArea: {
//     flex: 1,
//     justifyContent: "center",
//     alignItems: "center",
//     zIndex: 2,
//   },
//   card: {
//     width: "85%",
//     backgroundColor: "rgba(255,255,255,0.95)",
//     borderRadius: 24,
//     paddingVertical: 32,
//     paddingHorizontal: 24,
//     alignItems: "center",
//     elevation: 8,
//   },
//   logo: {
//     width: 48,
//     height: 48,
//     marginBottom: 16,
//     resizeMode: "contain",
//   },
//   title: {
//     fontSize: 20,
//     fontWeight: "600",
//     marginBottom: 8,
//     color: "#222",
//     textAlign: "center",
//   },
//   label: {
//     alignSelf: "flex-start",
//     fontSize: 15,
//     color: "#222",
//     marginTop: 8,
//     marginBottom: 2,
//     fontWeight: "500",
//   },
//   input: {
//     width: "100%",
//     backgroundColor: "#dedede",
//     borderRadius: 18,
//     paddingHorizontal: 16,
//     paddingVertical: 10,
//     fontSize: 16,
//     marginBottom: 4,
//     color: "#222",
//   },
//   nextBtn: {
//     width: "85%",
//     backgroundColor: "#183d2b",
//     borderRadius: 10,
//     paddingVertical: 12,
//     alignItems: "center",
//     marginTop: 16,
//   },
//   nextBtnText: {
//     color: "#fff",
//     fontSize: 16,
//     fontWeight: "600",
//   },
//   loginRow: {
//     flexDirection: "row",
//     alignItems: "center",
//     marginTop: 6,
//   },
//   loginText: {
//     color: "#444",
//     fontSize: 14,
//   },
//   loginLink: {
//     color: "#183d2b",
//     fontWeight: "600",
//     fontSize: 14,
//     textDecorationLine: "underline",
//   },
// });
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

  // message object: { type: "error" | "success", text: string } or null
  const [message, setMessage] = useState(null);

  const router = useRouter();
  const allFieldsFilled = Object.values(form).every((v) => v.trim().length > 0);

  const validateForm = () => {
    setMessage(null);
    const nicPattern = /^(?:\d{9}[vV]|\d{12})$/;
    const phonePattern = /^\d{10}$/;
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!nicPattern.test(form.nic)) {
      setMessage({ type: "error", text: "NIC should be 9 digits ending with 'V/v' or 12 digits." });
      return false;
    }

    if (!phonePattern.test(form.phone)) {
      setMessage({ type: "error", text: "Phone number should be exactly 10 digits." });
      return false;
    }

    if (!emailPattern.test(form.email)) {
      setMessage({ type: "error", text: "Please enter a valid email address." });
      return false;
    }

    if (form.password !== form.confirmpw) {
      setMessage({ type: "error", text: "Passwords do not match." });
      return false;
    }

    return true;
  };

  const handleSignup = async () => {
    if (!validateForm()) return;

    setMessage(null);

    try {
      const userCred = await createUserWithEmailAndPassword(
        auth,
        form.email,
        form.password
      );
      const user = userCred.user;
      const token = await getIdToken(user);

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
        setMessage({ type: "success", text: "Signup successful!" });
        setTimeout(() => router.replace("/login"), 1500);
      } else {
        setMessage({ type: "error", text: result });
      }
    } catch (error) {
      console.error("Signup error:", error);
      setMessage({ type: "error", text: error.message || "Something went wrong" });
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

              {/* Message Box */}
              {message && (
                <View
                  style={[
                    styles.messageBox,
                    message.type === "error" ? styles.errorBox : styles.successBox,
                  ]}
                >
                  <Text style={styles.messageText}>{message.text}</Text>
                </View>
              )}

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
                <Text style={styles.loginText}>Already have an account yet? </Text>
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

  messageBox: {
    width: "100%",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    justifyContent: "center",
    alignItems: "center",
  },
  errorBox: {
    backgroundColor: "#ecad89ff",
    borderWidth: 1,
    borderColor: "#d66d30ff",
  },
  successBox: {
    backgroundColor: "#7bf074ff",
    borderWidth: 1,
    borderColor: "#0eb605ff",
  },
  messageText: {
    color: "#222",
    fontSize: 16,
    fontWeight: "600",
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
    borderRadius: 10,
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
