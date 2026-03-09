#!/usr/bin/env python3
"""
Take screenshots of the Content Intelligence Platform website.
Captures key pages in dark mode for the PPTX presentation.
"""

import os
import json
import time
from playwright.sync_api import sync_playwright

BASE_URL = "http://localhost:3000"
OUT_DIR = "/Users/nidhimaru/Developer/AI_for_Bharat-Kiro-submission/temp/screenshots"
os.makedirs(OUT_DIR, exist_ok=True)

PAGES = [
    {
        "url": f"{BASE_URL}/dashboard",
        "name": "dashboard",
        "label": "Creator Dashboard",
        "wait": 4000,
        "scroll": 0,
    },
    {
        "url": f"{BASE_URL}/analytics",
        "name": "analytics",
        "label": "Analytics & Insights",
        "wait": 4000,
        "scroll": 0,
    },
    {
        "url": f"{BASE_URL}/calendar",
        "name": "calendar",
        "label": "Content Calendar",
        "wait": 4000,
        "scroll": 0,
    },
    {
        "url": f"{BASE_URL}/upload",
        "name": "content_generator",
        "label": "Content Generator",
        "wait": 5000,
        "scroll": 600,  # scroll down to show the generated results section
    },
]

# ── Mock generated content to inject into localStorage ──────────────────────
MOCK_GENERATED_CONTENT = {
    "youtube": {
        "platform": "youtube",
        "title": "How AI Is Transforming Education in India 🚀 | Complete Breakdown",
        "content": "Hook (0–15s): Did you know 500 million students in India are about to experience education like never before?\n\nMain (15–180s): Today, I'm breaking down exactly how AI tutors are personalising learning paths for CBSE, JEE, and NEET students — in their own language.\n\n1️⃣ Adaptive difficulty that matches your level\n2️⃣ Real-time doubt resolution in Hindi, Tamil, Telugu & more\n3️⃣ Predictive analytics that spot weak subjects before exams\n\nCTA: Hit that subscribe button and comment your subject below — I'll cover it next week!",
        "hashtags": ["#AIEducation", "#IndiaLearns", "#EdTech", "#JEE2026", "#NEET", "#StudyTips"],
        "script": "Full script available in the description...",
        "timestamps": [
            {"time": "0:00", "text": "Introduction — The AI Education Revolution"},
            {"time": "1:30", "text": "Personalised Learning Paths"},
            {"time": "4:15", "text": "Regional Language Support"},
            {"time": "7:00", "text": "Results & Student Stories"},
        ]
    },
    "instagram": {
        "platform": "instagram",
        "title": "AI Education Reel",
        "content": "500M students. 1 AI tutor. 🤯\n\nFirst 3 seconds matter — that's why our hook opens on a student scoring 95% after using AI tutoring for just 30 days.\n\n✅ Learns your pace\n✅ Speaks your language\n✅ Knows your weak spots\n\nDrop a 📚 if this should be free for every student in India.",
        "hashtags": ["#IndiaEducation", "#AITutor", "#Students", "#JEE", "#Viral", "#Reels"],
    },
    "linkedin": {
        "platform": "linkedin",
        "title": "The $50B EdTech Opportunity No One Talks About",
        "content": "I spent 3 months studying how AI is reshaping education for India's 500 million students.\n\nHere's what most founders (and investors) are missing:\n\n→ The real barrier isn't access to content — it's access in the right language\n→ 74% of Indian students think in their mother tongue, not English\n→ AI that speaks Hindi, Tamil, and Telugu will 10x outcomes\n\nThe founders who build for Bharat first will own the $50B prize.\n\nWhat's your take? Tag a founder who needs to see this. 👇",
        "hashtags": ["#EdTech", "#StartupIndia", "#AIIndia", "#FutureOfWork"],
    },
    "twitter": {
        "platform": "twitter",
        "title": "Twitter/X Thread",
        "content": "🧵 AI is about to completely transform how India's 500M students learn.\n\nHere's everything happening right now (thread):\n\n1/ Adaptive AI tutors now adjust difficulty in real-time based on your answers — no more one-size-fits-all textbooks\n\n2/ Regional language support is the unlock. 74% of students learn better in mother tongue.\n\n3/ Predictive analytics can identify at-risk students 6 weeks before exams.\n\nRT if you think this tech should reach every village in India 🇮🇳",
        "hashtags": ["#AIEducation", "#IndiaFirst", "#EdTech"],
    },
    "blog": {
        "platform": "blog",
        "title": "How AI Tutors Are Democratising Education for 500 Million Indian Students",
        "content": "**Introduction**\n\nIndia stands at an inflection point. With 500 million students spread across 28 states and 22 official languages, the challenge of delivering personalised, high-quality education has historically seemed insurmountable.\n\nUntil now.\n\n**The AI Revolution in Indian Classrooms**\n\nEmerging AI tutoring systems are doing something unprecedented — learning how each student thinks, in their own language, at their own pace...",
        "hashtags": ["#EdTech", "#AIIndia", "#Education", "#Blog"],
    },
    "podcast": {
        "platform": "podcast",
        "title": "The AI Education Revolution — Full Episode Script",
        "content": "[INTRO MUSIC — 10s]\n\nHost: Welcome back to Creator Intelligence — the podcast where we break down how AI is reshaping every industry in India. I'm your host, and today we're diving deep into EdTech.\n\n[PAUSE]\n\nHere's a number that should stop you in your tracks: 500,000,000. Five hundred million. That's how many students in India could benefit from AI-personalised education right now...",
        "hashtags": ["#Podcast", "#AIEducation", "#IndiaFirst"],
    },
}

