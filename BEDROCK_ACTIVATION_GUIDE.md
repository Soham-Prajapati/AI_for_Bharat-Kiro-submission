# 🚨 Amazon Bedrock — Activation Required

## Current Status: ❌ NOT WORKING

**Error:** `Model use case details have not been submitted for this account.`

Your AWS account (`337480111372`) has the Bedrock **service enabled** and IAM policy attached, but Claude models are **blocked** until you submit Anthropic's use case form inside the AWS console. This is a one-time, free activation — takes ~5 minutes.

---

## Step-by-Step: How to Activate Claude on Bedrock

### Step 1 — Open the Correct AWS Console Region

> ⚠️ **This MUST be done in `us-east-1` (N. Virginia)** — your app uses `AWS_BEDROCK_REGION=us-east-1`

Direct link:
```
https://us-east-1.console.aws.amazon.com/bedrock/home?region=us-east-1#/modelaccess
```

Or navigate manually:
1. Log in to [AWS Console](https://console.aws.amazon.com)
2. Top-right region selector → choose **US East (N. Virginia) — us-east-1**
3. Search for **"Bedrock"** in the services search bar → open it
4. Left sidebar → **Model access**

---

### Step 2 — Request Access to Claude Models

On the **Model access** page:

1. Click the orange **"Manage model access"** button (top right)
2. You'll see a list of model providers — scroll to find **Anthropic**
3. Check the boxes next to:
   - ✅ **Claude 3 Haiku** (`anthropic.claude-3-haiku-20240307-v1:0`)
   - ✅ **Claude 3.5 Sonnet** (`anthropic.claude-3-5-sonnet-20241022-v2:0`)
   - ✅ **Claude 3 Sonnet** (backup, `anthropic.claude-3-sonnet-20240229-v1:0`)

4. Click **"Next"** or **"Request model access"**

---

### Step 3 — Fill Out Anthropic's Use Case Form

After clicking Request, AWS will show **Anthropic's use case details form**. Fill it as follows:

| Field | What to Write |
|---|---|
| **Company name** | KLA / AI for Bharat |
| **Website** | Your GitHub / demo URL (or put `N/A` if none) |
| **Use case** | `Content generation for social media creators` |
| **Industry** | `Media and Entertainment` |
| **Describe your use case** | `We are building a content intelligence platform for Indian video creators. We use Claude to generate platform-specific content (YouTube descriptions, Instagram captions, LinkedIn posts, Twitter threads) from video transcripts. All outputs are human-reviewed before publishing.` |
| **Will this be used in production?** | `Yes` |
| **Are you training models?** | `No` |

5. Click **"Submit"**

---

### Step 4 — Wait for Approval

| Model | Typical Wait Time |
|---|---|
| Claude 3 Haiku | **Instant to 15 minutes** |
| Claude 3.5 Sonnet | **Instant to 15 minutes** |

Once approved, the status column will show **"Access granted"** (green checkmark).

> 💡 **Tip:** Refresh the Model access page after ~5 minutes. If still pending, try the API test below — sometimes access is live before the UI updates.

---

### Step 5 — Verify Activation

After the status shows "Access granted", run this from the project root:

```bash
cd /Users/nidhimaru/Developer/AI_for_Bharat-Kiro-submission

node -e "
require('dotenv').config();
const { BedrockRuntimeClient, InvokeModelCommand } = require('@aws-sdk/client-bedrock-runtime');
const client = new BedrockRuntimeClient({
  region: 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  },
  requestHandler: { requestTimeout: 10000 }
});
const body = JSON.stringify({
  anthropic_version: 'bedrock-2023-05-31',
  max_tokens: 20,
  messages: [{ role: 'user', content: 'Say: BEDROCK_WORKING' }]
});
client.send(new InvokeModelCommand({
  modelId: 'anthropic.claude-3-haiku-20240307-v1:0',
  contentType: 'application/json',
  accept: 'application/json',
  body
}))
.then(r => console.log('✅ SUCCESS:', JSON.parse(new TextDecoder().decode(r.body)).content[0].text))
.catch(e => console.log('❌ FAIL:', e.name, '-', e.message));
"
```

**Expected output:** `✅ SUCCESS: BEDROCK_WORKING`

---

## IAM Policy Check (If Still Failing After Activation)

If activation succeeded but the API still fails with `AccessDeniedException`, the IAM user needs Bedrock invoke permissions. Add this inline policy to the IAM user (`AKIAU5E3B2UGE3LLFSE6`):

1. AWS Console → **IAM** → **Users** → find the user with key ending `LFSE6`
2. **Permissions** tab → **Add inline policy**
3. Switch to **JSON** and paste:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "BedrockInvoke",
      "Effect": "Allow",
      "Action": [
        "bedrock:InvokeModel",
        "bedrock:InvokeModelWithResponseStream",
        "bedrock:ListFoundationModels",
        "bedrock:GetFoundationModel"
      ],
      "Resource": [
        "arn:aws:bedrock:us-east-1::foundation-model/anthropic.claude-3-haiku-20240307-v1:0",
        "arn:aws:bedrock:us-east-1::foundation-model/anthropic.claude-3-5-sonnet-20241022-v2:0",
        "arn:aws:bedrock:us-east-1::foundation-model/anthropic.claude-3-sonnet-20240229-v1:0"
      ]
    }
  ]
}
```

4. Click **Review policy** → name it `BedrockClaudeAccess` → **Create policy**

---

## Quick Reference

| Item | Value |
|---|---|
| AWS Account ID | `337480111372` |
| Bedrock Region | `us-east-1` (N. Virginia) |
| Model access URL | `https://us-east-1.console.aws.amazon.com/bedrock/home?region=us-east-1#/modelaccess` |
| Target models | Haiku + 3.5 Sonnet |
| Cost | Pay-per-token (no monthly fee) — Haiku is ~$0.00025/1K input tokens |

---

## After Activation: What Changes

Once Bedrock is live, KLA's content pipeline will:

- ✅ Use **Claude 3 Haiku** for Instagram, TikTok, Twitter (fast, cheap)
- ✅ Use **Claude 3.5 Sonnet** for YouTube, LinkedIn, Blog, Podcast (high quality)
- ✅ Apply **domain-specific personas** (Finance expert, Food influencer, Tech creator, etc.)
- ✅ Run all 7 platforms **in parallel** via `Promise.allSettled`
- ❌ Stop falling back to the generic Content Multiplier V2 templates
