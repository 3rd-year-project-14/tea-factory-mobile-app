import React, { useState, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, SafeAreaView, FlatList, ImageBackground, Dimensions,TextInput } from 'react-native';
import { Dropdown } from 'react-native-element-dropdown';
import { useRouter } from 'expo-router';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.85;
const CARD_HEIGHT = 200;

const factories = [
  {
    label: 'Waulugala Tea factory',
    value: 'waulugala',
    image: require('../assets/images/fac1.jpg'),
    group: 'Waulugala Group, Waulugala',
  },
  {
    label: 'Ruhuna Tea Factory',
    value: 'ruhuna',
    image: require('../assets/images/fac2.jpg'),
    group: 'Wattahena, Porawagama',
  },
  {
    label: 'Galaxy Factory',
    value: 'galaxy',
    image: require('../assets/images/fac2.jpg'),
    group: 'Galaxy, Kukulegama',
  },
  {
    label: 'Fortune Tea Factory',
    value: 'fortune',
    image: require('../assets/images/fac2.jpg'),
    group: 'Fortune, Lucky Hills',
  },
  {
    label: 'Duli Ella Tea Factory',
    value: 'duli',
    image: require('../assets/images/fac2.jpg'),
    group: 'Duli Ella, Kosmulla',
  },
  {
    label: 'Devonia Tea Factory',
    value: 'devonia',
    image: require('../assets/images/fac2.jpg'),
    group: 'Devonia Andaradeniya',
  },
  {
    label: 'Batuwagala Tea Factory',
    value: 'batuwagala',
    image: require('../assets/images/fac2.jpg'),
    group: 'New Batuwangala Magama',
  },
  {
    label: 'Andaradeniya Tea Factory',
    value: 'andaradeniya',
    image: require('../assets/images/fac2.jpg'),
    group: 'Andaradeniya Group, Andaradeniya',
  }
  // Add more factories as needed
];

const totalSteps = 3;

