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
    phoneNumber: '070 5678432',
    emergencyPhoneNumber: '077 1234567',
    licenseExpiryDate: '2026-10-15',
  });

  // ---- Vehicle State ----
  const [vehicleData, setVehicleData] = useState({
    model: 'Toyota Prius',
    licensePlate: 'ABC-1234',
    image: require('../../../../assets/images/vehicle.jpg'),
  });
  const [vehicleEditVisible, setVehicleEditVisible] = useState(false);

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

  // ---- Vehicle Functions ----
  const handleVehicleImagePick = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      cameraType: ImagePicker.CameraType.back,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });
    if (!result.canceled) {
      setVehicleData((prev) => ({
        ...prev,
        image: { uri: result.assets[0].uri }
      }));
    }
  };

  const handleVehicleChange = (field, value) => {
    setVehicleData((prev) => ({ ...prev, [field]: value }));
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
            { icon: 'home-outline', label: 'Employee ID', value: formData.employee_id },
            { icon: 'call-outline', label: 'Phone', value: formData.phoneNumber },
            { icon: 'call-outline', label: 'Emergency Phone', value: formData.emergencyPhoneNumber },
            { icon: 'calendar-outline', label: 'License Expiry', value: formData.licenseExpiryDate },
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
</View>
        {/* ---- Vehicle Card ---- */}
        <View style={styles.vehicleCard}>
          <Text style={styles.vehicleTitle}>Vehicle Details</Text>
          <View style={styles.vehicleDetailsRow}>
            <Image source={vehicleData.image} style={styles.vehicleImage} />
            <View style={{ flex: 1, marginLeft: 18 }}>
              <Text style={styles.vehicleLabel}>Model/Make:</Text>
              <Text style={styles.vehicleValue}>{vehicleData.model}</Text>
              <Text style={[styles.vehicleLabel, { marginTop: 8 }]}>License Plate:</Text>
              <Text style={styles.vehicleValue}>{vehicleData.licensePlate}</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.vehicleEditButton} onPress={() => setVehicleEditVisible(true)}>
            <MaterialIcons name="edit" size={16} color="#4e6c50" />
            <Text style={styles.buttonTextSecondary}>Edit Vehicle</Text>
          </TouchableOpacity>
        </View>
        {/* ---- End Vehicle Card ---- */}

        <View style={styles.buttonGroup}>
          
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

      {/* ---- Edit Profile Modal ---- */}
      <Modal visible={editVisible} animationType="slide" transparent>
        <TouchableOpacity
          activeOpacity={1}
          onPressOut={() => setEditVisible(false)}
          style={styles.modalContainer}
        >
          <TouchableOpacity activeOpacity={1} style={styles.modalContent} onPress={() => { }}>
            <Text style={styles.modalTitle}>Edit Profile</Text>
            <View style={styles.labeledInput}>
              <Text style={styles.inputLabel}>Full Name</Text>
              <TextInput
                style={[styles.input, styles.disabledInput]}
                value={formData.name}
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
              <Text style={styles.inputLabel}>Employee ID</Text>
              <TextInput
                style={[styles.input, styles.disabledInput]}
                value={formData.employee_id}
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
              <Text style={styles.inputLabel}>Emergency Phone Number</Text>
              <TextInput
                style={styles.input}
                value={formData.emergencyPhoneNumber}
                keyboardType="phone-pad"
                onChangeText={(text) => handleChange('emergencyPhoneNumber', text)}
              />
            </View>

            <View style={styles.labeledInput}>
              <Text style={styles.inputLabel}>License Expiry Date</Text>
              <TextInput
                style={[styles.input, styles.disabledInput]}
                value={formData.licenseExpiryDate}
                editable={false}
              />
            </View>
            <TouchableOpacity style={styles.modalButton} onPress={() => setEditVisible(false)}>
              <Text style={styles.modalButtonText}>Save</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      {/* ---- Change Password Modal ---- */}
      <Modal visible={passwordVisible} animationType="slide" transparent>
        <TouchableOpacity
          activeOpacity={1}
          onPressOut={() => setPasswordVisible(false)}
          style={styles.modalContainer}
        >
          <TouchableOpacity activeOpacity={1} style={styles.modalContent} onPress={() => { }}>
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

      {/* ---- Vehicle Edit Modal ---- */}
      <Modal visible={vehicleEditVisible} animationType="slide" transparent>
        <TouchableOpacity
          activeOpacity={1}
          onPressOut={() => setVehicleEditVisible(false)}
          style={styles.modalContainer}
        >
          <TouchableOpacity activeOpacity={1} style={styles.modalContent} onPress={() => { }}>
            <Text style={styles.modalTitle}>Edit Vehicle</Text>
            <TouchableOpacity style={styles.vehicleImagePicker} onPress={handleVehicleImagePick}>
              <Image source={vehicleData.image} style={styles.vehicleImageEdit} />
              <View style={styles.vehicleImageEditIcon}>
                <MaterialIcons name="edit" size={18} color="#fff" />
              </View>
            </TouchableOpacity>
            <View style={styles.labeledInput}>
              <Text style={styles.inputLabel}>Model / Make</Text>
              <TextInput
                style={styles.input}
                value={vehicleData.model}
                onChangeText={(text) => handleVehicleChange('model', text)}
              />
            </View>
            <View style={styles.labeledInput}>
              <Text style={styles.inputLabel}>License Plate</Text>
              <TextInput
                style={styles.input}
                value={vehicleData.licensePlate}
                onChangeText={(text) => handleVehicleChange('licensePlate', text)}
              />
            </View>
            <TouchableOpacity style={styles.modalButton} onPress={() => setVehicleEditVisible(false)}>
              <Text style={styles.modalButtonText}>Save</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
      {/* ---- End Vehicle Edit Modal ---- */}
    </ScrollView>
  );
}

// ---- Styles ----
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
  vehicleCard: {
    backgroundColor: '#f8faf7',
    borderRadius: 18,
    padding: 18,
    width: '100%',
    marginTop: 24,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#e0e6e1',
  },
  vehicleTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#183d2b',
    marginBottom: 12,
  },
  vehicleDetailsRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 14,
  },
  vehicleImage: {
    width: 80,
    height: 60,
    borderRadius: 10,
    backgroundColor: '#e6e8e4',
  },
  vehicleLabel: {
    fontSize: 14,
    color: '#7aa07a',
    fontWeight: '600',
    marginBottom: 2,
  },
  vehicleValue: {
    fontSize: 15,
    color: '#334533',
    fontWeight: '500',
  },
  vehicleEditButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    borderColor: '#ccdacc',
    borderWidth: 1.2,
    borderRadius: 10,
    backgroundColor: '#eff5ee',
    alignSelf: 'flex-end',
    paddingVertical: 8,
    paddingHorizontal: 18,
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
  vehicleImagePicker: {
    alignSelf: 'center',
    marginBottom: 18,
    position: 'relative',
  },
  vehicleImageEdit: {
    width: 120,
    height: 90,
    borderRadius: 12,
    backgroundColor: '#e6e8e4',
  },
  vehicleImageEditIcon: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: '#183d2b',
    padding: 4,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#fff',
    zIndex: 1,
  },
});