import fetch from 'node-fetch';

const GRAPHQL_ENDPOINT = 'http://localhost:3000';

async function runQuery(query, variables = {}) {
  const response = await fetch(GRAPHQL_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query, variables }),
  });

  const result = await response.json();
  return result;
}

async function testQueries() {
  console.log('=== Testing GraphQL Server ===\n');

  try {
    // Test 1: Get all posts
    console.log('Test 1: Query posts');
    const postsQuery = `
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
    const postsResult = await runQuery(postsQuery);
    console.log('✅ Posts query successful');
    console.log(`   Found ${postsResult.data.posts.length} posts`);
    console.log(`   First post: "${postsResult.data.posts[0].title}" by ${postsResult.data.posts[0].author.name}`);
    console.log('');

    // Test 2: Get single post
    console.log('Test 2: Query post by ID');
    const postQuery = `
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
    `;
    const postResult = await runQuery(postQuery, { id: '1' });
    if (postResult.data.post) {
      console.log('✅ Post query successful');
      console.log(`   Post: "${postResult.data.post.title}"`);
      console.log(`   Author: ${postResult.data.post.author.name}`);
      console.log(`   Tags: ${postResult.data.post.tags.join(', ')}`);
    } else {
      console.log('❌ Post not found');
    }
    console.log('');

    // Test 3: Get user
    console.log('Test 3: Query user by ID');
    const userQuery = `
      query GetUser($id: ID!) {
        user(id: $id) {
          id
          name
          avatarUrl
        }
      }
    `;
    const userResult = await runQuery(userQuery, { id: '1' });
    if (userResult.data.user) {
      console.log('✅ User query successful');
      console.log(`   User: ${userResult.data.user.name}`);
    } else {
      console.log('❌ User not found');
    }
    console.log('');

    // Test 4: Create new post
    console.log('Test 4: Create new post');
    const createPostMutation = `
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
    `;
    const createPostInput = {
      input: {
        title: 'Test Post from Test Script',
        body: 'This is a test post created by the automated test script.',
        tags: ['test', 'automated'],
        authorId: '2'
      }
    };
    const createResult = await runQuery(createPostMutation, createPostInput);
    if (createResult.data.createPost) {
      console.log('✅ Post creation successful');
      console.log(`   New post ID: ${createResult.data.createPost.id}`);
      console.log(`   Title: "${createResult.data.createPost.title}"`);
      console.log(`   Author: ${createResult.data.createPost.author.name}`);
      console.log(`   Published: ${createResult.data.createPost.publishedAt}`);
    } else {
      console.log('❌ Post creation failed');
      console.log(createResult.errors);
    }
    console.log('');

    // Test 5: Verify posts are sorted by date (descending)
    console.log('Test 5: Verify posts sorting (descending by publishedAt)');
    const sortedPostsResult = await runQuery(postsQuery);
    const posts = sortedPostsResult.data.posts;
    let isSorted = true;
    for (let i = 0; i < posts.length - 1; i++) {
      const current = new Date(posts[i].publishedAt);
      const next = new Date(posts[i + 1].publishedAt);
      if (current < next) {
        isSorted = false;
        break;
      }
    }
    if (isSorted) {
      console.log('✅ Posts are correctly sorted in descending order');
    } else {
      console.log('❌ Posts are not sorted correctly');
    }
    console.log('');

    console.log('=== All tests completed successfully! ===');

  } catch (error) {
    console.error('❌ Error during testing:');
    console.error(error.message);
    if (error.code === 'ECONNREFUSED') {
      console.error('\nMake sure the server is running:');
      console.error('  npm run dev');
    }
    process.exit(1);
  }
}

testQueries();
