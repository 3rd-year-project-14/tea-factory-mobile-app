import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Platform,
  Modal,
  TextInput,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { Stack } from 'expo-router';

export const options = { title: 'Profile' };

export default function Profile() {
  const [editVisible, setEditVisible] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [profileImage, setProfileImage] = useState(
    require('../../../../assets/images/propic.jpg')
  );

  const [formData, setFormData] = useState({
    name: 'Shehan Hasaranga',
    employee_id: 'AB123',
    email: 'Shehanhasaranga@gmail.com',
    estate: 'Andaradeniya estate',
    phoneNumber: '070 5678432',
    pickUpAddress: 'No 31, Perera lane, Neluwa',
  });

  const handleImagePick = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      cameraType: ImagePicker.CameraType.front,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled) {
      setProfileImage({ uri: result.assets[0].uri });
    }
  };

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ flexGrow: 1, paddingBottom: 100 }}>
      <View style={styles.profileCard}>
        <View style={styles.avatarWrap}>
          <Image source={profileImage} style={styles.avatar} />
          <TouchableOpacity style={styles.avatarEditButton} onPress={handleImagePick}>
            <MaterialIcons name="edit" size={18} color="#fff" />
          </TouchableOpacity>
        </View>

        <Text style={styles.name}>{formData.name}</Text>

        <View style={styles.detailsBox}>
          {[
            { icon: 'mail-outline', label: 'Email', value: formData.email },
            { icon: 'id-card-outline', label: 'Employee ID', value: formData.employee_id },
            { icon: 'home-outline', label: 'Estate', value: formData.estate },
            { icon: 'call-outline', label: 'Phone', value: formData.phoneNumber },
            { icon: 'location-outline', label: 'Pick up', value: formData.pickUpAddress },
          ].map((item, index) => (
            <View style={styles.detailRow} key={index}>
              <Ionicons name={item.icon} size={18} color="#4e6c50" style={styles.icon} />
              <Text style={styles.label}>{item.label}:</Text>
              <Text style={styles.value}>{item.value}</Text>
            </View>
          ))}
        </View>

        <View style={styles.buttonGroup}>
          <TouchableOpacity style={styles.buttonSecondary} onPress={() => setEditVisible(true)}>
            <MaterialIcons name="edit" size={16} color="#4e6c50" />
            <Text style={styles.buttonTextSecondary}>Edit profile</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.buttonSecondary} onPress={() => setPasswordVisible(true)}>
            <Ionicons name="key-outline" size={16} color="#4e6c50" />
            <Text style={styles.buttonTextSecondary}>Change password</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.buttonLogout}>
            <Ionicons name="log-out-outline" size={18} color="#fff" />
            <Text style={styles.buttonTextLogout}>Logout</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* ─── Edit Profile Modal ─────────────────────────────── */}
      <Modal visible={editVisible} animationType="slide" transparent>
        <TouchableOpacity
          activeOpacity={1}
          onPressOut={() => setEditVisible(false)}
          style={styles.modalContainer}
        >
          <TouchableOpacity activeOpacity={1} style={styles.modalContent} onPress={() => {}}>
            <Text style={styles.modalTitle}>Edit Profile</Text>

            {/* Labeled Inputs */}
            <View style={styles.labeledInput}>
              <Text style={styles.inputLabel}>Full Name</Text>
              <TextInput
                style={[styles.input, styles.disabledInput]}
                value={formData.name}
                editable={false}
              />
            </View>

            <View style={styles.labeledInput}>
              <Text style={styles.inputLabel}>Employee ID</Text>
              <TextInput
                style={[styles.input, styles.disabledInput]}
                value={formData.employee_id}
                editable={false}
              />
            </View>

            <View style={styles.labeledInput}>
              <Text style={styles.inputLabel}>Email</Text>
              <TextInput
                style={[styles.input, styles.disabledInput]}
                value={formData.email}
                editable={false}
              />
            </View>

            <View style={styles.labeledInput}>
              <Text style={styles.inputLabel}>Home Address</Text>
              <TextInput
                style={[styles.input, styles.disabledInput]}
                value={formData.estate}
                editable={false}
              />
            </View>

            <View style={styles.labeledInput}>
              <Text style={styles.inputLabel}>Phone Number</Text>
              <TextInput
                style={styles.input}
                value={formData.phoneNumber}
                keyboardType="phone-pad"
                onChangeText={(text) => handleChange('phoneNumber', text)}
              />
            </View>

            <View style={styles.labeledInput}>
              <Text style={styles.inputLabel}>Pick-up Address</Text>
              <TextInput
                style={styles.input}
                value={formData.pickUpAddress}
                onChangeText={(text) => handleChange('pickUpAddress', text)}
              />
            </View>

            <TouchableOpacity style={styles.modalButton} onPress={() => setEditVisible(false)}>
              <Text style={styles.modalButtonText}>Save</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      {/* ─── Change Password Modal ───────────────────────────── */}
      <Modal visible={passwordVisible} animationType="slide" transparent>
        <TouchableOpacity
          activeOpacity={1}
          onPressOut={() => setPasswordVisible(false)}
          style={styles.modalContainer}
        >
          <TouchableOpacity activeOpacity={1} style={styles.modalContent} onPress={() => {}}>
            <Text style={styles.modalTitle}>Change Password</Text>

            <TextInput
              style={styles.input}
              placeholder="Enter current password"
              placeholderTextColor="#565656ff"
              secureTextEntry
            />
            <TextInput
              style={styles.input}
              placeholder="Enter new password"
              placeholderTextColor="#565656ff"
              secureTextEntry
            />
            <TextInput
              style={styles.input}
              placeholder="Confirm new password"
              placeholderTextColor="#565656ff"
              secureTextEntry
            />

            <TouchableOpacity style={styles.modalButton} onPress={() => setPasswordVisible(false)}>
              <Text style={styles.modalButtonText}>Change</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </ScrollView>
  );
}

