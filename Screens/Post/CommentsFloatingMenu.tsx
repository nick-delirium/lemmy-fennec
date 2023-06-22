import React from 'react';
import { View, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useTheme, Theme } from "@react-navigation/native";
import { observer } from "mobx-react-lite";
import { apiClient } from "../../store/apiClient";
import { Icon, Text } from '../../ThemedComponents'
import { CommentSortTypeMap } from "../../store/commentsStore";

// I know its basically a copy paste of Feed FAB but I'm very lazy

function splitCamelCase(str: string) {
  return str.replace(/([a-z])([A-Z])/g, '$1 $2')
}
const sortTypes = Object.values(CommentSortTypeMap).map(type => ({ label: splitCamelCase(type), value: type }))

function CommentsFloatingMenu({ isLoading }: { isLoading: boolean }) {
  const { colors } = useTheme();
  const [ isSortOpen, setIsSortOpen ] = React.useState(false)
  const [ isOpen, setIsOpen ] = React.useState(false)

  const switchToSort = () => {
    setIsSortOpen(true)
    setIsOpen(false)
  }
  const openMenu = () => {
    setIsOpen(true)
    setIsSortOpen(false)
  }
  const closeAll = () => {
    setIsOpen(false)
    setIsSortOpen(false)
  }

  return (
    <View style={styles.container}>
      {isSortOpen ? <SortMenu colors={colors} closeSelf={closeAll} /> : null}
      {isOpen ? (
        <View style={{ ...styles.menu, backgroundColor: colors.border }}>
          <TouchableOpacity onPress={() => switchToSort()}>
            <Text style={{ fontWeight: '500' }}>Change sorting type</Text>
          </TouchableOpacity>
        </View>
      ) : null}
      {isLoading ? (
        <View style={{ ...styles.button, backgroundColor: colors.border }}>
          <ActivityIndicator color={colors.background} />
        </View>
      ) : (
        <TouchableOpacity onPress={() => isOpen ? closeAll() : openMenu()}>
          <View style={{ ...styles.button, backgroundColor: colors.border }}>
            <Icon name={isOpen ? "x" : "menu"} size={24} />
          </View>
        </TouchableOpacity>
      )}
    </View>
  )
}

function SortMenu({ colors, closeSelf }: { colors: Theme['colors'], closeSelf: () => void }) {
  const setSorting = (sort: typeof CommentSortTypeMap[keyof typeof CommentSortTypeMap]) => {
    void apiClient.commentsStore.setFilters({ sort: sort })
    void apiClient.commentsStore.getComments(apiClient.postStore.singlePost.post.id, apiClient.loginDetails)
    closeSelf()
  }

  return (
    <View style={{ ...styles.menu, backgroundColor: colors.border }}>
      {sortTypes.map((type) => (
        <TouchableOpacity key={type.value} onPress={() => setSorting(type.value)}>
          <Text style={{ fontWeight: '500' }}>{type.label}</Text>
        </TouchableOpacity>
      ))}
    </View>
  )
}

const styles = StyleSheet.create({
  button: {
    padding: 12,
    maxWidth: 46,
    alignItems: 'center',
    borderRadius: 24,
  },
  menu: {
    flexDirection: 'column',
    gap: 16,
    padding: 12,
    borderRadius: 6,
    minWidth: 130,
  },
  container: {
    position: 'absolute',
    alignItems: 'flex-end',
    // when input added
    // bottom: 84,
    bottom: 21,
    right: 16,
    gap: 12,
  }
})

export default observer(CommentsFloatingMenu);