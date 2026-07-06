# NexContact

A secure, premium, and local-first contact manager built with Python (FastAPI) and vanilla JavaScript.

## Features
- ✨ **Premium Design**: Beautiful custom Dark Chocolate & Light Cream themes with sleek animations.
- 📱 **Responsive UI**: Works perfectly on both desktop and mobile screens.
- 🔍 **Real-time Search**: Instantly filter contacts by name, email, or phone.
- 📋 **Layouts**: Toggle between Grid and List viewing modes.
- 🔒 **Local Storage**: All contacts are saved locally and securely in `contacts.json`.
- 🚀 **Auto-Launch**: The backend automatically opens the application in your default web browser upon startup.
- 🔌 **Offline Support**: Icons and assets are loaded locally, requiring no active internet connection.

## Technologies Used
- **Backend**: Python, FastAPI, Uvicorn, Pydantic
- **Frontend**: HTML5, CSS3, JavaScript (Vanilla)
- **Icons**: Lucide Icons (Local)

## Installation & Setup

1. **Navigate to the project directory**:
   ```bash
   cd CLI
   ```

2. **Install dependencies**:
   Make sure you have Python 3 installed, then install the required Python packages (or activate your conda environment):
   ```bash
   pip install fastapi uvicorn pydantic
   ```

3. **Run the application**:
   ```bash
   python3 ft.py
   ```
   The local server will start, and the web app will automatically open in your default browser at `http://127.0.0.1:8000`.

## Project Structure
- `ft.py`: The main FastAPI server and REST API logic.
- `contacts.json`: The local JSON database where contacts are saved.
- `static/`: Contains all frontend assets:
  - `index.html`: The main web interface.
  - `styles.css`: The stylesheet containing the design system and themes.
  - `app.js`: The frontend logic for API interactions and UI state management.
  - `lucide.min.js`: Local icon library.
