import {
  LemmyHttp,
  GetPosts,
  GetPostsResponse,
  Login,
  LoginResponse,
  CreatePostLike,
  GetPersonDetails,
  GetComments,
  SavePost,
  CreateCommentLike,
  GetSite,
  MarkPostAsRead,
  SaveUserSettings,
  Search,
  GetCommunity,
  GetPost,
  ListCommunities,
  FollowCommunity,
  GetUnreadCount,
  GetReplies,
  MarkCommentReplyAsRead,
  MarkAllAsRead,
  CreatePost,
  DeletePost,
  CreateComment,
  GetPersonMentions,
  GetPrivateMessages,
  CreatePrivateMessage,
  DeletePrivateMessage,
  EditPrivateMessage,
} from "lemmy-js-client";

// !!!TODO!!!
// split this crap into multiple services once app will be more or less close to MVP

export default class ApiService {
  constructor(private readonly client: LemmyHttp) {}

  getPosts(filters: GetPosts): Promise<GetPostsResponse> {
    return this.client.getPosts(filters);
  }

  getSinglePost(form: GetPost) {
    return this.client.getPost(form);
  }

  login(form: Login): Promise<LoginResponse> {
    return this.client.login(form);
  }

  getProfile(form: GetPersonDetails) {
    return this.client.getPersonDetails(form);
  }

  getComments(form: GetComments) {
    return this.client.getComments(form);
  }

  savePost(form: SavePost) {
    if (!form.auth) {
      throw new Error("No jwt token for savePost");
    }
    return this.client.savePost(form);
  }

  ratePost(form: CreatePostLike) {
    if (!form.auth) {
      throw new Error("No jwt token for likePost");
    }
    return this.client.likePost(form);
  }

  rateComment(form: CreateCommentLike) {
    if (!form.auth) {
      throw new Error("No jwt token for likeComment");
    }
    return this.client.likeComment(form);
  }

  getGeneralData(form: GetSite) {
    return this.client.getSite(form);
  }

  markPostRead(form: MarkPostAsRead) {
    if (!form.auth) {
      throw new Error("No jwt token for markPostRead");
    }
    return this.client.markPostAsRead(form);
  }

  saveUserSettings(form: SaveUserSettings) {
    if (!form.auth) {
      throw new Error("No jwt token for saveUserSettings");
    }
    return this.client.saveUserSettings(form);
  }

  search(form: Search) {
    return this.client.search(form);
  }

  fetchCommunity(form: GetCommunity) {
    return this.client.getCommunity(form);
  }

  followCommunity(form: FollowCommunity) {
    if (!form.auth) {
      throw new Error("No jwt token for followCommunity");
    }
    return this.client.followCommunity(form);
  }

  getCommunities(form: ListCommunities) {
    return this.client.listCommunities(form);
  }

  getUnreads(form: GetUnreadCount) {
    return this.client.getUnreadCount(form);
  }

  getReplies(form: GetReplies) {
    return this.client.getReplies(form);
  }

  getMentions(form: GetPersonMentions) {
    return this.client.getPersonMentions(form);
  }

  getMessages(form: GetPrivateMessages) {
    return this.client.getPrivateMessages(form);
  }

  markReplyRead(form: MarkCommentReplyAsRead) {
    return this.client.markCommentReplyAsRead(form);
  }

  markAllRead(form: MarkAllAsRead) {
    return this.client.markAllAsRead(form);
  }

  createComment(form: CreateComment) {
    return this.client.createComment(form);
  }

  createPost(form: CreatePost) {
    return this.client.createPost(form);
  }

  deletePost(form: DeletePost) {
    return this.client.deletePost(form);
  }

  createPrivateMessage(form: CreatePrivateMessage) {
    return this.client.createPrivateMessage(form);
  }

  deletePrivateMessage(form: DeletePrivateMessage) {
    return this.client.deletePrivateMessage(form);
  }

  editPrivateMessage(form: EditPrivateMessage) {
    return this.client.editPrivateMessage(form);
  }
}
