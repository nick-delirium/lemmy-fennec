import React, { isValidElement } from "react";
import Markdown, { Renderer } from "react-native-marked";
import { mdTheme } from "../commonStyles";
import { Linking, TextStyle, useColorScheme } from "react-native";
import { useTheme } from "@react-navigation/native";
import { Text, TouchableOpacity } from "../ThemedComponents";
import { useNavigation } from "@react-navigation/native";

const onLinkPress = (url: string) => () => {
  Linking.openURL(url)
    .then(() => null)
    .catch((e) => {
      console.warn("URL can't be opened", e);
    });
};

const hasChildren = (element: React.ReactNode) =>
  isValidElement(element) && Boolean(element.props.children);

const ReactChildrenText = (children): string => {
  if (hasChildren(children)) return ReactChildrenText(children.props.children);
  return children;
};

function extractInstance(inputString) {
  const match = inputString.split("@");
  return `@${match[match.length - 1]}`;
}

class CustomRenderer extends Renderer {
  constructor(private readonly navigation) {
    super();
  }

  handleLinkPress(href: string, text: string) {
    // regexp to match "(@?)text@instance.com"
    const isForeign = /^@?.+@.+\..+$/.test(text);
    console.log(isForeign, text, href);
    // https://lemmyinst.any/post/123
    if (href.includes("post/")) {
      const parts = href.split("/");
      const postId = parts[parts.length - 1];
      return this.navigation.navigate("Post", { post: postId });
    }
    // https://lemmyinst.any/c/commname
    if (href.includes("c/")) {
      const parts = href.split("/");
      const communityName = parts[parts.length - 1];
      const name = isForeign
        ? `${communityName}${extractInstance(text)}`
        : communityName;
      return this.navigation.navigate("Community", { name });
    }
    // https://lemmyinst.any/u/username
    if (href.includes("u/")) {
      const parts = href.split("/");
      const username = parts[parts.length - 1];
      const name = isForeign ? `${username}${extractInstance(text)}` : username;
      return this.navigation.navigate("User", { username: name });
    }
    // any other link that hasn't been handled
    return onLinkPress(href);
  }

  link(
    children: string | React.ReactNode[],
    href: string,
    styles?: TextStyle
  ): React.ReactNode {
    const text = ReactChildrenText(children[0]);
    return (
      <Text
        selectable
        accessibilityRole="link"
        accessibilityHint="Opens in a new window"
        key={this.getKey()}
        onPress={() => this.handleLinkPress(href, text)}
        style={styles}
      >
        {children}
      </Text>
    );
  }

  linkImage(href: string, imageUrl: string, alt?: string, style?: any) {
    if (imageUrl.endsWith(".svg")) {
      return (
        <TouchableOpacity
          key={this.getKey()}
          style={{ ...style, width: "100%" }}
          onPressCb={() => Linking.openURL(href)}
        >
          <Text>{alt}</Text>
        </TouchableOpacity>
      );
    } else {
      return super.linkImage(href, imageUrl, alt, style);
    }
  }
}

function MdRenderer({ value }) {
  const navigation = useNavigation();
  const RendererEx = new CustomRenderer(navigation);

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
      renderer={RendererEx}
      theme={{
        colors: themeWithBg,
      }}
    />
  );
}

export default React.memo(MdRenderer);
