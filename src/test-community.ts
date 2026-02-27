/**
 * Manual test script for Community API
 * Run with: ts-node src/test-community.ts
 */

import axios from 'axios';

const API_BASE = 'http://localhost:3000/api/community';

async function testCommunityAPI() {
  console.log('🧪 Testing Community API...\n');

  try {
    // 1. Create a post
    console.log('1️⃣ Creating post...');
    const postResponse = await axios.post(`${API_BASE}/post`, {
      userId: 'user-1',
      content: 'Hello from the community! 🎉',
      images: ['https://example.com/image.jpg']
    });
    
    console.log('✅ Post created:', postResponse.data.post.id);
    const postId = postResponse.data.post.id;

    // 2. Get feed
    console.log('\n2️⃣ Getting feed...');
    const feedResponse = await axios.get(`${API_BASE}/feed?limit=10`);
    console.log('✅ Feed retrieved:', feedResponse.data.posts.length, 'posts');

    // 3. Like the post
    console.log('\n3️⃣ Liking post...');
    await axios.post(`${API_BASE}/post/${postId}/like`, {
      userId: 'user-2'
    });
    console.log('✅ Post liked');

    // 4. Add comment
    console.log('\n4️⃣ Adding comment...');
    const commentResponse = await axios.post(`${API_BASE}/post/${postId}/comment`, {
      userId: 'user-2',
      content: 'Great post! 👍'
    });
    console.log('✅ Comment added:', commentResponse.data.comment.id);

    // 5. Get post details
    console.log('\n5️⃣ Getting post details...');
    const postDetailsResponse = await axios.get(`${API_BASE}/post/${postId}`);
    console.log('✅ Post details:');
    console.log('   Likes:', postDetailsResponse.data.post.likes.length);
    console.log('   Comments:', postDetailsResponse.data.post.comments.length);

    // 6. Create a group
    console.log('\n6️⃣ Creating group...');
    const groupResponse = await axios.post(`${API_BASE}/group`, {
      name: 'Tech Creators',
      description: 'A community for tech content creators',
      ownerId: 'user-1'
    });
    console.log('✅ Group created:', groupResponse.data.group.id);
    const groupId = groupResponse.data.group.id;

    // 7. Join group
    console.log('\n7️⃣ Joining group...');
    await axios.post(`${API_BASE}/group/${groupId}/join`, {
      userId: 'user-2'
    });
    console.log('✅ Joined group');

    // 8. List groups
    console.log('\n8️⃣ Listing groups...');
    const groupsResponse = await axios.get(`${API_BASE}/groups`);
    console.log('✅ Groups:', groupsResponse.data.groups.length);

    // 9. Create post in group
    console.log('\n9️⃣ Creating post in group...');
    const groupPostResponse = await axios.post(`${API_BASE}/post`, {
      userId: 'user-2',
      content: 'Hello group members!',
      groupId: groupId
    });
    console.log('✅ Group post created:', groupPostResponse.data.post.id);

    // 10. Follow user
    console.log('\n🔟 Following user...');
    await axios.post(`${API_BASE}/user/user-1/follow`, {
      userId: 'user-2'
    });
    console.log('✅ User followed');

    console.log('\n🎉 All tests passed!');
    process.exit(0);

  } catch (error: any) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    process.exit(1);
  }
}

// Run tests
console.log('⚠️  Make sure the server is running (npm run dev)\n');
setTimeout(() => {
  testCommunityAPI();
}, 1000);
