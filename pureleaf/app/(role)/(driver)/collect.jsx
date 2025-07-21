import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';
import {
  PanGestureHandler,
  GestureHandlerRootView,
} from 'react-native-gesture-handler';

const SCREEN_WIDTH = Dimensions.get('window').width;

const FERTILIZERS = [
  { id: 1, name: 'Urea', description: 'Nitrogen fertilizer', image: require('../../../assets/images/fert1.jpg') },
  { id: 2, name: 'MOP', description: 'Potassium fertilizer', image: require('../../../assets/images/fert2.jpg') },
  { id: 3, name: 'TSP', description: 'Phosphorus fertilizer', image: require('../../../assets/images/fert1.jpg') },
  { id: 4, name: 'Ammonium Sulphate', description: 'Sulphur fertilizer', image: require('../../../assets/images/fert2.jpg') },
];

const CHEQUES = [
  { id: 1, name: 'Bank of Ceylon', description: 'Rs 100,000' },
  { id: 2, name: 'Peoples Bank', description: 'Rs 200,000' },
];

export default function CollectScreen() {
  const [fertilizerPicked, setFertilizerPicked] = useState({});
  const [chequePicked, setChequePicked] = useState({});
  const [fertilizerConfirmed, setFertilizerConfirmed] = useState([]);
  const [chequeConfirmed, setChequeConfirmed] = useState([]);

  const toggleItem = (id, picked, setPicked) => {
    setPicked(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const selectAllToggle = (items, picked, setPicked) => {
    const allSelected = items.every(item => picked[item.id]);
    const newState = {};
    for (let item of items) {
      newState[item.id] = !allSelected;
    }
    setPicked(newState);
  };

  const SlideToConfirm = ({ onConfirm }) => {
    const SLIDER_WIDTH = SCREEN_WIDTH - 48;
    const translateX = useSharedValue(0);
    const knobSize = 48;
    const maxTranslate = SLIDER_WIDTH - knobSize - 4;

    const animatedStyles = useAnimatedStyle(() => ({
      transform: [{ translateX: translateX.value }],
    }));

    const handleGesture = (event) => {
      const x = event.nativeEvent.translationX;
      if (x >= 0 && x <= maxTranslate) {
        translateX.value = x;
      }
    };

    const handleEnd = (event) => {
      if (translateX.value > maxTranslate * 0.9) {
        translateX.value = withSpring(maxTranslate, {}, () => {
          runOnJS(onConfirm)();
          translateX.value = 0;
        });
      } else {
        translateX.value = withSpring(0);
      }
    };

    return (
      <View style={[styles.sliderContainerNew, { width: SLIDER_WIDTH }]}>
        <Text style={styles.slideLabelNew}>Slide to confirm →</Text>
        <PanGestureHandler onGestureEvent={handleGesture} onEnded={handleEnd}>
          <Animated.View style={[styles.sliderKnobNew, animatedStyles]}>
            <View style={styles.chevron} />
          </Animated.View>
        </PanGestureHandler>
      </View>
    );
  };

  const renderSection = ({
    title,
    items,
    picked,
    setPicked,
    confirmedList,
    setConfirmed,
  }) => {
    const visibleItems = items.filter(item => !confirmedList.includes(item.id));
    if (visibleItems.length === 0) return null;

    const handleConfirm = () => {
      const confirmed = visibleItems
        .filter(item => picked[item.id])
        .map(item => item.id);
      setConfirmed(prev => [...prev, ...confirmed]);
    };

    return (
      <View style={{ marginBottom: 32 }}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>{title}</Text>
          <TouchableOpacity onPress={() => selectAllToggle(items, picked, setPicked)}>
            <Text style={styles.selectAll}>Select All</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.todoListCard}>
          {visibleItems.map(item => (
            <TouchableOpacity
              key={item.id}
              style={[
                styles.todoRow,
                picked[item.id] && styles.todoRowPicked,
              ]}
              onPress={() => toggleItem(item.id, picked, setPicked)}
            >
              <View style={styles.checkbox}>
                {picked[item.id] && <View style={styles.checkboxTick} />}
              </View>
              {item.image && <Image source={item.image} style={styles.fertImage} />}
              <View style={styles.todoTextBox}>
                <Text style={styles.todoTitle}>{item.name}</Text>
                <Text style={styles.todoDesc}>{item.description}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <SlideToConfirm onConfirm={handleConfirm} />
      </View>
    );
  };

  // ✅ Added allSectionsDone logic
  const allFertilizersDone = FERTILIZERS.every(item => fertilizerConfirmed.includes(item.id));
  const allChequesDone = CHEQUES.every(item => chequeConfirmed.includes(item.id));
  const allSectionsDone = allFertilizersDone && allChequesDone;

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: '#f4f8f4' }}>
      <ScrollView contentContainerStyle={{ padding: 20 }}>
        <View style={styles.headerCard}>
          <Text style={styles.headerTitle}>Pick Up Items</Text>
          <Text style={styles.headerSubtitle}>Confirm after collecting selected items.</Text>
        </View>

        {renderSection({
          title: 'Fertilizers',
          items: FERTILIZERS,
          picked: fertilizerPicked,
          setPicked: setFertilizerPicked,
          confirmedList: fertilizerConfirmed,
          setConfirmed: setFertilizerConfirmed,
        })}

        {renderSection({
          title: 'Cheques',
          items: CHEQUES,
          picked: chequePicked,
          setPicked: setChequePicked,
          confirmedList: chequeConfirmed,
          setConfirmed: setChequeConfirmed,
        })}

        {/* ✅ Show Complete Message */}
        {allSectionsDone && (
          <View style={styles.messageBox}>
            <Text style={styles.completeMessage}> All items picked up!</Text>
          </View>
        )}
      </ScrollView>
    </GestureHandlerRootView>
  );
}


// --- Styles ---
const styles = StyleSheet.create({
  headerCard: {
    backgroundColor: '#eaf2ea',
    borderRadius: 18,
    marginBottom: 22,
    paddingVertical: 28,
    paddingHorizontal: 18,
    alignItems: 'center',
    elevation: 2,
  },
  headerTitle: {
    fontSize: 24,
    color: '#183d2b',
    fontWeight: '900',
    letterSpacing: 1,
    marginBottom: 3,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#254b39',
    fontWeight: '500',
    opacity: 0.8,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
    paddingHorizontal: 6,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#183d2b',
  },
  selectAll: {
    fontSize: 14,
    color: '#254b39',
    fontWeight: '600',
  },
  todoListCard: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 10,
    elevation: 2,
    marginBottom: 12,
  },
  todoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    borderRadius: 10,
    backgroundColor: '#fff',
  },
  todoRowPicked: {
    backgroundColor: '#cddbd1',
    opacity: 0.65,
  },
  checkbox: {
    width: 28,
    height: 28,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: '#254b39',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 18,
    backgroundColor: '#fff',
  },
  checkboxTick: {
    width: 16,
    height: 16,
    borderRadius: 4,
    backgroundColor: '#183d2b',
  },
  fertImage: {
    width: 38,
    height: 38,
    borderRadius: 9,
    backgroundColor: '#eee',
    marginRight: 14,
  },
  todoTextBox: {
    flex: 1,
  },
  todoTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#183d2b',
    marginBottom: 3,
  },
  todoDesc: {
    fontSize: 13,
    color: '#254b39',
    opacity: 0.8,
  },
  sliderContainerNew: {
    height: 56,
    borderRadius: 28,
    backgroundColor: '#183d2b',
    justifyContent: 'center',
    paddingHorizontal: 4,
    marginTop: 12,
    marginBottom: 8,
  },
  slideLabelNew: {
    position: 'absolute',
    width: '100%',
    textAlign: 'center',
    zIndex: 1,
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  sliderKnobNew: {
    position: 'absolute',
    top: 4,
    left: 4,
    height: 48,
    width: 48,
    backgroundColor: '#fff',
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
    elevation: 3,
  },
  chevron: {
    width: 12,
    height: 12,
    borderTopWidth: 2,
    borderRightWidth: 2,
    borderColor: '#183d2b',
    transform: [{ rotate: '45deg' }],
  },
  completeMessage: {
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '700',
    color: '#183d2b',
    marginTop: 20,
    opacity: 0.9,
  },
  messageBox: {
    paddingVertical: 20,
    alignItems: 'center',
  },
});
