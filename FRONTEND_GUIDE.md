# フロントエンドエンジニア向け GraphQL API 利用ガイド

## GraphQL エンドポイント

```
https://kadai-post-server-o8swk2av3-instansys.vercel.app/api/graphql
```

**注意**: 初回アクセス時は、Vercelのデプロイメント保護が有効になっている可能性があります。その場合は、以下のいずれかの対応が必要です:
- Vercelダッシュボード（https://vercel.com/instansys/kadai-post-server/settings）でDeployment Protectionを無効化
- または、開発時はローカルサーバーを使用（後述）

---

## API 仕様

### スキーマ定義

```graphql
scalar DateTime

type User {
  id: ID!
  name: String!
  avatarUrl: String
}

type Post {
  id: ID!
  title: String!
  author: User!
  body: String!
  tags: [String!]!
  publishedAt: DateTime!
}

type Query {
  posts: [Post!]!
  post(id: ID!): Post
  user(id: ID!): User
}

input CreatePostInput {
  title: String!
  body: String!
  tags: [String!]
  authorId: ID!
}

type Mutation {
  createPost(input: CreatePostInput!): Post!
}
```

---

## 利用例

### 1. 記事一覧の取得

**クエリ:**
```graphql
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
```

**レスポンス例:**
```json
{
  "data": {
    "posts": [
      {
        "id": "3",
        "title": "Building Scalable APIs",
        "publishedAt": "2024-03-10T09:15:00.000Z",
        "tags": ["api", "backend", "scalability"],
        "author": {
          "id": "3",
          "name": "Carol Williams",
          "avatarUrl": "https://i.pravatar.cc/150?img=3"
        }
      },
      {
        "id": "2",
        "title": "React Best Practices",
        "publishedAt": "2024-02-20T14:30:00.000Z",
        "tags": ["react", "javascript", "frontend"],
        "author": {
          "id": "2",
          "name": "Bob Johnson",
          "avatarUrl": "https://i.pravatar.cc/150?img=2"
        }
      }
    ]
  }
}
```

**ポイント:**
- 記事は投稿日時の降順（新しい順）で返されます
- `author` フィールドは必ずサブクエリで取得してください

---

### 2. 記事詳細の取得

**クエリ:**
```graphql
query GetPost($id: ID!) {
  post(id: $id) {
    id
    title
    body
    tags
    publishedAt
    author {
      id
      name
      avatarUrl
    }
  }
}
```

**変数:**
```json
{
  "id": "1"
}
```

**レスポンス例:**
```json
{
  "data": {
    "post": {
      "id": "1",
      "title": "Getting Started with GraphQL",
      "body": "GraphQL is a query language for APIs...",
      "tags": ["graphql", "api", "tutorial"],
      "publishedAt": "2024-01-15T10:00:00.000Z",
      "author": {
        "id": "1",
        "name": "Alice Smith",
        "avatarUrl": "https://i.pravatar.cc/150?img=1"
      }
    }
  }
}
```

**エラーケース（記事が存在しない場合）:**
```json
{
  "data": {
    "post": null
  }
}
```

---

### 3. ユーザー情報の取得

**クエリ:**
```graphql
query GetUser($id: ID!) {
  user(id: $id) {
    id
    name
    avatarUrl
  }
}
```

**変数:**
```json
{
  "id": "1"
}
```

**レスポンス例:**
```json
{
  "data": {
    "user": {
      "id": "1",
      "name": "Alice Smith",
      "avatarUrl": "https://i.pravatar.cc/150?img=1"
    }
  }
}
```

---

### 4. 新規記事の作成

**ミューテーション:**
```graphql
mutation CreatePost($input: CreatePostInput!) {
  createPost(input: $input) {
    id
    title
    body
    tags
    publishedAt
    author {
      id
      name
      avatarUrl
    }
  }
}
```

**変数:**
```json
{
  "input": {
    "title": "My New Post",
    "body": "This is the content of my post.",
    "tags": ["example", "test"],
    "authorId": "1"
  }
}
```

**レスポンス例:**
```json
{
  "data": {
    "createPost": {
      "id": "4",
      "title": "My New Post",
      "body": "This is the content of my post.",
      "tags": ["example", "test"],
      "publishedAt": "2025-11-15T16:30:00.000Z",
      "author": {
        "id": "1",
        "name": "Alice Smith",
        "avatarUrl": "https://i.pravatar.cc/150?img=1"
      }
    }
  }
}
```

