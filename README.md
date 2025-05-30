# Voice Transcribe Frontend

A React application for transcribing audio files and managing transcriptions.

## 🧰 Tech Stack

- **Framework**: React with TypeScript (Vite)
- **Styling**: Tailwind CSS
- **UI Components**: ShadCN UI approach
- **Data Fetching**: React Query
- **Routing**: React Router
- **Auth**: JWT (localStorage)

## 📁 Project Structure

```
src/
├── app/                 # App config (routes, providers)
├── pages/               # Page-level components
├── widgets/             # Layout widgets (Navbar, Sidebar)
├── features/            # Business logic
├── shared/              # Shared UI components, hooks, utils
```

## 🔐 Authentication Flow

1. Login via `/api/v1/auth/login` → Store JWT
2. Add JWT to Authorization header for protected requests
3. Role-based UI rendering (admin/transcriber)

## 📦 Key Features

1. **Login Page**: Form with auth flow
2. **Admin Dashboard**: Upload audio files, monitor queue
3. **Transcriber Dashboard**: View/edit transcripts
4. **Transcript Editor**: Edit and submit transcripts

## 🚀 Getting Started

```bash
# Install dependencies
npm install

# Start dev server
npm run dev
```

Set environment in `.env`:
```
VITE_API_URL=http://localhost:8000/api/v1
```
#   a u d i o - t r a n s c r i b e r  
 