import { StyleSheet } from "react-native";
import { DarkTheme, DefaultTheme } from "@react-navigation/native";

export const AppTheme = {
  dark: false,
  colors: {
    ...DefaultTheme.colors,
    primary: "#2142AB", //57bcd9
    border: "#637ac4",
    background: "#effaf6",
  },
};
export const AppDarkTheme = {
  dark: true,
  colors: {
    ...DarkTheme.colors,
    primary: "#57bcd9", // 2142AB
    border: "#637ac4",
    background: "#1c1c1c",
    card: "#2c2c2c",
  },
};
export const AppAmoledTheme = {
  dark: true,
  colors: {
    ...DarkTheme.colors,
    primary: "#57bcd9", // 2142AB
    border: "#637ac4",
    background: "#000000",
  },
};

export const mdTheme = {
  light: {
    code: "#f6f8fa",
    link: "#58a6ff",
    text: "#333333",
    border: "#d0d7de",
    ...AppTheme.colors,
  },
  dark: {
    code: "#161b22",
    link: "#58a6ff",
    text: "#eeeeee",
    border: "#30363d",
    ...AppDarkTheme.colors,
  },
} as const;

export const commonStyles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  hrefInput: {
    width: "60%",
    padding: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#AADDEC",
  },
  button: {
    borderRadius: 6,
    width: "30%",
    alignItems: "center",
    backgroundColor: "#AADDEC",
    padding: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: "500",
  },
  text: {
    fontSize: 15,
  },
  iconsRow: {
    gap: 12,
    alignItems: "center",
    paddingTop: 8,
    paddingBottom: 8,
  },
  fabButton: {
    padding: 12,
    maxWidth: 46,
    alignItems: "center",
    borderRadius: 24,
  },
  fabMenu: {
    flexDirection: "column",
    gap: 16,
    padding: 12,
    borderRadius: 6,
    minWidth: 130,
  },
  touchableIcon: {
    padding: 3,
  },
});

export const commonColors = {
  author: "orange",
  community: "violet",
  upvote: "red",
  downvote: "blue",
};
