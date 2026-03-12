# 🛡️ Sentinel-Core: Autonomous AI Security Gateway
**An Intelligent Firewall & ASOC for the Agentic Era**

Sentinel-Core is a production-ready security gateway designed to protect LLM-based applications from emerging threats. Built on **Gemini 2.0 Flash**, it acts as a high-performance security layer that intercepts, analyzes, and mitigates threats in real-time.

---

## 📺 Project Demo
[**Click here to watch the 2-Minute Walkthrough on YouTube**](YOUR_YOUTUBE_LINK_HERE)
*Note: This video showcases the live autonomous mitigation and Gemini-powered reasoning in action.*

---

## 🚀 Key Features
* **Autonomous Threat Mitigation:** Executes system-level actions (IP Blocking, Server Isolation) based on high-confidence Gemini analysis.
* **Multimodal Security Audit:** Cross-references live dashboard visuals with backend logs to detect "Ghost Attacks."
* **Chain of Thought (CoT) Reasoning:** Provides a real-time "Reasoning Window" for security analysts to understand exactly *why* a request was flagged.
* **Privacy-First Redaction:** Integrated PII scanner that masks sensitive data (Emails, Passwords, Keys) before it reaches the cloud.
* **Full Admin Suite:** Manage API keys, monitor global threat volume, and control AI voice assistance from a single command center.

---

## 🧠 Powered by Gemini API
Sentinel-Core leverages the **Gemini 2.0 Flash** model for its extreme speed and multimodal capabilities. The system is architected to utilize the **Free Tier** for rapid prototyping while remaining "Enterprise Ready" for Vertex AI deployment.

---

## 🛠️ Project Structure
```text
sentinel-core/
├── backend-ai/           # FastAPI Security Service
│   ├── app/              # Core Logic & Gemini Integration
│   ├── tests/            # Security Test Suites
│   └── requirements.txt  # Python Dependencies
├── frontend/             # React Dashboard & Playground
│   ├── src/              # UI Components & Hooks
│   └── package.json      # Node.js Dependencies
└── README.md             # Project Master Documentation

📦 Installation & Setup
1. Backend Setup
cd backend-ai
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
# Create a .env file with your GEMINI_API_KEY
uvicorn app.main:app --reload

2. Frontend Setup
cd frontend
npm install
npm run dev

📊 Dashboard Insight
Our central dashboard tracks 14,000+ threats with real-time distribution across Injections, PII Leaks, and Toxicity.
🛡️ Disclaimer
Developed for the Gemini API Developer Competition 2026. This project showcases the power of autonomous AI in cybersecurity. Always ensure production-grade encryption is used alongside Sentinel-Core for enterprise data.

---

### Final Steps to Finish Your Submission:

1.  **YouTube Link:** Replace `YOUR_YOUTUBE_LINK_HERE` with the link you get after uploading to YouTube.
2.  **Asset Path:** I used `./assets/IMG-20260311-WA0005.jpg`. Make sure you create a folder named `assets` on GitHub and upload your dashboard image there, or update the path to match wherever you uploaded that image.
3.  **Sync:** Don't forget to `git add .`, `git commit -m "Finalized Master README"`, and `git push` to make it live on your repository.

**Would you like me to write the "Project Summary" text (the short blurb) for the actual competition submission form now?**
