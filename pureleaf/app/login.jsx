import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, StyleSheet, ImageBackground } from 'react-native';
import { useRouter } from 'expo-router';


export default function LoginScreen() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();

  const handleLogin = () => {
    // Add your authentication logic here
    // If successful: router.replace('/(tabs)');
    // alert('Login pressed');
    router.replace('/(role)/(manager)');
  };

  return (
    <ImageBackground
      source={require('../assets/images/bg.jpg')} // Use your leaf background image
      style={styles.bg}
      resizeMode="cover"
      filter="brightness(0.5)"
    >
      <View style={styles.card}>
        <Image
          source={require('../assets/images/logo2.png')} // Use your logo image
          style={styles.logo}
        />
        <Text style={styles.title}>Welcome to PureLeaf</Text>
        <Text style={styles.subtitle}>Login</Text>
        <Text style={styles.label}>Username</Text>
        <TextInput
          style={styles.input}
          
          value={username}
          onChangeText={setUsername}
          placeholderTextColor="#888"
        />
        <Text style={styles.label}>Password</Text>
        <TextInput
          style={styles.input}
          
          value={password}
          onChangeText={setPassword}
          placeholderTextColor="#888"
          secureTextEntry
        />
        <TouchableOpacity style={styles.loginBtn} onPress={handleLogin}>
          <Text style={styles.loginBtnText}>Login</Text>
        </TouchableOpacity>
        <TouchableOpacity>
          <Text style={styles.forgot}>Forgot Password?</Text>
        </TouchableOpacity>
        <View style={styles.signupRow}>
          <Text style={styles.signupText}>Don't Have an account yet? </Text>
          <TouchableOpacity onPress={() => router.push('/signup')}>
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
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    width: '85%',
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 24,
    paddingVertical: 32,
    paddingHorizontal: 24,
    alignItems: 'center',
    elevation: 8,
  },
  logo: {
    width: 48,
    height: 48,
    marginBottom: 16,
    resizeMode: 'contain',
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 8,
    color: '#222',
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '500',
    marginBottom: 16,
    color: '#333',
  },
  label: {
    alignSelf: 'flex-start',
    fontSize: 14,
    color: '#444',
    marginTop: 8,
    marginBottom: 4,
  },
  input: {
    width: '100%',
    backgroundColor: '#e6e6e6',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 16,
    marginBottom: 8,
    color: '#222',
  },
  loginBtn: {
    width: '100%',
    backgroundColor: '#183d2b',
    borderRadius: 16,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 8,
  },
  loginBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  forgot: {
    color: '#183d2b',
    marginTop: 4,
    marginBottom: 8,
    fontSize: 14,
    textDecorationLine: 'underline',
  },
  signupRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  signupText: {
    color: '#444',
    fontSize: 14,
  },
  signupLink: {
    color: '#183d2b',
    fontWeight: '600',
    fontSize: 14,
    textDecorationLine: 'underline',
  },
});
