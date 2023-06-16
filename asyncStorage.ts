import AsyncStorage from '@react-native-async-storage/async-storage';

export const dataKeys = {
  instance: '@instance',
  login: '@login',
  username: '@username',
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
      // error reading value
    }
  }

  setData = async (key: DataValues, value: string) => {
    try {
      await AsyncStorage.setItem(key, value)
    } catch (e) {
      // saving error
    }
  }

  purge() {
    void AsyncStorage.clear();
  }

  logout() {
    void AsyncStorage.removeItem(dataKeys.login);
    void AsyncStorage.removeItem(dataKeys.username);
  }
}

export const asyncStorageHandler = new AsyncStoragehandler();
