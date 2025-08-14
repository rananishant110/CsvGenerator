@echo off
echo 🚀 Setting up CSVGenie Backend Environment...

REM Check if Python 3.8+ is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Python is not installed or not in PATH
    exit /b 1
)

echo ✅ Python found

REM Create virtual environment
echo 📦 Creating virtual environment...
python -m venv venv

REM Activate virtual environment
echo 🔧 Activating virtual environment...
call venv\Scripts\activate.bat

REM Upgrade pip
echo ⬆️ Upgrading pip...
python -m pip install --upgrade pip

REM Install dependencies
echo 📚 Installing dependencies...
pip install -r requirements.txt

REM Create necessary directories
echo 📁 Creating directories...
python -c "from config import config; config.create_directories()"

echo ✅ Setup complete! To activate the environment, run:
echo    venv\Scripts\activate.bat
echo.
echo 🚀 To start the server, run:
echo    uvicorn main:app --reload

pause
