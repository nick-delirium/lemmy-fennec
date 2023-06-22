import React from 'react'
import {View, StyleSheet, Platform, KeyboardAvoidingView, Keyboard, SectionList} from 'react-native'
import {useTheme} from '@react-navigation/native'
import {Icon, TextInput, TouchableOpacity, Text} from '../../ThemedComponents'
import {
  CommunityView,
  CommentView,
  PostView,
  PersonView, SearchResponse
} from 'lemmy-js-client'
import {observer} from 'mobx-react-lite'
import {apiClient} from '../../store/apiClient'
import SearchSettings from "./SearchSettings";
import { Post, User, Community } from "./ListComponents";

interface SearchResult {
  title: "Communities" | "Users" | "Posts" | "Comments"
  data: Record<string, any>[]
}

function SearchScreen() {
  const [searchResults, setSearchResults] = React.useState<SearchResult[] | null>(null)
  const listRef = React.useRef<SectionList>(null)
  const [isFullSearch, setIsFullSearch] = React.useState(false)
  const {colors} = useTheme()
  const placeholder = getRandomPhrase()

  const fetchSearch = () => {
    setIsFullSearch(false)
    Keyboard.dismiss()
    apiClient.searchStore.setLimit(12)
    apiClient.searchStore.fetchSearch(apiClient.loginDetails).then(processData)
  }

  React.useEffect(() => {
    return () => {
      apiClient.searchStore.setSearchQuery('')
      apiClient.searchStore.setLimit(12)
      apiClient.searchStore.setPage(1)
      setSearchResults(null)
    }
  }, [])

  const processData = (data: SearchResponse) => {
    const searchResults: SearchResult[] = []
    if (data.communities.length > 0) {
      searchResults.push({
        title: "Communities",
        data: isFullSearch ? data.communities : data.communities.slice(0, 10)
      })
    }
    if (data.users.length > 0) {
      searchResults.push({
        title: "Users",
        data: isFullSearch ? data.users : data.users.slice(0, 10)
      })
    }
    if (data.posts.length > 0) {
      searchResults.push({
        title: "Posts",
        data: isFullSearch ? data.posts : data.posts.slice(0, 10)
      })
    }

    setSearchResults(searchResults)
  }

  const changeViewType = (type: "Communities" | "Users" | "Posts" | "Comments") => {
    setIsFullSearch(true)
    apiClient.searchStore.setSearchType(type)
    apiClient.searchStore.setPage(1)
    apiClient.searchStore.setLimit(50)
    apiClient.searchStore.fetchSearch(apiClient.loginDetails).then(processData)
  }

  const nextPage = () => {
    listRef.current?.scrollToLocation({ itemIndex: 1, sectionIndex: 1 })
    apiClient.searchStore.setPage(apiClient.searchStore.page + 1)
    apiClient.searchStore.fetchSearch(apiClient.loginDetails).then(processData)
  }

  return (
    <View style={styles.container}>
      <View style={{flex: 1}}>
        <View style={styles.searchPage}>
          <SearchSettings/>
        </View>
        {searchResults ? (
          <SectionList
            style={{ flex: 1 }}
            ref={listRef}
            sections={searchResults}
            refreshing={apiClient.searchStore.isLoading}
            ListFooterComponent={
              <View>
                <TouchableOpacity onPressCb={nextPage}>
                  <Text>Next page</Text>
                </TouchableOpacity>
              </View>
            }
            renderSectionHeader={({section: {title}}) => (
              <View style={{...styles.community, justifyContent: 'space-between'}}>
                <Text style={{fontSize: 18, fontWeight: '500'}}>{title}</Text>
                <TouchableOpacity isOutlined onPressCb={() => changeViewType(title)}>
                  <Text style={{color: colors.primary}}>Show all</Text>
                </TouchableOpacity>
              </View>
            )}
            renderItem={({item, section}) => {
              if (section.title === 'Communities') return <Community sublemmy={item as CommunityView}/>
              if (section.title === 'Users') return <User user={item as PersonView}/>
              if (section.title === 'Posts') return <Post post={item as PostView}/>
            }}
            keyExtractor={(item, ind) => {
              return (item.community?.id || item.person?.id || item.post?.id) + ind + Math.random()
            }}
          />
        ) : null}
      </View>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <View style={{...styles.inputRow, backgroundColor: colors.card}}>
          <TextInput
            style={{flex: 1}}
            placeholder={placeholder}
            value={apiClient.searchStore.searchQuery}
            onChangeText={text => apiClient.searchStore.setSearchQuery(text)}
            autoCapitalize='none'
            autoCorrect={true}
            onSubmitEditing={fetchSearch}
            placeholderTextColor={colors.border}
            keyboardType="default"
            accessibilityLabel={"Search lemmy input"}
          />
          <TouchableOpacity
            style={styles.additionalButtonStyle}
            isSecondary
            onPressCb={fetchSearch}
          >
            <Icon name={"search"} accessibilityLabel={'Send text'} size={24}/>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  )
}


const styles = StyleSheet.create({
  flex: {flex: 1},
  container: {
    flex: 1,
    justifyContent: 'flex-start',
    gap: 4
  },
  searchPage: {padding: 6,},
  searchControls: {borderBottomWidth: 1, flexDirection: 'row', alignItems: 'flex-start', gap: 8},
  inputRow: {paddingHorizontal: 6, paddingVertical: 12, flexDirection: 'row', gap: 6},
  additionalButtonStyle: {justifyContent: 'center'},
  community: {flexDirection: 'row', alignItems: 'center', gap: 8, padding: 4},
  searchItem: {borderBottomWidth: 1, marginBottom: 6, paddingBottom: 6}
})


const phrases = [
  "What is Sublemmy?",
  "Screw u/spez",
  "What does 42 mean?",
  "Dancing cucumbers, anyone",
  "Unicorns on roller skates",
  "Pancake spaceships",
  "Tap-dancing snails",
  "Jetpack-wearing penguins",
  "Sock-eating laundry vortex",
  "Bee Shakespeare fan club",
  "Pickles in kangaroo's pouch",
  "Marshmallow eating contest",
  "Pineapple unicycle rides",
  "Cloud napping daydreams",
  "Goldfish breakdance champions?",
  "Infant solving Rubik's Cube",
  "Acorn-hoarding tax-evading squirrels",
  "Rainbow tickling escapades",
  "Pizza ordering unicorn language",
  "Bee-trained secret agents",
  "Jetpack-powered potato airplanes",
  "Tree vacation playlist",
  "Joke-telling toaster, really?"
] as const;

function getRandomPhrase() {
  return phrases[Math.floor(Math.random() * phrases.length)];
}


export default observer(SearchScreen)