import React from "react";
import { View, StyleSheet, Image, ToastAndroid } from "react-native";
import { Text, TouchableOpacity, Icon } from "../../ThemedComponents";
import { useTheme } from "@react-navigation/native";
import { apiClient, Account as IAccount } from "../../store/apiClient";
import { observer } from "mobx-react-lite";
import { useNavigation } from "@react-navigation/native";
import { commonColors } from "../../commonStyles";
import { asyncStorageHandler, dataKeys } from "../../asyncStorage";
import { LoginResponse } from "lemmy-js-client";

function AddNew() {
  const navigation = useNavigation();

  const openAddAccount = () => {
    // @ts-ignore
    navigation.navigate("AddAccount");
  };
  return (
    <TouchableOpacity simple onPressCb={openAddAccount}>
      <View style={styles.entry}>
        <Icon name={"plus"} size={24} />
        <Text>Add New Account</Text>
      </View>
    </TouchableOpacity>
  );
}

const Account = observer(
  ({ account, isActive }: { account: IAccount; isActive?: boolean }) => {
    const { colors } = useTheme();

    return (
      <View
        style={{
          ...styles.entry,
          backgroundColor: isActive ? colors.border : colors.card,
        }}
      >
        <View
          style={{
            width: 24,
            height: 24,
            borderRadius: 24,
            backgroundColor: "#cecece",
          }}
        >
          {account.avatar ? (
            <Image
              source={{ uri: account.avatar }}
              style={{ width: 24, height: 24, borderRadius: 24 }}
              accessibilityLabel={"Avatar for account: " + account.login}
            />
          ) : null}
        </View>
        <Text style={{ fontSize: 16 }} lines={1}>
          {account.login}
        </Text>
        <View style={{ flex: 1 }} />
        <Text style={{ opacity: 0.6 }} lines={1}>
          {account.instance.replace(/https?:\/\//i, "")}
        </Text>
      </View>
    );
  }
);

function AccountPicker() {
  const { colors } = useTheme();
  const [isOpen, setIsOpen] = React.useState(false);
  const accounts = apiClient.accounts;

  React.useEffect(() => {
    return () => {
      setIsOpen(false);
    };
  }, []);

  const changeAccount = async (account) => {
    const instance = account.instance;
    const username = account.login;

    try {
      await Promise.all([
        asyncStorageHandler.setSecureData(dataKeys.login, account.auth),
        asyncStorageHandler.setData(dataKeys.instance, instance),
        asyncStorageHandler.setData(dataKeys.username, username),
      ]);
      apiClient.createLoggedClient(account.auth, instance, username);
      void apiClient.postStore.getPosts({ jwt: account.auth } as LoginResponse);
    } catch (e) {
      ToastAndroid.showWithGravity(
        "Error changing account",
        ToastAndroid.SHORT,
        ToastAndroid.CENTER
      );
    }
  };

  return (
    <View style={styles.pickerCenterer}>
      <View
        style={{
          ...styles.pickerContainer,
          backgroundColor: colors.card,
          borderColor: colors.border,
        }}
      >
        <TouchableOpacity
          style={styles.entry}
          simple
          onPressCb={() => setIsOpen(!isOpen)}
        >
          <Icon name={isOpen ? "chevron-up" : "chevron-down"} size={24} />
          <Text>Change Account</Text>
        </TouchableOpacity>
        {isOpen ? (
          <>
            {accounts.map((account) => (
              <TouchableOpacity
                key={account.login + account.instance}
                simple
                onPressCb={() => changeAccount(account)}
              >
                <Account
                  account={account}
                  isActive={
                    apiClient.activeJWT === JSON.parse(account.auth).jwt
                  }
                />
              </TouchableOpacity>
            ))}
            <AddNew />
          </>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  entry: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: 8,
    flex: 1,
  },
  pickerContainer: {
    // padding: 8,
    flexDirection: "column",
    gap: 8,
    borderRadius: 6,
    borderWidth: 1,
    width: "90%",
  },
  pickerCenterer: {
    marginTop: 32,
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default observer(AccountPicker);
