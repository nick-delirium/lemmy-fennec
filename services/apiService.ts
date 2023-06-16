import {
  LemmyHttp,
  GetPosts,
  GetPostsResponse,
  Login,
  LoginResponse,
  CreatePostLike,
  GetPersonDetails
} from 'lemmy-js-client';

export default class ApiService {
  constructor(private readonly client: LemmyHttp) {
  }

  getPosts(filters: GetPosts): Promise<GetPostsResponse> {
    return this.client.getPosts(filters)
  }

  login(form: Login): Promise<LoginResponse> {
    return this.client.login(form)
  }

  getProfile(form: GetPersonDetails) {
    return this.client.getPersonDetails(form)
  }

  ratePost(form: CreatePostLike) {
    if (!form.auth) {
      throw new Error('No jwt token for likePost');
    }
    return this.client.likePost(form)
  }
}
