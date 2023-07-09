import React from "react";
import Markdown from "react-native-marked";
import { mdTheme } from "../commonStyles";
import { useColorScheme } from "react-native";
import { useTheme } from "@react-navigation/native";

function MdRenderer({ value }) {
  const sch = useColorScheme();
  const { colors } = useTheme();
  const theme = sch === "dark" ? mdTheme.dark : mdTheme.light;

  const themeWithBg = { ...theme, backgroundColor: colors.background };
  return (
    <Markdown
      value={value}
      flatListProps={{
        style: { backgroundColor: colors.background },
      }}
      theme={{
        colors: themeWithBg,
      }}
    />
  );
}

export default React.memo(MdRenderer);