**ポイント:**
- `publishedAt` はサーバー側で自動的に現在時刻が設定されます
- `tags` は省略可能（省略時は空配列）
- `authorId` は必須で、既存のユーザーID（"1", "2", "3"）を指定してください

---

## React での実装例

### Apollo Client の設定

```bash
npm install @apollo/client graphql
```

```typescript
// src/lib/apolloClient.ts
import { ApolloClient, InMemoryCache, HttpLink } from '@apollo/client';

const httpLink = new HttpLink({
  uri: 'https://kadai-post-server-o8swk2av3-instansys.vercel.app/api/graphql',
});

export const client = new ApolloClient({
  link: httpLink,
  cache: new InMemoryCache(),
});
```

```typescript
// src/App.tsx
import { ApolloProvider } from '@apollo/client';
import { client } from './lib/apolloClient';

function App() {
  return (
    <ApolloProvider client={client}>
      {/* Your components */}
    </ApolloProvider>
  );
}
```

### 記事一覧の取得

```typescript
// src/components/PostList.tsx
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
        <div key={post.id}>
          <h2>{post.title}</h2>
          <p>By {post.author.name}</p>
          <p>{new Date(post.publishedAt).toLocaleDateString()}</p>
          <div>
            {post.tags.map((tag) => (
              <span key={tag}>{tag}</span>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
```

### 記事の作成

```typescript
// src/components/CreatePost.tsx
import { useMutation, gql } from '@apollo/client';
import { useState } from 'react';

const CREATE_POST = gql`
  mutation CreatePost($input: CreatePostInput!) {
    createPost(input: $input) {
      id
      title
      body
      tags
      publishedAt
      author {
        id
        name
      }
    }
  }
`;

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

function CreatePost() {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [tags, setTags] = useState('');

  const [createPost, { loading, error }] = useMutation(CREATE_POST, {
    refetchQueries: [{ query: GET_POSTS }],
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await createPost({
        variables: {
          input: {
            title,
            body,
            tags: tags.split(',').map(tag => tag.trim()).filter(Boolean),
            authorId: '1', // 固定または選択可能に
          },
        },
      });

      // フォームをリセット
      setTitle('');
      setBody('');
      setTags('');

      alert('投稿が作成されました！');
    } catch (err) {
      console.error('投稿の作成に失敗しました:', err);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label>タイトル:</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
      </div>

      <div>
        <label>本文:</label>
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          required
        />
      </div>

      <div>
        <label>タグ (カンマ区切り):</label>
        <input
          type="text"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          placeholder="例: react, typescript, tutorial"
        />
      </div>

      <button type="submit" disabled={loading}>
        {loading ? '投稿中...' : '投稿する'}
      </button>

      {error && <p style={{ color: 'red' }}>エラー: {error.message}</p>}
    </form>
  );
}
```

---

## 初期データ

### ユーザー

| ID | 名前 | アバター |
|----|------|----------|
| 1 | Alice Smith | https://i.pravatar.cc/150?img=1 |
| 2 | Bob Johnson | https://i.pravatar.cc/150?img=2 |
| 3 | Carol Williams | https://i.pravatar.cc/150?img=3 |

### 記事

3件のサンプル記事が登録済み（GraphQL、React、API関連）

---

## ローカル開発環境

Vercelのデプロイメント保護が有効な場合、ローカルでサーバーを起動して開発できます。

```bash
# サーバーリポジトリをクローン
git clone <repository-url>
cd kadai-post-server

# 依存関係をインストール
npm install

# 開発サーバー起動
npm run dev
```

サーバーは `http://localhost:3000` で起動します。

Apollo Client の設定を以下のように変更してください:

```typescript
const httpLink = new HttpLink({
  uri: 'http://localhost:3000',  // ローカル環境用
});
```

---

## トラブルシューティング

### CORS エラーが発生する

サーバー側でCORSを許可しているため、通常は発生しません。もし発生する場合は、以下を確認してください:
- リクエストヘッダーに `Content-Type: application/json` が含まれているか
- リクエストボディが正しいJSON形式か

### 認証エラーが表示される

Vercelのデプロイメント保護が有効になっています。以下のいずれかで対応してください:
1. Vercelダッシュボードで保護を無効化
2. ローカル開発環境を使用

### データが永続化されない

現在、データはインメモリで保持されています。サーバーを再起動すると初期データに戻ります。これは仕様です。

---

## サポート

質問や問題があれば、以下にお問い合わせください:
- GitHubリポジトリのIssue
- Slackチャンネル（社内）
