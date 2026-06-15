# SupportPilot ✈️

An intelligent, AI-powered product support portal that bridges the gap between complex engineering documentation and customer self-service. 

**Team Name:** Logic Loop  
**Team Members:** Ayush Chauhan, Hiresh Goyal, Manya Singla, Dhriti Kakkar  

---

## 📖 Project Overview

When hardware or software products fail, users are typically met with two frustrations: digging through hundreds of pages of static PDF manuals or waiting hours for support tickets to escalate. 

**SupportPilot** solves this by providing:
- **For Companies:** A single, centralized workspace to manage products, view support health metrics, and upload manuals/articles.
- **For Customers:** A smart diagnostic portal. When a customer reports a problem, SupportPilot uses Semantic Retrieval (RAG) to scan product documentation and feeds it to a Gemini-powered expert support technician who responds with actionable checklists, precautions, and source citations.
- **Built-in Resiliency (Demo Mode):** Recognizing the fast-paced nature of evaluation, SupportPilot has a built-in client-side fallback. If the backend server is not running or credentials are not configured, the application automatically runs in a local **Demo Mode** using browser `localStorage` to emulate database storage. Judges can explore the entire layout, add products, upload documents, and edit details without setting up any backend infrastructure!

---

## ✨ Features & Functionality

### 🏢 Company Workspace
- **Analytics Dashboard:** Monitor key performance indicators including **Open Tickets**, **AI Assist Rate**, and **Document Coverage**.
- **Product Management:** Add, edit, and archive products. Set categories, model numbers, and catalog descriptions.
- **Interactive Knowledge Base:** Upload product documentation in multiple formats (PDFs, plain text files, or resource links).
- **Automatic Document Ingestion:** Built-in PDF parser pulls text out of uploaded manuals, chunks it, and indexes it for real-time search.

### 👥 Customer Experience
- **Common Issues Quick-Link:** See and select from pre-defined common problems (e.g. "Bluetooth connection drops") to get fast guidance.
- **AI Diagnostics Assistant:** Chat with an automated technician grounded strictly on the product's manuals.
  - **Action-Oriented Checklist:** Responses are formatted as markdown checklists so users can track their troubleshooting progress.
  - **Warnings First:** Critical precautions and safety steps are prominently surfaced.
  - **Source Traceability:** Links the exact document source behind the advice so that customers can trust the AI's recommendations.

### ⚙️ Technical Highlights
- **RAG Architecture:** Leverages the **Moss SDK** for document vector embedding and semantic retrieval matching user queries.
- **State-of-the-Art Generative AI:** Uses Google’s **Gemini 2.5 Flash** (`gemini-2.5-flash`) via the modern `google-genai` SDK for system-guided support dialogue.
- **Hybrid Auth & Storage:** Secure JWT-based registration/login with custom roles (`company` / `customer`) backed by PostgreSQL, paired with **Cloudinary** for document hosting.

---

## 🛠️ Tech Stack Used

- **Frontend:**
  - React.js (v18)
  - Vite (v8)
  - Tailwind CSS (v3)
  - UI Library: Radix UI / shadcn/ui
  - Icons: Lucide React
  - HTTP Client: Axios
- **Backend:**
  - Python (v3.10+)
  - FastAPI (Web framework)
  - Uvicorn (ASGI server)
  - PostgreSQL client: `asyncpg`
  - PDF Processor: PyMuPDF (`fitz`)
- **AI & Storage Integration:**
  - **Google GenAI SDK:** Gemini 2.5 Flash
  - **Moss Client SDK:** Semantic Vector Retrieval
  - **Cloudinary:** Document Hosting and Storage

---

## 🚀 Setup and Installation Instructions

