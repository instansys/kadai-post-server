# バックエンド実装について（フロントエンド応募者向け情報）

## GraphQL サーバー

フロントエンド課題用のGraphQLサーバーを用意しています。認証は不要で、すぐに利用できます。

### エンドポイント

```
https://kadai-post-server-o8swk2av3-instansys.vercel.app/api/graphql
```

**初回アクセス時の注意**: Vercelのデプロイメント保護が有効な場合、認証画面が表示される可能性があります。その場合は以下のいずれかで対応してください:
- 課題提供者にデプロイメント保護の解除を依頼
- または、提供されているローカル開発サーバーを使用

---

## 技術スタック

- **サーバー**: Node.js + Apollo Server 4
- **ホスティング**: Vercel Serverless Functions
- **データストア**: インメモリ（サーバー再起動で初期データに戻る）

---

## 利用可能な API

課題で実装すべき全ての機能に対応しています。

### Query
- `posts: [Post!]!` - 全記事を取得（投稿日時降順）
- `post(id: ID!): Post` - 特定の記事を取得
- `user(id: ID!): User` - 特定のユーザーを取得

### Mutation
- `createPost(input: CreatePostInput!): Post!` - 新規記事を作成

### 重要なポイント
- `Post.author` はサブリゾルバで実装されています
- 必ず `author { name, avatarUrl }` をサブクエリとして含めてください
- `posts` は投稿日時の降順で返されます

---

## クイックスタート

### 1. Apollo Client のセットアップ

```bash
npm install @apollo/client graphql
```

```typescript
import { ApolloClient, InMemoryCache, HttpLink } from '@apollo/client';

const client = new ApolloClient({
  link: new HttpLink({
    uri: 'https://kadai-post-server-o8swk2av3-instansys.vercel.app/api/graphql',
  }),
  cache: new InMemoryCache(),
});
```

### 2. 記事一覧の取得例

```typescript
import { useQuery, gql } from '@apollo/client';

const GET_POSTS = gql`
  query GetPosts {
    posts {
      id
      title
      publishedAt
      tags
      author {
        id
        name
        avatarUrl
      }
    }
  }
`;

function PostList() {
  const { loading, error, data } = useQuery(GET_POSTS);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;

  return (
    <div>
      {data.posts.map((post) => (
        <article key={post.id}>
          <h2>{post.title}</h2>
          <p>By {post.author.name}</p>
          <time>{new Date(post.publishedAt).toLocaleDateString()}</time>
          <div>{post.tags.map(tag => <span key={tag}>{tag}</span>)}</div>
        </article>
      ))}
    </div>
  );
}
```

### 3. 記事作成の例

```typescript
import { useMutation, gql } from '@apollo/client';

const CREATE_POST = gql`
  mutation CreatePost($input: CreatePostInput!) {
    createPost(input: $input) {
      id
      title
      author {
        name
      }
    }
  }
`;

function CreatePostForm() {
  const [createPost] = useMutation(CREATE_POST);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);

    await createPost({
      variables: {
        input: {
          title: formData.get('title'),
          body: formData.get('body'),
          tags: formData.get('tags').split(',').map(t => t.trim()),
          authorId: '1', // 固定または選択可能に
        },
      },
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <input name="title" required />
      <textarea name="body" required />
      <input name="tags" placeholder="react,typescript" />
      <button type="submit">投稿</button>
    </form>
  );
}
```

---

## 初期データ

### ユーザー
- Alice Smith (id: "1")
- Bob Johnson (id: "2")
- Carol Williams (id: "3")

各ユーザーにアバター画像が設定されています。

### 記事
- 3件のサンプル記事（GraphQL、React、API関連）
- 投稿日時の降順で取得されます

---

## ローカル開発（オプション）

Vercelへのアクセスに問題がある場合、ローカルサーバーを起動できます:

```bash
# サーバーリポジトリをクローン
git clone <repository-url>
cd kadai-post-server

# 起動
npm install
npm run dev
```

`http://localhost:3000` で起動するので、Apollo Client のエンドポイントを変更してください。

---

## 詳細なドキュメント

より詳しい利用方法やReactでの実装例は `FRONTEND_GUIDE.md` を参照してください。

---

## 注意事項

- データはインメモリのため、サーバー再起動で初期状態に戻ります
- 本番環境では適切なデータベースとの連携が必要です
- エラーハンドリングとローディング状態の実装を忘れずに
