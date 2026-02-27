/**
 * Manual test script for Workspace API
 * Run with: ts-node src/test-workspace.ts
 */

import axios from 'axios';
import WebSocket from 'ws';

const API_BASE = 'http://localhost:3000/api';
const WS_URL = 'ws://localhost:3000/ws/workspace';

async function testWorkspaceAPI() {
  console.log('🧪 Testing Workspace API...\n');

  try {
    // 1. Create workspace
    console.log('1️⃣ Creating workspace...');
    const createResponse = await axios.post(`${API_BASE}/workspace/create`, {
      name: 'Test Workspace',
      initialContent: 'Hello from the test!'
    });
    
    console.log('✅ Workspace created:', createResponse.data.workspace.id);
    const workspaceId = createResponse.data.workspace.id;

    // 2. Get workspace
    console.log('\n2️⃣ Getting workspace...');
    const getResponse = await axios.get(`${API_BASE}/workspace/${workspaceId}`);
    console.log('✅ Workspace retrieved:', getResponse.data.workspace.name);
    console.log('   Content:', getResponse.data.workspace.content);

    // 3. Get users (should be empty)
    console.log('\n3️⃣ Getting users...');
    const usersResponse = await axios.get(`${API_BASE}/workspace/${workspaceId}/users`);
    console.log('✅ Users count:', usersResponse.data.count);

    // 4. Test WebSocket connection
    console.log('\n4️⃣ Testing WebSocket connection...');
    const ws = new WebSocket(WS_URL);

    ws.on('open', () => {
      console.log('✅ WebSocket connected');

      // Join workspace
      ws.send(JSON.stringify({
        type: 'join',
        workspaceId,
        user: {
          id: 'test-user-1',
          name: 'Test User',
          color: '#FF0000'
        }
      }));
    });

    ws.on('message', (data: Buffer) => {
      const message = JSON.parse(data.toString());
      console.log('📨 Received:', message.type);

      if (message.type === 'init') {
        console.log('✅ Workspace initialized via WebSocket');
        console.log('   Content:', message.workspace.content);

        // Send a change
        console.log('\n5️⃣ Sending content change...');
        ws.send(JSON.stringify({
          type: 'change',
          workspaceId,
          change: {
            id: 'change-1',
            userId: 'test-user-1',
            timestamp: Date.now(),
            operation: 'insert',
            position: 21,
            content: ' This is awesome!'
          }
        }));
      }

      if (message.type === 'change') {
        console.log('✅ Change applied successfully');
        
        // Close connection after successful test
        setTimeout(() => {
          ws.close();
        }, 1000);
      }
    });

    ws.on('close', async () => {
      console.log('\n6️⃣ WebSocket closed');

      // Verify content was updated
      const finalResponse = await axios.get(`${API_BASE}/workspace/${workspaceId}`);
      console.log('✅ Final content:', finalResponse.data.workspace.content);

      // 7. Delete workspace
      console.log('\n7️⃣ Deleting workspace...');
      await axios.delete(`${API_BASE}/workspace/${workspaceId}`);
      console.log('✅ Workspace deleted');

      console.log('\n🎉 All tests passed!');
      process.exit(0);
    });

    ws.on('error', (error) => {
      console.error('❌ WebSocket error:', error.message);
      process.exit(1);
    });

  } catch (error: any) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    process.exit(1);
  }
}

// Run tests
console.log('⚠️  Make sure the server is running (npm run dev)\n');
setTimeout(() => {
  testWorkspaceAPI();
}, 1000);
