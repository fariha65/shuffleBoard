import React, { useState, useRef, useEffect } from "react";
import "./index.css";

type CardItem = {
  uniqueId: string;
  label: string;
  bgColor: string;
  boxHeight: number;
};

function randomPastelColor() {
  const randomHue = Math.floor(Math.random() * 360);
  return `hsl(${randomHue}, 70%, 80%)`;
}

function createCardItem(index: number): CardItem {
  return {
    uniqueId: Date.now().toString() + "-" + index + "-" + Math.random().toString(),
    label: (index + 1).toString(),
    bgColor: randomPastelColor(),
    boxHeight: 80 + Math.floor(Math.random() * 100),
  };
}

function initialCardColumns(): [CardItem[], CardItem[]] {
  const firstColumnCards: CardItem[] = [];
  for (let i = 0; i < 4; i++) {
    firstColumnCards.push(createCardItem(i));
  }
  const secondColumnCards: CardItem[] = [];
  for (let i = 4; i < 8; i++) {
    secondColumnCards.push(createCardItem(i));
  }
  return [firstColumnCards, secondColumnCards];
}

export default function App() {
  const [cardColumns, setCardColumns] = useState<[CardItem[], CardItem[]]>(initialCardColumns);

  const [dragState, setDragState] = useState<{
    draggedCard: CardItem | null;
    fromColumnIndex: number | null;
    fromCardIndex: number | null;
  }>({ draggedCard: null, fromColumnIndex: null, fromCardIndex: null });

  const [placeholderData, setPlaceholderData] = useState<{
    columnIndex: number | null;
    insertIndex: number | null;
    height: number;
    isVisible: boolean;
  }>({ columnIndex: null, insertIndex: null, height: 0, isVisible: false });

  // Refs to hold latest drag and placeholder data to avoid stale closures
  const dragStateRef = useRef(dragState);
  const placeholderDataRef = useRef(placeholderData);

  // Update refs whenever state changes
  useEffect(() => {
    dragStateRef.current = dragState;
  }, [dragState]);

  useEffect(() => {
    placeholderDataRef.current = placeholderData;
  }, [placeholderData]);

  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  const leftColumnRef = useRef<HTMLDivElement>(null);
  const rightColumnRef = useRef<HTMLDivElement>(null);

  // Handle drag start event
  function handleDragStart(
    e: React.PointerEvent<HTMLDivElement>,
    card: CardItem,
    columnIndex: number,
    cardIndex: number
  ) {
    if (e.button !== 0) return; // Only left click
    setDragState({ draggedCard: card, fromColumnIndex: columnIndex, fromCardIndex: cardIndex });
    setMousePosition({ x: e.clientX, y: e.clientY });

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);
  }

  // Handle dragging movement
  function handlePointerMove(e: PointerEvent) {
    setMousePosition({ x: e.clientX, y: e.clientY });

    const currentDragState = dragStateRef.current;
    if (!currentDragState.draggedCard || currentDragState.fromColumnIndex === null) return;

    const allColumnRefs = [leftColumnRef.current, rightColumnRef.current];
    let currentHoverColumn: number | null = null;
    let newInsertIndex: number | null = null;

    for (let col = 0; col < 2; col++) {
      const colDiv = allColumnRefs[col];
      if (!colDiv) continue;

      const rect = colDiv.getBoundingClientRect();

      if (
        e.clientX >= rect.left &&
        e.clientX <= rect.right &&
        e.clientY >= rect.top &&
        e.clientY <= rect.bottom
      ) {
        currentHoverColumn = col;

        const cardDomElements = Array.from(colDiv.querySelectorAll(".card-item")) as HTMLElement[];

        newInsertIndex = cardDomElements.length;

        for (let i = 0; i < cardDomElements.length; i++) {
          const cardRect = cardDomElements[i].getBoundingClientRect();
          if (e.clientY < cardRect.top + cardRect.height / 2) {
            newInsertIndex = i;
            break;
          }
        }
        break;
      }
    }

    if (currentHoverColumn !== null && newInsertIndex !== null) {
      setPlaceholderData({
        columnIndex: currentHoverColumn,
        insertIndex: newInsertIndex,
        height: currentDragState.draggedCard.boxHeight,
        isVisible: true,
      });
    } else {
      setPlaceholderData({ columnIndex: null, insertIndex: null, height: 0, isVisible: false });
    }
  }

  // Handle drag end event
  function handlePointerUp() {
    window.removeEventListener("pointermove", handlePointerMove);
    window.removeEventListener("pointerup", handlePointerUp);

    const currentDragState = dragStateRef.current;
    const currentPlaceholder = placeholderDataRef.current;

    if (
      currentDragState.draggedCard &&
      currentPlaceholder.isVisible &&
      currentPlaceholder.columnIndex !== null &&
      currentPlaceholder.insertIndex !== null &&
      currentDragState.fromColumnIndex !== null &&
      currentDragState.fromCardIndex !== null
    ) {
      const fromCol = currentDragState.fromColumnIndex;
      const fromCardIdx = currentDragState.fromCardIndex;
      const toCol = currentPlaceholder.columnIndex;
      let insertAt = currentPlaceholder.insertIndex;

      setCardColumns((prevColumns) => {
        const newColumns: [CardItem[], CardItem[]] = [
          Array.from(prevColumns[0]),
          Array.from(prevColumns[1]),
        ];

        const fromArr = newColumns[fromCol];
        const toArr = newColumns[toCol];

        const removeIndex = fromArr.findIndex(
          (c) => c.uniqueId === currentDragState.draggedCard!.uniqueId
        );
        if (removeIndex !== -1) {
          fromArr.splice(removeIndex, 1);
        }

        // Adjust insert index if moving within same column & forward
        if (fromCol === toCol && insertAt > fromCardIdx) {
          insertAt--;
        }

        toArr.splice(insertAt, 0, currentDragState.draggedCard!);

        return newColumns;
      });
    }

    // Reset drag and placeholder states
    setDragState({ draggedCard: null, fromColumnIndex: null, fromCardIndex: null });
    setPlaceholderData({ columnIndex: null, insertIndex: null, height: 0, isVisible: false });
  }

  // Render cards inside each column, plus placeholder when dragging
  function showColumn(columnIndex: number) {
    const cards = cardColumns[columnIndex];
    const jsxItems = [];

    for (let i = 0; i < cards.length; i++) {
      // Render placeholder if visible at this index
      if (
        placeholderData.isVisible &&
        placeholderData.columnIndex === columnIndex &&
        placeholderData.insertIndex === i
      ) {
        jsxItems.push(
          <div
            key={"placeholder-" + i}
            className="rounded-lg border-2 border-sky-400 bg-sky-100 animate-pulse mb-3 transition-all"
            style={{
              height: placeholderData.height,
              boxShadow: "0 0 10px 3px #38bdf8",
            }}
          />
        );
      }

      const card = cards[i];

      jsxItems.push(
        <div
          key={card.uniqueId}
          onPointerDown={(e) => handleDragStart(e, card, columnIndex, i)}
          className={`card-item rounded-lg p-4 shadow select-none cursor-grab mb-3 transition-all ${
            dragState.draggedCard?.uniqueId === card.uniqueId ? "ring-2 ring-sky-400" : ""
          }`}
          style={{
            background: card.bgColor,
            height: card.boxHeight,
            opacity: dragState.draggedCard?.uniqueId === card.uniqueId ? 0.9 : 1,
            userSelect: "none",
          }}
        >
          {card.label}
        </div>
      );
    }

    // Placeholder at end of list if needed
    if (
      placeholderData.isVisible &&
      placeholderData.columnIndex === columnIndex &&
      placeholderData.insertIndex === cards.length
    ) {
      jsxItems.push(
        <div
          key="placeholder-end"
          className="rounded-lg border-2 border-sky-400 bg-sky-100 animate-pulse mb-3 transition-all"
          style={{
            height: placeholderData.height,
            boxShadow: "0 0 10px 3px #38bdf8",
          }}
        />
      );
    }

    return <div>{jsxItems}</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8 font-sans">
      <div className="flex gap-6">
        <div ref={leftColumnRef} className="flex-1 bg-white p-4 rounded-lg min-h-[420px]">
          {showColumn(0)}
        </div>
        <div ref={rightColumnRef} className="flex-1 bg-white p-4 rounded-lg min-h-[420px]">
          {showColumn(1)}
        </div>
      </div>

      {/* Overlay darkness with radial gradient */}
      {dragState.draggedCard && (
        <div
          className="fixed inset-0 pointer-events-none"
          style={{
            background: `radial-gradient(circle 160px at ${mousePosition.x}px ${mousePosition.y}px, transparent 0%, rgba(0,0,0,0.6) 80%)`,
            zIndex: 10,
            transition: "background 0.2s",
          }}
        />
      )}

      {/* Floating dragged card */}
      {dragState.draggedCard && (
        <div
          className="fixed pointer-events-none rounded-lg p-4 shadow animate-pulse"
          style={{
            left: mousePosition.x,
            top: mousePosition.y,
            transform: "translate(-50%, -50%)",
            background: dragState.draggedCard.bgColor,
            height: dragState.draggedCard.boxHeight,
            opacity: 0.9,
            zIndex: 30,
            width: 220,
            userSelect: "none",
            cursor: "grab",
          }}
        >
          {dragState.draggedCard.label}
        </div>
      )}
    </div>
  );
}
