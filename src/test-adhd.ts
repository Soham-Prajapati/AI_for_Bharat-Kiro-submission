/**
 * Manual test script for ADHD Navigator API
 * Run with: ts-node src/test-adhd.ts
 */

import axios from 'axios';

const API_BASE = 'http://localhost:3000/api/adhd';
const userId = 'test-user-1';

async function testADHDAPI() {
  console.log('🧪 Testing ADHD Navigator API...\n');

  try {
    // 1. Start a focus session
    console.log('1️⃣ Starting focus session...');
    const sessionResponse = await axios.post(`${API_BASE}/session/start`, {
      userId,
      taskName: 'Write documentation',
      duration: 25
    });
    
    console.log('✅ Session started:', sessionResponse.data.session.id);
    console.log('   Task:', sessionResponse.data.session.taskName);
    console.log('   Duration:', sessionResponse.data.session.duration, 'minutes');
    const sessionId = sessionResponse.data.session.id;

    // 2. Get session details
    console.log('\n2️⃣ Getting session details...');
    const detailsResponse = await axios.get(`${API_BASE}/session/${sessionId}`);
    console.log('✅ Session details retrieved');
    console.log('   Start time:', detailsResponse.data.session.startTime);
    console.log('   End time:', detailsResponse.data.session.endTime);

    // 3. Complete the session
    console.log('\n3️⃣ Completing session...');
    const completeResponse = await axios.post(`${API_BASE}/session/${sessionId}/complete`);
    console.log('✅', completeResponse.data.message);
    console.log('   Rewards earned:', completeResponse.data.rewards.length);
    
    if (completeResponse.data.rewards.length > 0) {
      completeResponse.data.rewards.forEach((reward: any) => {
        console.log('   🏆', reward.name, '-', reward.description);
      });
    }

    // 4. Get progress
    console.log('\n4️⃣ Getting user progress...');
    const progressResponse = await axios.get(`${API_BASE}/progress/${userId}`);
    console.log('✅ Progress retrieved:');
    console.log('   Level:', progressResponse.data.progress.level);
    console.log('   XP:', progressResponse.data.progress.xp);
    console.log('   Total sessions:', progressResponse.data.progress.totalSessions);
    console.log('   Completed:', progressResponse.data.progress.completedSessions);
    console.log('   Completion rate:', progressResponse.data.progress.completionRate + '%');
    console.log('   Total focus time:', progressResponse.data.progress.totalFocusHours, 'hours');

    // 5. Start another session
    console.log('\n5️⃣ Starting second session...');
    const session2Response = await axios.post(`${API_BASE}/session/start`, {
      userId,
      taskName: 'Code review',
      duration: 25
    });
    console.log('✅ Second session started:', session2Response.data.session.id);
    const session2Id = session2Response.data.session.id;

    // 6. Interrupt the session
    console.log('\n6️⃣ Interrupting session...');
    const interruptResponse = await axios.post(`${API_BASE}/session/${session2Id}/interrupt`);
    console.log('✅', interruptResponse.data.message);

    // 7. Get session history
    console.log('\n7️⃣ Getting session history...');
    const historyResponse = await axios.get(`${API_BASE}/history/${userId}?limit=10`);
    console.log('✅ History retrieved:', historyResponse.data.sessions.length, 'sessions');
    
    historyResponse.data.sessions.slice(0, 3).forEach((session: any, index: number) => {
      console.log(`   ${index + 1}. ${session.taskName} - ${session.completed ? '✓ Completed' : session.interrupted ? '✗ Interrupted' : '⏳ In Progress'}`);
    });

    // 8. Chunk a large task
    console.log('\n8️⃣ Chunking a large task...');
    const chunkResponse = await axios.post(`${API_BASE}/task/chunk`, {
      taskDescription: 'Build entire authentication system',
      estimatedMinutes: 120
    });
    console.log('✅', chunkResponse.data.message);
    console.log('   Total chunks:', chunkResponse.data.totalChunks);
    console.log('   Recommended breaks:', chunkResponse.data.recommendedBreaks);
    
    chunkResponse.data.chunks.forEach((chunk: string, index: number) => {
      console.log(`   ${index + 1}. ${chunk}`);
    });

    // 9. Get recommended break
    console.log('\n9️⃣ Getting recommended break...');
    const breakResponse = await axios.get(`${API_BASE}/break/${userId}`);
    console.log('✅', breakResponse.data.message);
    console.log('   Break duration:', breakResponse.data.recommendedBreakMinutes, 'minutes');

    console.log('\n🎉 All tests passed!');
    console.log('\n📊 Final Stats:');
    const finalProgress = await axios.get(`${API_BASE}/progress/${userId}`);
    console.log('   Level:', finalProgress.data.progress.level);
    console.log('   XP:', finalProgress.data.progress.xp);
    console.log('   Sessions:', finalProgress.data.progress.totalSessions);
    console.log('   Focus time:', finalProgress.data.progress.totalFocusHours, 'hours');

    process.exit(0);

  } catch (error: any) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    process.exit(1);
  }
}

// Run tests
console.log('⚠️  Make sure the server is running (npm run dev)\n');
setTimeout(() => {
  testADHDAPI();
}, 1000);