export default function SignupMultiStep() {
  const [step, setStep] = useState(0);
  const [selectedFactory, setSelectedFactory] = useState(null);
  const [selectedFactoryIndex, setSelectedFactoryIndex] = useState(0);
  const [yesNo, setYesNo] = useState(null);
  const router = useRouter();


  // For form fields in later steps:
  const [form, setForm] = useState({
    fullName: '',
    initials: '',
    nic: '',
    phone: '',
    address: '',
  });

  const carouselRef = useRef();

  // Helper for enabling Next button
  let canProceed = true;
  if (step === 0) canProceed = !!selectedFactory;
  if (step === 1) canProceed = yesNo !== null;

  // Custom image carousel using FlatList
  function FactoryCarousel() {
  const carouselWidth = width * 0.85;
  const carouselCardWidth = carouselWidth * 0.92; // slightly less than container
  const marginHorizontal = 8;
  const paddingHorizontal = (carouselWidth - carouselCardWidth) / 2;

  return (
    <View style={{ alignItems: 'center', marginBottom: 10, width: carouselWidth }}>
      <FlatList
        ref={carouselRef}
        data={factories}
        horizontal
        pagingEnabled
        snapToInterval={carouselCardWidth + marginHorizontal * 2}
        snapToAlignment="start"
        decelerationRate="fast"
        showsHorizontalScrollIndicator={false}
        keyExtractor={(_, idx) => idx.toString()}
        renderItem={({ item, index }) => (
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={() => {
              setSelectedFactory(item.value);
              setSelectedFactoryIndex(index);
              carouselRef.current?.scrollToIndex({ index, animated: true });
            }}
            style={[
              {
                width: carouselCardWidth,
                height: CARD_HEIGHT,
                marginHorizontal,
                borderRadius: 20,
                overflow: 'hidden',
                backgroundColor: '#eee',
                justifyContent: 'center',
                alignItems: 'center',
                position: 'relative',
              },
              selectedFactoryIndex === index && { borderWidth: 2, borderColor: '#183d2b' },
            ]}
          >
            <Image source={item.image} style={{ width: '100%', height: '100%', resizeMode: 'cover' }} />
            {/* Top caption (factory name) */}
            <View style={styles.captionTop}>
              <Text style={styles.captionTopText}>{item.label}</Text>
            </View>
            {/* Bottom caption (factory group) */}
            <View style={styles.captionBottom}>
              <Text style={styles.captionBottomText}>{item.group.split(',')[0]}</Text>
              <Text style={styles.captionBottomText}>{item.group.split(',')[1]}</Text>
            </View>
          </TouchableOpacity>
        )}
        onMomentumScrollEnd={e => {
          const idx = Math.round(
            e.nativeEvent.contentOffset.x / (carouselCardWidth + marginHorizontal * 2)
          );
          setSelectedFactoryIndex(idx);
        }}
        getItemLayout={(_, index) => ({
          length: carouselCardWidth + marginHorizontal * 2,
          offset: (carouselCardWidth + marginHorizontal * 2) * index,
          index,
        })}
        style={{ flexGrow: 0, width: carouselWidth }}
        contentContainerStyle={{ paddingHorizontal }}
      />
      {/* Pagination Dots - moved up, inside the card */}
      
    </View>
  );
}

  function renderStep() {
    if (step === 0) {
      // Factory selection step
      return (
        <View style={styles.card}>
          <Image source={require('../assets/images/logo2.png')} style={styles.logo} />
          <Text style={styles.title}>Welcome! Which factory are you supplying to?</Text>
         
          <Dropdown
            style={styles.dropdown}
            containerStyle={styles.dropdownContainer}
            itemTextStyle={styles.dropdownItemText}
            selectedTextStyle={styles.dropdownSelectedText}
            data={factories.map(f => ({ label: f.label, value: f.value }))}
            labelField="label"
            valueField="value"
            placeholder="Select factory"
            value={selectedFactory}
            onChange={item => {
              setSelectedFactory(item.value);
              const idx = factories.findIndex(f => f.value === item.value);
              setSelectedFactoryIndex(idx);
              carouselRef.current?.scrollToIndex({ index: idx, animated: true });
            }}
          />
           <FactoryCarousel />
        </View>
      );
    } else if (step === 1) {
      // Yes/No step
      return (
        <View style={styles.card}>
          <Image source={require('../assets/images/logo2.png')} style={styles.logo} />
          <Text style={styles.title}>Welcome to PureLeaf</Text>
          <Text style={styles.subtitle}>Have you Supplied to Andaradeniya Factory before?</Text>
          <View style={styles.row}>
            <TouchableOpacity
              style={[styles.yesNoBtn, yesNo === 'yes' && styles.yesNoBtnActive]}
              onPress={() => setYesNo('yes')}
            >
              <Text style={[styles.yesNoBtnText, yesNo === 'yes' && styles.yesNoBtnTextActive]}>Yes</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.yesNoBtn, yesNo === 'no' && styles.yesNoBtnActive]}
              onPress={() => setYesNo('no')}
            >
              <Text style={[styles.yesNoBtnText, yesNo === 'no' && styles.yesNoBtnTextActive]}>No</Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    } else if (step === 2) {
  return (
    <View style={styles.card}>
      <Image source={require('../assets/images/logo2.png')} style={styles.logo} />
      <Text style={styles.title}>Tell us about you!</Text>

      <Text style={styles.label}>Full name</Text>
      <TextInput
        style={styles.input}
        value={form.fullName}
        onChangeText={t => setForm(f => ({ ...f, fullName: t }))}
        placeholder="Full name"
        placeholderTextColor="#888"
      />

      <Text style={styles.label}>Name with Initials</Text>
      <TextInput
        style={styles.input}
        value={form.initials}
        onChangeText={t => setForm(f => ({ ...f, initials: t }))}
        placeholder="Name with Initials"
        placeholderTextColor="#888"
      />

      <Text style={styles.label}>NIC</Text>
      <TextInput
        style={styles.input}
        value={form.nic}
        onChangeText={t => setForm(f => ({ ...f, nic: t }))}
        placeholder="NIC"
        placeholderTextColor="#888"
      />

      <Text style={styles.label}>Phone number</Text>
      <TextInput
        style={styles.input}
        value={form.phone}
        onChangeText={t => setForm(f => ({ ...f, phone: t }))}
        placeholder="Phone number"
        keyboardType="phone-pad"
        placeholderTextColor="#888"
      />

      <Text style={styles.label}>Address</Text>
      <TextInput
        style={styles.input}
        value={form.address}
        onChangeText={t => setForm(f => ({ ...f, address: t }))}
        placeholder="Address"
        placeholderTextColor="#888"
      />

      {/* Next button for step 2, enable only if all fields are filled */}
     <TouchableOpacity
  style={[
    styles.nextBtn,
    !(Object.values(form).every(v => v.trim().length > 0)) && { backgroundColor: '#bbb' }
  ]}
  disabled={!(Object.values(form).every(v => v.trim().length > 0))}
  onPress={() => router.push('/login')}
>
  <Text style={styles.nextBtnText}>Next</Text>
</TouchableOpacity>


      <View style={styles.loginRow}>
        <Text style={styles.loginText}>Already Have an account yet? </Text>
       <TouchableOpacity onPress={() => router.replace('/login')}>
  <Text style={styles.loginLink}>Log in</Text>
</TouchableOpacity>

      </View>
    </View>
  );
}

  }

  return (
    <ImageBackground
      source={require('../assets/images/bg.jpg')}
      style={styles.bg}
      resizeMode="cover"
       filter="brightness(0.5)"
    >
      <View style={styles.overlay} />
      <SafeAreaView style={styles.safeArea}>
        {renderStep()}
        {/* Progress Dots for steps (not for carousel) */}
        <View style={[styles.dotsRow, { marginBottom: 18, marginTop: 0 }]}>
          {[...Array(totalSteps)].map((_, i) => (
            <View
              key={i}
              style={[
                styles.dot,
                i === step ? styles.dotActive : styles.dotInactive,
              ]}
            />
          ))}
        </View>
        {/* Next Button */}
        <TouchableOpacity
          style={[styles.nextBtn, !canProceed && { backgroundColor: '#ccc' }]}
          disabled={!canProceed}
          onPress={() => setStep(step + 1)}
        >
          <Text style={styles.nextBtnText}>Next</Text>
        </TouchableOpacity>
      </SafeAreaView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  bg: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(30,30,30,0.5)', // dark overlay
    zIndex: 1,
  },
  safeArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
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
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '500',
    marginBottom: 16,
    color: '#333',
    textAlign: 'center',
  },
  dropdown: {
    width: '100%',
    marginBottom: 12,
    backgroundColor: '#f3f3f3',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#183d2b',
  },
  dropdownContainer: {
    borderRadius: 12,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#183d2b',
    marginTop: 4,
    maxHeight: 180,
  },
  dropdownItemText: {
    color: '#222',
    fontSize: 16,
    paddingVertical: 8,
    textAlign:'center',
  },
  dropdownSelectedText: {
    color: '#183d2b',
    fontWeight: '600',
    fontSize: 16,
    textAlign:'center',
  },
  carouselCard: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    marginHorizontal: 8,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: '#eee',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  selectedCarouselCard: {
    borderWidth: 2,
    borderColor: '#183d2b',
  },
  carouselImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  captionTop: {
    position: 'absolute',
    top: 12,
    left: 12,
    right: 12,
    backgroundColor: 'rgba(40,40,40,0.55)',
    borderRadius: 16,
    paddingVertical: 8,
    paddingHorizontal: 12,
    alignItems: 'center',
  },
  captionTopText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '600',
    textAlign: 'center',
  },
  captionBottom: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    right: 12,
    backgroundColor: 'rgba(40,40,40,0.55)',
    borderRadius: 16,
    paddingVertical: 8,
    paddingHorizontal: 12,
    alignItems: 'center',
  },
  captionBottomText: {
    color: '#fff',
    fontSize: 18,
    textAlign: 'center',
    fontWeight: '400',
  },
  row: {
    flexDirection: 'row',
    marginVertical: 16,
    justifyContent: 'center',
    gap: 12,
  },
  yesNoBtn: {
    backgroundColor: '#eee',
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 28,
    marginHorizontal: 8,
    borderWidth: 1,
    borderColor: '#183d2b',
  },
  yesNoBtnActive: {
    backgroundColor: '#183d2b',
  },
  yesNoBtnText: {
    color: '#183d2b',
    fontWeight: '600',
    fontSize: 16,
  },
  yesNoBtnTextActive: {
    color: '#fff',
  },
  dotsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 10,
    marginBottom: 0,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    margin: 5,
  },
  dotActive: {
    backgroundColor: '#183d2b',
  },
  dotInactive: {
    backgroundColor: '#ccc',
  },
  nextBtn: {
    width: '85%',
    backgroundColor: '#183d2b',
    borderRadius: 16,
    paddingVertical: 12,
    alignItems: 'center',
    marginBottom: 24,
  },
  nextBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  label: {
  alignSelf: 'flex-start',
  fontSize: 15,
  color: '#222',
  marginTop: 8,
  marginBottom: 2,
  fontWeight: '500',
},
input: {
  width: '100%',
  backgroundColor: '#dedede',
  borderRadius: 18,
  paddingHorizontal: 16,
  paddingVertical: 10,
  fontSize: 16,
  marginBottom: 4,
  color: '#222',
},
loginRow: {
  flexDirection: 'row',
  alignItems: 'center',
  marginTop: 6,
},
loginText: {
  color: '#444',
  fontSize: 14,
},
loginLink: {
  color: '#183d2b',
  fontWeight: '600',
  fontSize: 14,
  textDecorationLine: 'underline',
},


});
