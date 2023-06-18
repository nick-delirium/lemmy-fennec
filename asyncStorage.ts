import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';

export const dataKeys = {
  instance: 'fennec-instance',
  login: 'fennec-login',
  username: 'fennec-username',
  postsLimit: 'fennec-settings-posts-limit',
  filters: 'fennec-filters',
  commentFilters: 'fennec-comment-filters',
} as const

type Keys = keyof typeof dataKeys;
type DataValues = typeof dataKeys[Keys];

class AsyncStoragehandler {
  readData = async (key: DataValues) => {
    try {
      const value = await AsyncStorage.getItem(key)
      if(value !== null) {
        return value;
      } else return null;
    } catch(e) {
      console.error('regular data read:', e)
    }
  }

  setData = async (key: DataValues, value: string) => {
    try {
      await AsyncStorage.setItem(key, value)
    } catch (e) {
      console.error('regular data write:', e)
    }
  }

  setSecureData = async (key, value) => {
    try {
      await SecureStore.setItemAsync(key, value);
    } catch (e) {
      console.error('secure data write:', e)
    }
  }

  readSecureData = async (key) => {
    try {
      const value = await SecureStore.getItemAsync(key);
      if (value !== null) {
        return value;
      } else return null;
    } catch (e) {
      console.error('secure data read:', e)
    }
  }

  purge() {
    void AsyncStorage.clear();
  }

  logout() {
    void SecureStore.deleteItemAsync(dataKeys.login);
    void AsyncStorage.removeItem(dataKeys.username);
  }
}

export const asyncStorageHandler = new AsyncStoragehandler();
