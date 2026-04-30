PRD: Ovyo - Real-time Communication Suite
Product Overview:
Build a high-performance web application named Ovyo for real-time messaging, audio, and video calling. The application must feature a modern Glassmorphism Dark Mode UI and utilize a self-hosted infrastructure with zero third-party API costs.

1. Project Specifications
App Name: Ovyo

Base URL: http://localhost:5175

Theme: Glassmorphism Dark Mode (Translucent backgrounds, backdrop-filter: blur(), neon accents).

Primary Tech: Vite + React.js, Node.js, Express, Socket.io, WebRTC, and SQLite.

2. Functional Requirements
User Management:

Authentication system using SQLite.

Specific test accounts to be supported:

Username: Jakir | Password: dhdhd@1344

Username: Mainzy | Password: dhdhd@1345

Real-time Messaging:

Instant text chat using Socket.io.

Message persistence in SQLite database.

WebRTC Calling (Audio/Video):

Peer-to-peer connection for high-quality streams.

Signaling handled via Socket.io.

Must work locally/LAN without external STUN/TURN dependency for the initial build.

Features: Toggle Mic, Toggle Camera, End Call.

3. Technical Architecture
Frontend (Vite + React):

Modular component structure.

Vanilla CSS3 for Glassmorphism styling.

State management for handling call statuses (Incoming, Outgoing, Connected).

Backend (Node.js + Express):

REST API for user registration and login.

Socket.io server for real-time events (message, call-user, make-answer, ice-candidate).

Database (SQLite):

Table users: id, username, password.

Table messages: id, sender_id, receiver_id, content, timestamp.

4. Implementation Guidelines for AI
Server Setup: Initialize Express and SQLite. Create a local .db file.

Socket signaling: Set up the WebRTC signaling flow (Offer/Answer/Candidate exchange) through Socket.io.

UI Construction: Create a login page and a main dashboard with a blurred glass effect. Use a dark color palette (#0f172a or similar).

Local Testing: Ensure the environment allows two tabs at localhost:5175 to communicate seamlessly.