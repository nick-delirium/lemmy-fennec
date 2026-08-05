import React, { isValidElement } from "react";
import { Linking, TextStyle, useColorScheme } from "react-native";

import { useTheme } from "@react-navigation/native";
import { useNavigation } from "@react-navigation/native";
import Markdown, { Renderer } from "react-native-marked";

import { Text, TouchableOpacity } from "../ThemedComponents";
import { mdTheme } from "../commonStyles";
import { apiClient } from "../store/apiClient";
import {
  COMMUNITY_SCHEME,
  USER_SCHEME,
  linkifyMentions,
} from "../utils/lemmyLinks";

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
    // "!community@instance" / "@user@instance", rewritten by linkifyMentions
    if (href.startsWith(COMMUNITY_SCHEME)) {
      return this.navigation.navigate("Community", {
        name: href.slice(COMMUNITY_SCHEME.length),
      });
    }
    if (href.startsWith(USER_SCHEME)) {
      return this.navigation.navigate("User", {
        username: href.slice(USER_SCHEME.length),
      });
    }

    // getting the domain
    const hrefDomain = href.split("/")[2];

    const isLocalLink = hrefDomain
      ? apiClient.getCurrentInstance().includes(hrefDomain)
      : false;
    // regexp to match "(@/!)text@instance.com"
    const isForeign = /^[@!]?[^@\s]+@[^@\s]+\.[^@\s]+$/.test(text);
    // a slug can already carry its instance ("name@instance"), only the bare
    // ones need the instance taken from the link text
    const qualify = (slug: string) =>
      !slug.includes("@") && isForeign
        ? `${slug}${extractInstance(text)}`
        : slug;

    if (isLocalLink) {
      // https://lemmyinst.any/post/123
      if (href.includes("/post/")) {
        const parts = href.split("/");
        const postId = parts[parts.length - 1];
        return this.navigation.navigate("Post", { post: postId });
      }
      // https://lemmyinst.any/c/commname
      if (href.includes("/c/")) {
        const parts = href.split("/");
        return this.navigation.navigate("Community", {
          name: qualify(parts[parts.length - 1]),
        });
      }
      // https://lemmyinst.any/u/username
      if (href.includes("/u/")) {
        const parts = href.split("/");
        return this.navigation.navigate("User", {
          username: qualify(parts[parts.length - 1]),
        });
      }
    }
    // any other link that hasn't been handled or is not local to the instance
    return Linking.openURL(href)
      .then(() => console.log("URL opened"))
      .catch((e) => {
        console.warn("URL can't be opened", e);
      });
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
  const content = React.useMemo(() => linkifyMentions(value), [value]);
  return (
    <Markdown
      value={content}
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