// ─── Styles ─────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f1f5f1',
    flex: 1,
  },
  profileCard: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    margin: 20,
    paddingVertical: 30,
    paddingHorizontal: 24,
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.05,
        shadowRadius: 12,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  avatarWrap: {
    position: 'relative',
    marginBottom: 18,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#eee',
  },
  avatarEditButton: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    backgroundColor: '#183d2b',
    borderRadius: 18,
    padding: 5,
    borderWidth: 2,
    borderColor: '#fff',
  },
  name: {
    fontSize: 24,
    fontWeight: '600',
    color: '#183d2b',
    marginBottom: 20,
    letterSpacing: 0.5,
  },
  detailsBox: {
    width: '100%',
    borderTopWidth: 1,
    borderColor: '#e0e6e1',
    paddingTop: 16,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  icon: {
    marginRight: 8,
    marginTop: 2,
  },
  label: {
    fontSize: 15,
    color: '#7aa07a',
    fontWeight: '600',
    minWidth: 80,
  },
  value: {
    fontSize: 15,
    color: '#334533',
    flex: 1,
    flexWrap: 'wrap',
  },
  buttonGroup: {
    marginTop: 30,
    width: '100%',
  },
  buttonSecondary: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#eff5ee',
    paddingVertical: 14,
    borderRadius: 12,
    marginBottom: 12,
    justifyContent: 'center',
    borderColor: '#ccdacc',
    borderWidth: 1.5,
  },
  buttonTextSecondary: {
    fontSize: 15,
    fontWeight: '600',
    color: '#4e6c50',
    marginLeft: 8,
  },
  buttonLogout: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#183d2b',
    paddingVertical: 15,
    borderRadius: 14,
    justifyContent: 'center',
  },
  buttonTextLogout: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
    letterSpacing: 1,
    marginLeft: 8,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#183d2b',
    marginBottom: 20,
  },
  labeledInput: {
    marginBottom: 14,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#183d2b',
    marginBottom: 6,
    marginLeft: 2,
  },
  input: {
    backgroundColor: '#f3f6f2',
    padding: 12,
    borderRadius: 10,
    fontSize: 15,
    color: '#183d2b',
  },
  disabledInput: {
    opacity: 0.5,
  },
  modalButton: {
    backgroundColor: '#183d2b',
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 16,
  },
  modalButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
});