### Prerequisites
Make sure you have the following installed on your local machine:
- [Node.js](https://nodejs.org/) (v18 or higher)
- [Python](https://www.python.org/) (v3.10 or higher)
- A running PostgreSQL database (e.g., [Neon DB](https://neon.tech/))

---

### 1. Backend Setup

1. Navigate to the `backend` directory:
   ```bash
   cd backend
   ```

2. Create a virtual environment and activate it:
   ```bash
   python -m venv venv
   # On Windows:
   .\venv\Scripts\activate
   # On macOS/Linux:
   source venv/bin/activate
   ```

3. Install required packages:
   ```bash
   pip install -r requirements.txt
   ```

4. Create a `.env` file inside the `backend` folder and populate it with your environment keys:
   ```env
   # PostgreSQL connection string
   DATABASE_URL=postgresql://<username>:<password>@<host>/<dbname>?sslmode=require

   # Google AI Studio API key
   GEMINI_API_KEY=your_gemini_api_key_here

   # Moss Semantic Retrieval credentials
   MOSS_PROJECT_ID=your_moss_project_id_here
   MOSS_PROJECT_KEY=your_moss_project_key_here

   # Cloudinary Media Storage credentials
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   ```

5. Run the FastAPI development server:
   ```bash
   uvicorn main:app --reload --port 8000
   ```
   *The database schema tables will automatically initialize on first start.*

---

### 2. Frontend Setup

1. Navigate to the `frontend` directory:
   ```bash
   cd frontend
   ```

2. Install npm dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` or `.env.local` file inside the `frontend` folder:
   ```env
   VITE_API_BASE_URL=http://localhost:8000
   ```

4. Start the frontend development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:5173](http://localhost:5173) in your browser to view the application.

---

## 💡 Usage Guide & Evaluation Tips

### Fast Track Evaluation (No Server / Backend Setup)
If you wish to evaluate the UI immediately:
1. Simply complete the **Frontend Setup** steps and run `npm run dev`.
2. Do **not** run the backend server. The application will detect the network error and automatically enter **Demo Mode** using browser `localStorage` as a mock DB.
3. You can click **Create company workspace**, register any dummy account, add custom products, edit them, upload mock documents, and navigate pages seamlessly!

### Testing Full RAG Flow (With Backend Running)
To test the complete AI-powered troubleshooting flow:
1. Start both the **Backend** and **Frontend** servers.
2. Sign up or log in as a **Company**.
3. Create a product (e.g., *SleekPro Headphones*).
4. Click into the product, and under **Documentation**, click **Add Document**. Upload a short text file or PDF manual containing specific troubleshooting guidelines (e.g., *"Press and hold the power button for 7 seconds to factory reset"*).
5. Log out, and sign up or log in as a **Customer**.
6. Select the product you created, and type a question in the diagnostic chat (e.g., *"How do I factory reset my headphones?"*).
7. The AI assistant will retrieve your document, answer step-by-step using a checklist, and display the source citation at the bottom of the response.

---

## 📸 Screenshots

<img width="1918" height="996" alt="image" src="https://github.com/user-attachments/assets/4058b05f-77eb-4f1b-b506-90cd5d01c18c" />

<img width="1918" height="986" alt="image" src="https://github.com/user-attachments/assets/cfdaca5d-4215-4885-b368-e43a528b107f" />

<img width="1918" height="987" alt="image" src="https://github.com/user-attachments/assets/9392463f-a46b-491b-bc97-0f852400ea44" />





| Company Dashboard | AI Chat Interface |
|:---:|:---:|

| ![Company Dashboard] |(<img width="1893" height="987" alt="image" src="https://github.com/user-attachments/assets/3c1b016e-3026-4238-8734-2cb7522919f8" />)

) | ![AI Troubleshooting Chat] |(<img width="1553" height="956" alt="image" src="https://github.com/user-attachments/assets/2cf7a83f-3be4-4dd2-b204-2d19aad43aaa" />)


---

## 🎥 Demo Video

🎥 **[Watch the SupportPilot Video Demo]https://drive.google.com/file/d/1pGUz7byLFlnEA6Ocg9TuSgJsPYRWk_mw/view?usp=drive_link)**
