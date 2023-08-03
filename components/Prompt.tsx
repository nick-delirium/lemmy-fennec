import React from "react";
import { View, StyleSheet, ActivityIndicator } from "react-native";
import { Text, TouchableOpacity, TextInput } from "../ThemedComponents";
import { useTheme } from "@react-navigation/native";
import { ReportMode } from "../store/apiClient";

function Prompt({ title, text, placeholder, onSubmit, onCancel, reportMode }) {
  const [isLoading, setIsLoading] = React.useState(false);
  const [value, setValue] = React.useState("");
  const { colors } = useTheme();

  React.useEffect(() => {
    setIsLoading(false);
    setValue("");
  }, []);

  const submit = () => {
    setIsLoading(true);
    onSubmit(value);
  };

  console.log(reportMode);
  return (
    <View style={{ ...styles.container, backgroundColor: colors.card }}>
      {[ReportMode.Post, ReportMode.Comment].includes(reportMode) ? (
        <>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.text}>{text}</Text>
          <TextInput
            style={styles.input}
            placeholder={placeholder || "Reason"}
            value={value}
            onChangeText={(text) => setValue(text)}
            autoCapitalize="none"
            autoCorrect
            accessibilityLabel={"Prompt text"}
          />
        </>
      ) : (
        <>
          <Text style={styles.title}>Mod action</Text>
          <TextInput
            style={styles.input}
            placeholder={placeholder || "Reason"}
            value={value}
            onChangeText={(text) => setValue(text)}
            autoCapitalize="none"
            autoCorrect
            accessibilityLabel={"Prompt text"}
          />
        </>
      )}
      <View style={styles.buttons}>
        <TouchableOpacity onPressCb={onCancel} style={styles.button}>
          <Text style={styles.buttonText}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity onPressCb={submit} style={styles.button}>
          {isLoading ? (
            <ActivityIndicator />
          ) : (
            <Text style={styles.buttonText}>Submit</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderRadius: 8,
    width: "75%",
    position: "absolute",
    top: "40%",
    left: "12%",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 8,
  },
  text: {
    fontSize: 16,
    marginBottom: 8,
  },
  input: {
    padding: 8,
    borderRadius: 4,
    marginBottom: 8,
  },
  buttons: {
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  button: {
    padding: 8,
    borderRadius: 4,
    marginLeft: 8,
  },
  buttonText: {
    fontSize: 16,
  },
});

export default Prompt;
