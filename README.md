Shuffle Board Challenge

This is a React + TypeScript + TailwindCSS implementation of a **drag-and-drop shuffle board**.  
It replicates the behavior you described: two columns of cards with random heights, draggable between and within columns, animated insertion, and spotlight effects.

 Features
- **Two columns** with 4 cards each (random height & color).
- **Drag & Drop**:
  - Move cards between columns or reorder inside the same column.
  - Target card auto-shifts down when inserting.
- **Special Effects**:
  - Screen darkens while dragging.
  - **Spotlight effect** around the mouse cursor (no Canvas/SVG).
  - **Sky-blue insertion indicator** with smooth animation when hovering between cards.
- **Responsive & smooth transitions** powered by TailwindCSS.

---

Tech Stack
- [React](https://react.dev/) (with TypeScript)
- [TailwindCSS](https://tailwindcss.com/)
- HTML5 **Drag & Drop API**  
- CSS `mask-image` for spotlight effect

 Project Structure
```

src/
├── App.tsx       # Main shuffle board logic
├── main.tsx      # React entry
└── index.css     # Tailwind base styles

````

---

 Installation & Setup

1. **Clone this repo**  
   ```bash
   git clone https://github.com/your-username/shuffle-board.git
   cd shuffle-board
````

2. **Install dependencies**

   ```bash
   npm install
   # or
   yarn install
   ```

3. **Run the app**

   ```bash
   npm run dev
   # or
   yarn dev
   ```

4. Open in your browser:

   ```
   http://localhost:5173
   ```

---

 How to Play

1. Click and drag a card from one column.
2. While dragging:

   * The screen darkens except for a **spotlight circle** around the cursor.
   * A **sky-blue insertion indicator** shows where the card will be placed.
3. Release the card → It snaps into place, pushing other cards downward automatically.

---


 Notes

* No Canvas or SVG is used for the effects.
* The spotlight is achieved via **CSS mask-image** gradients.
* You can easily customize the number of columns, initial cards, or animations.

---
Future Improvements

* Mobile touch drag support.
* Configurable column/card count.
* Better animations for smoother transitions.

---


