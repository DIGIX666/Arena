import AsyncStorage from '@react-native-async-storage/async-storage';

class SecureStorageService {
  async setItem(key: string, value: string): Promise<void> {
    try {
      // Pour le développement, on utilise AsyncStorage
      // En production, vous pourriez vouloir utiliser expo-secure-store
      await AsyncStorage.setItem(key, value);
    } catch (error) {
      console.error('Error storing item:', error);
      throw error;
    }
  }

  async getItem(key: string): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(key);
    } catch (error) {
      console.error('Error retrieving item:', error);
      return null;
    }
  }

  async removeItem(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(key);
    } catch (error) {
      console.error('Error removing item:', error);
      throw error;
    }
  }

  async hasItem(key: string): Promise<boolean> {
    try {
      const value = await AsyncStorage.getItem(key);
      return value !== null;
    } catch (error) {
      console.error('Error checking item:', error);
      return false;
    }
  }
}

export const secureStorage = new SecureStorageService();
