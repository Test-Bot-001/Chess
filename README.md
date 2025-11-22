Made with Gemini3Pro for testing

# Demo Chess

A premium, dark-themed chess web application where you play as White against an intelligent AI opponent.

## 🎮 Play Online

**Live Demo**: [https://test-bot-001.github.io/Chess/](https://test-bot-001.github.io/Chess/)

## ✨ Features

### Smart AI Opponent
- **Minimax Algorithm** with Alpha-Beta pruning for efficient move calculation
- **Piece-Square Tables** for positional evaluation
- Plays strategically, not randomly

### Immersive User Interface
- **Dark Mode Design**: Sleek, modern aesthetic
- **Captured Pieces Display**: Visual tracking of captured pieces for both players
- **Move History Sidebar**: Auto-scrolling list of all moves in algebraic notation
- **Visual Feedback**: Highlighted selected squares and valid move indicators

### Audio Experience
- **Move Sound**: Soothing "thud" sound for regular moves
- **Check Sound**: Distinct "ding" alert when a king is in check
- Generated using Web Audio API (no external files required)

### Intuitive Controls
- **Drag & Drop**: Click and drag pieces to move them
- **Click-to-Move**: Click a piece, then click the destination square
- **Move Validation**: Only legal moves are allowed (powered by chess.js)

## 🚀 Running Locally

1. Clone the repository:
```bash
git clone https://github.com/Test-Bot-001/Chess.git
cd Chess
```

2. Open `index.html` in your web browser:
```bash
# On Windows
start index.html

# On macOS
open index.html

# On Linux
xdg-open index.html
```

That's it! No build process or dependencies needed.

## 📁 Project Structure

```
demo-chess/
├── index.html      # Application structure
├── style.css       # Styling and layout
├── script.js       # Game logic, AI, and audio
├── chess.js        # Chess rules engine
└── README.md       # This file
```

## 🎯 How to Play

1. **Start**: The game begins automatically with you playing as White
2. **Make a Move**: 
   - Drag a piece to a valid square, OR
   - Click a piece to select it, then click the destination
3. **AI Response**: The computer (Black) will respond after a brief delay
4. **Continue**: Play until checkmate or draw

## 🛠️ Technologies Used

- **HTML5**: Structure
- **CSS3**: Styling with modern design patterns
- **Vanilla JavaScript**: Game logic and interactions
- **chess.js**: Chess move validation and game rules
- **Web Audio API**: Sound generation

## 📝 License

This project is open source and available for personal and educational use.

## 🤝 Contributing

Feel free to fork this repository and submit pull requests for improvements!

## 👤 Author

Created with ❤️ by the Test-Bot-001 team
