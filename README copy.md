# ChatRizz

## Backend Translation Server

A simple Node.js Express server is used to provide translation services for the chat app. It connects to a translation API (e.g., Google Translate).

### Setup
1. Go to the `Chatrizz/backend` directory (create it if it doesn't exist).
2. Run `npm init -y` to initialize a Node.js project.
3. Install dependencies:
   ```sh
   npm install express axios cors
   ```
4. Add your translation API key in `translate.js`.
5. Start the server:
   ```sh
   node server.js
   ```

The server will run on port 5000 by default. 