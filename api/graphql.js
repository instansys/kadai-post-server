import { ApolloServer } from '@apollo/server';

const typeDefs = `
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
`;

// In-memory data store
let users = [
  { id: '1', name: 'Alice Smith', avatarUrl: 'https://i.pravatar.cc/150?img=1' },
  { id: '2', name: 'Bob Johnson', avatarUrl: 'https://i.pravatar.cc/150?img=2' },
  { id: '3', name: 'Carol Williams', avatarUrl: 'https://i.pravatar.cc/150?img=3' }
];

let posts = [
  {
    id: '1',
    title: 'Getting Started with GraphQL',
    authorId: '1',
    body: 'GraphQL is a query language for APIs and a runtime for fulfilling those queries with your existing data. GraphQL provides a complete and understandable description of the data in your API.',
    tags: ['graphql', 'api', 'tutorial'],
    publishedAt: new Date('2024-01-15T10:00:00Z').toISOString()
  },
  {
    id: '2',
    title: 'React Best Practices',
    authorId: '2',
    body: 'Learn the best practices for building React applications. This includes component composition, state management, and performance optimization techniques.',
    tags: ['react', 'javascript', 'frontend'],
    publishedAt: new Date('2024-02-20T14:30:00Z').toISOString()
  },
  {
    id: '3',
    title: 'Building Scalable APIs',
    authorId: '3',
    body: 'Designing and building scalable APIs requires careful consideration of architecture, caching strategies, and database optimization.',
    tags: ['api', 'backend', 'scalability'],
    publishedAt: new Date('2024-03-10T09:15:00Z').toISOString()
  }
];

let nextPostId = 4;

const resolvers = {
  Query: {
    posts: () => {
      // Sort by publishedAt descending
      return [...posts].sort((a, b) =>
        new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
      );
    },
    post: (_, { id }) => {
      return posts.find(post => post.id === id) || null;
    },
    user: (_, { id }) => {
      return users.find(user => user.id === id) || null;
    }
  },
  Post: {
    author: (parent) => {
      return users.find(user => user.id === parent.authorId);
    }
  },
  Mutation: {
    createPost: (_, { input }) => {
      const newPost = {
        id: String(nextPostId++),
        title: input.title,
        authorId: input.authorId,
        body: input.body,
        tags: input.tags || [],
        publishedAt: new Date().toISOString()
      };
      posts.push(newPost);
      return newPost;
    }
  }
};

const server = new ApolloServer({
  typeDefs,
  resolvers,
});

await server.start();

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Only allow POST and GET (for GraphQL Playground)
  if (req.method !== 'POST' && req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  // Handle GraphQL request
  try {
    const result = await server.executeOperation({
      query: req.body.query,
      variables: req.body.variables,
      operationName: req.body.operationName,
    });

    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
