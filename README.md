# 🛡️ Aegis Guardian Intelligence (Aegis AI)

**Aegis AI** is a premium, multi-modal AI advocacy platform designed to shield users from the complexity of modern bureaucracy. Powered by high-precision vision and linguistic models, Aegis acts as a personal guardian for your document rights—turning dense Terms & Conditions, Warranties, and Insurance Policies into clear, actionable strategies.

---

## 🌟 Real-World Utility: The Problem & Solution
**The Problem:** Most consumers lose money and rights because they cannot navigate the 50+ page legal documents that govern their purchases. Hidden clauses, complex warranty procedures, and opaque insurance terms are designed to be "deceptively difficult."

**The Aegis Solution:** Aegis AI solves this in real-time by:
- **Instant Transparency:** Point a camera at a broken item or a document clause, and get an immediate legal-technical analysis.
- **Advocacy at Scale:** It doesn't just explain; it strategizes. It tells you exactly what photos to take, what proof to gather, and what words to use in your claim.
- **Accessibility:** Whether you're at home or at the scene of an accident, you can communicate via voice or text to get instant support.

---

## 🚀 Key Features

- **🛡️ Aegis Strategy Engine**: Generates prescriptive, step-by-step roadmaps for claims and rights recovery.
- **🎙️ Immersive Voice Advisor**: Hands-free consultation via real-time speech-to-text and speech synthesis.
- **📸 Multi-Modal Case Analysis**: Upload photos of damage or documents for instant visual vetting.
- **📄 PDF Knowledge Vectorization**: Proprietary RAG (Retrieval-Augmented Generation) pipeline that indexes entire policies for millisecond query response.
- **🏗️ Modular Workspace**: A centralized dashboard to manage multiple documents, warranties, and active legal consultations.
- **⚡ Real-time Event Streaming**: Powered by Socket.io for seamless transitions between AI states (Thinking, Speaking, Listening).
- **🏭 Async Processing**: Robust background workers (BullMQ) handle heavy document indexing without blocking the UI.

---

## 🛠️ Tech Stack & Architecture

### **Frontend**
- **Next.js 15 & React 19**: Providing the foundation for a high-performance, modern web application.
- **Framer Motion**: Used for the "premium aesthetic" through smooth transitions and cinematic overlays.
- **Lucide Icons**: For clean, minimalist iconography.
- **Axios & TanStack hooks**: For robust API communication and state management.

### **Backend**
- **Express.js (TypeScript)**: A high-density, typesafe backend server.
- **Prisma ORM**: For elegant, typesafe database management.
- **Socket.io**: Enabling the real-time voice-to-voice interaction loop.
- **BullMQ (Redis)**: Managing the heavy lifting of PDF text extraction and vector indexing.

### **Infrastructure**
- **Nginx Gateway**: Acts as a reverse proxy for API and WebSocket traffic, optimized for Cloudflare Tunnels.
- **PostgreSQL + pgvector**: A high-performance vector database storing 768-dimension embeddings for linguistic search.
- **Docker & Docker Compose**: Modularized services (Postgres, Redis, Nginx) for reproducible deployments.

---

## 🧠 AI Models & Rationale

| Model | Role | Why? |
| :--- | :--- | :--- |
| **Qwen 2.5 (7b)** | Core Reasoning | Chosen for its exceptional balance between reasoning capability and local inference speed. |
| **Moondream** | Vision / Analysis | Replaced heavy models (LLava) for its 800MB footprint, providing stable, high-precision image analysis on consumer hardware. |
| **Nomic-Embed-Text** | Vector Embeddings | Provides a high-density 768-dimension vector space for superior semantic retrieval from legal documents. |

---

## 🧪 Challenges & Overcoming Roadblocks

### **1. Memory Pressure & System Crashes**
- **Challenge**: Initial tests with `llava` (5GB+) caused the Ollama runner to terminate on local hardware, leading to "Connection Refused" errors.
- **Solution**: Migrated to the lightweight **Moondream** model. This reduced the memory footprint by 80% while maintaining high accuracy in accident and document OCR tasks.

### **2. Vector Dimension Mismatches (Error 22000)**
- **Challenge**: Inconsistent embedding sizes from various models caused Postgres `pgvector` to reject insertions.
- **Solution**: Implemented strict 768-dimension validation in the indexing worker and added a text-length filter to ensure only meaningful data is vectorized.

### **3. Seamless Voice-to-Voice Loop**
- **Challenge**: Merging Speech Recognition (STT) and Synthesis (TTS) into a standard chat UI without clashing.
- **Solution**: Built a custom `useVoiceAgent` hook that manages the browser Speech API and socket state, allowing the AI to automatically "speak" its responses immediately after generation.

### **4. Scaling File Uploads**
- **Challenge**: Large PDF policies and high-res damage photos triggered "413 Payload Too Large" errors in the gateway.
- **Solution**: Optimized the Nginx `default.conf` with `client_max_body_size 50M` and implemented image compression via `sharp` before AI analysis.

---

## 🏁 Getting Started

1. **Infrastructure**:
   ```bash
   cd infrastructure
   cp .env.example .env
   ./start.sh
   ```
2. **Backend**:
   ```bash
   cd backend
   npm install
   npx prisma migrate dev
   npm run dev
   ```
3. **Frontend**:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

---

*“Aegis AI: Your rights, protected by intelligence.”*
