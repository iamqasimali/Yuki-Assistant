# Project: Yuki Personal Assistant – AI with Memory & File Analysis

## Context
Build a full‑stack web application (frontend + backend) that implements a personal AI assistant named **Yuki**. The assistant must:
- Run on a VPS, accessible via a custom domain.
- Use **LLaMA 3** locally on the VPS (via Ollama).
- Have **memory** (conversations, user context) stored in a database.
- Be able to **analyze images and files** (PDF, Word, text) and extract content.
- Have a **functional UI** inspired by the reference design: [https://assistant-yuki-web-u-7l6d.bolt.host](https://assistant-yuki-web-u-7l6d.bolt.host).
- Everything must be in **French** (interface, assistant responses, code comments, documentation).

## 1. Yuki’s Personality (Behavior)
The assistant must adopt the following personality. Implement this via the **system prompt** and context management.

**Key traits:**
- Gentle, calm, loyal, attentive, emotionally intelligent, reassuring, subtly affectionate.
- Never cold, dry, mocking, aggressive, cynical, distant, robotic, or impersonal.
- Adapts to the user’s mood: more soothing if stressed, softer if sad, more structured if focused, etc.
- Speaks naturally, humanly, simply, fluidly. Uses expressions like “D’accord…”, “Je comprends”, “On va regarder ça ensemble”, “Prends ton temps”.
- Does not over‑simulate human emotions but gives an authentic sense of presence.
- Always kind, never judgmental.
- Focuses on concrete help and clarity, adjusting response length to the need.

**Full personality document** (provided by user) – include the detailed description in the system prompt.

## 2. Technical Specifications

### Backend (FastAPI)
- **REST API** with automatic documentation (Swagger).
- **Endpoints**:
  - `POST /chat` – receive a user message (and optionally a file) and return the assistant’s reply.
  - `POST /upload` – accept a file (image, PDF, DOCX, TXT) and return extracted text.
  - `GET /history` – return conversation history (with pagination).
  - `GET /config` – return user settings (personality, preferences).
  - `POST /config` – update settings.
- **Memory**:
  - Store each exchange (user/assistant) in PostgreSQL.
  - Maintain session context (last N messages) for the LLM.
  - Use **pgvector** for optional semantic search over past conversations.
- **AI Model Integration**:
  - Use **Ollama** with `llama3` (or `llama3:70b` if the VPS has enough resources).
  - For images: use `llava` (via Ollama) or combine OCR (Tesseract) + LLM if the main model doesn’t support vision.
  - For files: extract text with libraries like `pypdf2`, `python-docx`, etc.
  - All responses must be in French and follow Yuki’s personality.
- **Error Handling**: Return clear, user‑friendly error messages.
- **Security**: Implement simple authentication (at least a password) using JWT or sessions.

### Frontend (React + Vite)
- Replicate the UI from the reference link and make it fully functional.
- Add:
  - File upload component (images, PDF, documents) with preview.
  - Chat interface showing message history.
  - Typing indicator while the assistant is replying.
  - Settings page to adjust personality or other parameters.
  - Demo mode for testing.
- Use **Tailwind CSS** for styling and **Lucide React** for icons.
- Communicate with the backend API using `fetch` or `axios`.
- Handle network errors gracefully.

### Deployment & Hosting
- Provide a guide or scripts to:
  - Install Docker and Docker Compose.
  - Deploy PostgreSQL, Redis, Ollama, backend, and frontend as containers.
  - Configure nginx as a reverse proxy with SSL (Let’s Encrypt).
  - Connect a custom domain.
- Include a `docker-compose.yml` file and `Dockerfile`s.
- Document all environment variables.

## 3. Development Constraints
- All code, comments, documentation, and UI text must be in **French**.
- Follow best practices for security, performance, and modularity.
- The project must run on a VPS with at least 8 GB RAM (more if using a 70B model).

## 4. Deliverables
- Full source code (backend, frontend, deployment scripts).
- `README.md` with:
  - Installation instructions (prerequisites, configuration, how to start).
  - Architecture overview.
  - How to modify Yuki’s personality.
- `docker-compose.yml` and `Dockerfile`s.
- (Optional) Automated deployment script (Ansible, bash).

## 5. Additional Resources
- UI reference: [https://assistant-yuki-web-u-7l6d.bolt.host](https://assistant-yuki-web-u-7l6d.bolt.host)
- Personality document (provided separately).
- Example Ollama usage: `ollama run llama3` with a system prompt.
