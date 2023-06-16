import { StyleSheet } from "react-native";
import { DarkTheme, DefaultTheme } from "@react-navigation/native";

export const AppTheme = {
  dark: false,
  colors: {
    ...DefaultTheme.colors,
    primary: '#57bcd9',
    border: '#2142AB',
    background: '#effaf6'
  },
};
export const AppDarkTheme = {
  dark: true,
  colors: {
    ...DarkTheme.colors,
    primary: '#2142AB',
    border: '#57bcd9'
  },
};

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  hrefInput: {
    width: "60%",
    padding: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#AADDEC'
  },
  button: {
    borderRadius: 6,
    width: "30%",
    alignItems: 'center',
    backgroundColor: '#AADDEC',
    padding: 8,
  }
});