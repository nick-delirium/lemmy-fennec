// Lemmy mentions look like "!community@instance.tld" and "@user@instance.tld".
// marked's GFM email autolinker drops the leading "!"/"@" into a plain text token
// and turns the rest into "mailto:community@instance.tld", so pressing a mention
// opens the mail app instead of the community/user. Mentions are rewritten into
// explicit links before the markdown is parsed, so no email token is produced.

export const COMMUNITY_SCHEME = "lemmy://community/";
export const USER_SCHEME = "lemmy://user/";

// lemmy only allows [a-zA-Z0-9_] in actor names
const NAME = "[a-zA-Z0-9_]+";
const INSTANCE = "(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?\\.)+[a-zA-Z]{2,}";

// markdown constructs whose contents must be left alone
const PROTECTED_MD =
  /(```[\s\S]*?```|~~~[\s\S]*?~~~|`[^`\n]*`|!?\[[^\]\n]*\]\([^)\s]*\)|<[^>\s]*>|(?:https?:\/\/|www\.)\S+)/g;

const MENTION = new RegExp(
  `(^|[\\s(*_~>"',])([!@])(${NAME})@(${INSTANCE})`,
  "g",
);

const linkifyChunk = (chunk: string) =>
  chunk.replace(MENTION, (_match, before, sigil, name, instance) => {
    const scheme = sigil === "!" ? COMMUNITY_SCHEME : USER_SCHEME;
    return `${before}[${sigil}${name}@${instance}](${scheme}${name}@${instance})`;
  });

/**
 * Turns bare "!community@instance" / "@user@instance" mentions into markdown
 * links pointing at an internal scheme, so the markdown renderer never sees
 * them as email addresses. Code blocks, existing links and urls are untouched.
 */
export function linkifyMentions(value: string): string {
  if (!value || !value.includes("@")) return value;
  return value
    .split(PROTECTED_MD)
    .map((part, index) => (index % 2 === 0 ? linkifyChunk(part) : part))
    .join("");
}
