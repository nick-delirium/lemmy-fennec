import {
  BanFromCommunity,
  BlockCommunity,
  BlockPerson,
  CreateComment,
  CreateCommentLike,
  CreateCommentReport,
  CreatePost,
  CreatePostLike,
  CreatePostReport,
  CreatePrivateMessage,
  DeletePost,
  DeletePrivateMessage,
  EditComment,
  EditPost,
  EditPrivateMessage,
  FeaturePost,
  FollowCommunity,
  GetComments,
  GetCommunity,
  GetPersonDetails,
  GetPersonMentions,
  GetPost,
  GetPosts,
  GetPostsResponse,
  GetPrivateMessages,
  GetReplies,
  GetSite,
  GetUnreadCount,
  LemmyHttp,
  ListCommunities,
  LockPost,
  Login,
  LoginResponse,
  MarkAllAsRead,
  MarkCommentReplyAsRead,
  MarkPostAsRead,
  RemovePost,
  SavePost,
  SaveUserSettings,
  Search,
  UploadImage,
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

  blockCommunity(form: BlockCommunity) {
    return this.client.blockCommunity(form);
  }

  blockPerson(form: BlockPerson) {
    return this.client.blockPerson(form);
  }

  createCommentReport(form: CreateCommentReport) {
    return this.client.createCommentReport(form);
  }

  createPostReport(form: CreatePostReport) {
    return this.client.createPostReport(form);
  }

  editPost(form: EditPost) {
    return this.client.editPost(form);
  }

  editComment(form: EditComment) {
    return this.client.editComment(form);
  }

  uploadImage(form: UploadImage) {
    return this.client.uploadImage(form);
  }

  /* MOD ACTIONS */

  removePost(form: RemovePost) {
    return this.client.removePost(form);
  }

  lockPost(form: LockPost) {
    return this.client.lockPost(form);
  }

  banCommunityUser(form: BanFromCommunity) {
    return this.client.banFromCommunity(form);
  }

  featurePost(form: FeaturePost) {
    return this.client.featurePost(form);
  }
}
