# Mini Blog GraphQL Server

フロントエンド/フルスタック採用課題用のGraphQLサーバーです。

## 使用技術

- Node.js (v18以上)
- Apollo Server 4
- GraphQL
- Vercel (ホスティング)

## 起動方法

### ローカル環境

```bash
# 依存関係のインストール
npm install

# 開発サーバー起動
npm run dev
```

サーバーは `http://localhost:3000` で起動します。

### テスト実行

```bash
npm test
```

## GraphQL エンドポイント

### ローカル
- `http://localhost:3000`

### Vercel デプロイ後
- `https://your-app.vercel.app/api/graphql`

## Vercel へのデプロイ

```bash
# Vercel CLI のインストール（未インストールの場合）
npm i -g vercel

# デプロイ
vercel

# 本番デプロイ
vercel --prod
```

デプロイ後、`https://your-app.vercel.app/api/graphql` でGraphQLサーバーにアクセスできます。

## 実装済み機能

### Query
- ✅ `posts: [Post!]!` - 全記事一覧を取得（投稿日時降順）
- ✅ `post(id: ID!): Post` - 特定記事を取得
- ✅ `user(id: ID!): User` - 特定ユーザーを取得

### Mutation
- ✅ `createPost(input: CreatePostInput!): Post!` - 新規記事作成

### サブリゾルバ
- ✅ `Post.author` - 記事の著者情報を解決

## サンプルクエリ

### 記事一覧取得

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

### 記事詳細取得

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

### 記事作成

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

変数:
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

## データストア

現在はインメモリでデータを保持しています。サーバー再起動時にデータはリセットされます。

### 初期データ

**ユーザー:**
- Alice Smith (id: 1)
- Bob Johnson (id: 2)
- Carol Williams (id: 3)

**記事:**
- 3件のサンプル記事が登録済み

## 完成度

### 実装済み
- ✅ GraphQL スキーマ定義
- ✅ Query リゾルバ（posts, post, user）
- ✅ Mutation リゾルバ（createPost）
- ✅ Post.author サブリゾルバ
- ✅ 投稿日時降順ソート
- ✅ サンプルデータ
- ✅ Vercel 対応設定
- ✅ テストスクリプト

### 未実装
- データベース連携（現在はインメモリ）
- 認証・認可機能
- ページネーション