MOCK_FULL_RESULTS = {
    "platforms": MOCK_GENERATED_CONTENT,
    "viralScore": 82,
    "analytics": {
        "detectedDomain": "education",
        "estimatedReach": 285000,
        "estimatedEngagement": 4.7,
        "contentQualityScore": 88,
        "viralPotential": 82,
    },
    "viralAnalysis": {
        "hooks": [
            {"timestamp": "0:00", "type": "Shock Statistic", "impact": "high", "description": "500M students opener creates immediate scale awareness"},
            {"timestamp": "0:08", "type": "Curiosity Gap",  "impact": "high", "description": "Education transformation teaser before payoff"},
            {"timestamp": "1:30", "type": "Social Proof",   "impact": "medium", "description": "Student success story before feature explanation"},
        ],
        "recommendations": [
            "Add a 3-second visual hook of a student's score improvement",
            "Include regional language captions for 40% more reach in Tier 2/3 cities",
            "Post between 7–9 PM IST for peak student audience",
        ],
        "patterns": [
            {"type": "List Content", "strength": 87, "description": "Numbered insights drive 3x more saves"},
            {"type": "CTA Placement", "strength": 74, "description": "End-screen CTA is well-positioned"},
        ],
    },
    "contentFeedback": {
        "overallScore": 88,
        "grade": "A",
        "topStrengths": ["Strong hook with data", "Clear CTA", "Platform-native formatting"],
        "improvements": [
            {"aspect": "Opening Hook", "current": "Text statistic", "suggested": "Video of student reaction shot", "impact": "high", "reasoning": "Visual hooks retain 40% more viewers past the 3s mark"},
        ],
    },
}

MOCK_UPLOAD_SESSION = {
    "generatedContent": MOCK_GENERATED_CONTENT,
    "fullResults": MOCK_FULL_RESULTS,
    "savedTranscript": "AI is transforming education in India. 500 million students, 22 languages — and one AI tutor that speaks all of them.",
    "iterationNumber": 1,
    "activeAgent": "education",
    "uploadedFileName": "ai_education_india.mp4",
    "ideaText": "",
    "savedAt": "2026-03-09T10:00:00.000Z",  # today, won't expire
}


MOCK_USER = {
    "id": "demo-001",
    "name": "Srushti Creator",
    "email": "demo@contentai.in",
    "avatar": None,
    "subscription": "pro",
    "domain": "education",
    "audienceType": "youth",
    "creatorMode": "hybrid",
    "onboardingComplete": True,
    "preferences": {
        "emailNotifications": True,
        "pushNotifications": True,
        "autoSave": True,
    },
}


def take_screenshots():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(
            viewport={"width": 1440, "height": 900},
            color_scheme="dark",
            device_scale_factor=2,  # Retina quality
        )

        # Inject dark mode + mock localStorage auth before every page load
        context.add_init_script(f"""
            // Dark mode
            Object.defineProperty(window, 'matchMedia', {{
                writable: true,
                value: (query) => ({{
                    matches: query === '(prefers-color-scheme: dark)',
                    media: query,
                    onchange: null,
                    addListener: () => {{}},
                    removeListener: () => {{}},
                    addEventListener: () => {{}},
                    removeEventListener: () => {{}},
                    dispatchEvent: () => false,
                }}),
            }});
            // Mock auth state so protected pages render their content
            localStorage.setItem('app_user', JSON.stringify({json.dumps(MOCK_USER)}));
            localStorage.setItem('kla_auth_token', 'mock-jwt-token-for-screenshots');
            // Mock upload session so content generator shows generated results
            localStorage.setItem('kla_upload_session', JSON.stringify({json.dumps(MOCK_UPLOAD_SESSION)}));
        """)

        page = context.new_page()

        for pg in PAGES:
            print(f"  Screenshotting {pg['name']}...")
            try:
                page.goto(pg["url"], wait_until="networkidle", timeout=20000)
                page.wait_for_timeout(pg["wait"])

                if pg["scroll"] > 0:
                    page.evaluate(f"window.scrollTo(0, {pg['scroll']})")
                    page.wait_for_timeout(1500)

                out_path = os.path.join(OUT_DIR, f"{pg['name']}.png")
                page.screenshot(path=out_path, full_page=False)
                print(f"    Saved: {out_path}")
            except Exception as e:
                print(f"    Error on {pg['name']}: {e}")

        browser.close()
    print("\nAll screenshots done!")


if __name__ == "__main__":
    take_screenshots()
