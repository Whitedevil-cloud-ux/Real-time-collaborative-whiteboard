import { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import { fabric } from "fabric-pure-browser";

const socket = io("http://localhost:8080");

export default function Whiteboard() {
  const canvasRef = useRef(null);
  const historyRef = useRef([]);
  const redoStackRef = useRef([]);

  const [brushColor, setBrushColor] = useState("#000000");
  const [brushSize, setBrushSize] = useState(3);
  const [isTextMode, setIsTextMode] = useState(false);

  // Presence & cursors
  const cursorMapRef = useRef({});
  const animationRef = useRef(null);
  const cleanupIntervalRef = useRef(null);

  // Read logged user from localStorage
  const loggedUser = (() => {
    try {
      return JSON.parse(localStorage.getItem("user"));
    } catch {
      return null;
    }
  })();

  const userIdRef = useRef(
    loggedUser?._id || `guest_${Date.now()}_${Math.floor(Math.random() * 10000)}`
  );
  const usernameRef = useRef(loggedUser?.name || "Guest");
  const userColorRef = useRef(
    "#" + Math.floor(Math.random() * 16777215).toString(16).padStart(6, "0")
  );

  const [activeUsers, setActiveUsers] = useState([]);

  useEffect(() => {
    const canvas = new fabric.Canvas(canvasRef.current, {
      isDrawingMode: true,
      backgroundColor: "#fff",
    });

    canvasRef.current.fabricCanvas = canvas;
    canvas.freeDrawingBrush.width = brushSize;
    canvas.freeDrawingBrush.color = brushColor;

    // -------------------- UNDO / REDO --------------------
    historyRef.current.push(canvas.toJSON());

    const saveState = () => {
      historyRef.current.push(canvas.toJSON());
      redoStackRef.current = [];
    };

    canvas.on("path:created", saveState);
    canvas.on("object:added", (e) => {
      if (e.target?.isShape) saveState();
    });

    canvasRef.current.undo = () => {
      if (historyRef.current.length <= 1) return;
      redoStackRef.current.push(historyRef.current.pop());
      const prev = historyRef.current[historyRef.current.length - 1];
      canvas.loadFromJSON(prev, () => canvas.renderAll());
    };

    canvasRef.current.redo = () => {
      if (!redoStackRef.current.length) return;
      const next = redoStackRef.current.pop();
      historyRef.current.push(next);
      canvas.loadFromJSON(next, () => canvas.renderAll());
    };

    // -------------------- RESIZING --------------------
    const resizeCanvas = () => {
      const parent = document.getElementById("wb-container");
      if (!parent) return;
      canvas.setDimensions({
        width: parent.clientWidth,
        height: parent.clientHeight,
      });
      canvas.renderAll();
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    // -------------------- REAL-TIME DRAW --------------------
    canvas.on("path:created", (e) => {
      socket.emit("whiteboard-draw", e.path.toJSON());
    });

    socket.on("whiteboard-draw", (pathData) => {
      const path = fabric.Path.fromObject(pathData);
      canvas.add(path);
    });

    // -------------------- ZOOM --------------------
    canvas.on("mouse:wheel", (opt) => {
      let zoom = canvas.getZoom();
      zoom *= 0.999 ** opt.e.deltaY;
      zoom = Math.min(3, Math.max(0.3, zoom));
      canvas.zoomToPoint({ x: opt.e.offsetX, y: opt.e.offsetY }, zoom);
      opt.e.preventDefault();
      opt.e.stopPropagation();
    });

    // -------------------- PAN --------------------
    let isPanning = false;

    canvas.on("mouse:down", (opt) => {
      if (opt.e.button === 1 || canvas.spacePressed) {
        isPanning = true;
        canvas.selection = false;
      }
    });

    canvas.on("mouse:move", (opt) => {
      if (isPanning) {
        const vpt = canvas.viewportTransform;
        vpt[4] += opt.e.movementX;
        vpt[5] += opt.e.movementY;
        canvas.requestRenderAll();
      }
    });

    canvas.on("mouse:up", () => {
      isPanning = false;
      canvas.selection = true;
    });

    // -------------------- SPACEBAR HANDLING --------------------
    const handleKeyDown = (e) => {
      if (e.code === "Space") {
        canvas.isDrawingMode = false;
        canvas.spacePressed = true;
      }
    };

    const handleKeyUp = (e) => {
      if (e.code === "Space") canvas.spacePressed = false;
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    // -------------------- SELECT TOOL --------------------
    canvas.selection = true;
    canvas.on("selection:created", () => (canvas.isDrawingMode = false));
    canvas.on("selection:updated", () => (canvas.isDrawingMode = false));

    // -------------------- DELETE KEY --------------------
    const deleteKeyHandler = (e) => {
      if (e.key === "Delete" || e.key === "Backspace") {
        const obj = canvas.getActiveObject();
        if (obj) {
          canvas.remove(obj);
          historyRef.current.push(canvas.toJSON());
        }
      }
    };

    window.addEventListener("keydown", deleteKeyHandler);

    // -------------------- TEXT TOOL --------------------
    canvas.textMode = false;

    canvas.on("mouse:down", (opt) => {
      if (!canvas.textMode) return;

      const pointer = canvas.getPointer(opt.e);
      const text = new fabric.IText("Type here...", {
        left: pointer.x,
        top: pointer.y,
        fontSize: 24,
        fill: brushColor,
      });

      canvas.add(text);
      historyRef.current.push(canvas.toJSON());
      canvas.textMode = false;
    });

    // -------------------- CURSOR + PRESENCE --------------------
    const container = document.getElementById("wb-container");
    const cursorLayer = document.getElementById("cursor-layer");

    let lastEmit = 0;

    const emitCursorMove = (clientX, clientY) => {
      if (!container) return;

      const now = Date.now();
      if (now - lastEmit < 33) return;
      lastEmit = now;

      const rect = container.getBoundingClientRect();

      socket.emit("cursor-move", {
        userId: userIdRef.current,
        name: usernameRef.current,
        color: userColorRef.current,
        nx: (clientX - rect.left) / rect.width,
        ny: (clientY - rect.top) / rect.height,
      });
    };

    container?.addEventListener("mousemove", (e) =>
      emitCursorMove(e.clientX, e.clientY)
    );

    // -------------------- FIXED: listen for backend active users --------------------
    socket.on("active-users", (usersObj) => {
      const users = Object.keys(usersObj).map((uid) => ({
        userId: uid,
        name: usersObj[uid].name,
        color: usersObj[uid].color,
      }));
      setActiveUsers(users);
    });

    // -------------------- FIXED: receive cursor movement --------------------
    socket.on("cursor-move", ({ userId, name, color, nx, ny }) => {
      if (userId === userIdRef.current) return;

      const rect = container.getBoundingClientRect();
      const x = nx * rect.width;
      const y = ny * rect.height;

      if (!cursorMapRef.current[userId]) {
        const wrapper = document.createElement("div");
        wrapper.style.position = "absolute";
        wrapper.style.transform = "translate(-50%, -50%)";
        wrapper.style.pointerEvents = "none";

        const dot = document.createElement("div");
        dot.style.width = "10px";
        dot.style.height = "10px";
        dot.style.borderRadius = "50%";
        dot.style.background = color;
        dot.style.pointerEvents = "none";

        const label = document.createElement("div");
        label.innerText = name;
        label.style.fontSize = "12px";

        wrapper.appendChild(dot);
        wrapper.appendChild(label);
        cursorLayer.appendChild(wrapper);

        cursorMapRef.current[userId] = wrapper;
      }

      cursorMapRef.current[userId].style.left = `${x}px`;
      cursorMapRef.current[userId].style.top = `${y}px`;
    });

    // Announce user join (IMPORTANT)
    socket.emit("user-join", {
      userId: userIdRef.current,
      name: usernameRef.current,
      color: userColorRef.current,
    });

    // Cleanup
    return () => {
      socket.emit("user-leave", { userId: userIdRef.current });
      socket.off("whiteboard-draw");
      socket.off("cursor-move");
      socket.off("active-users");
      try {
        canvas.dispose();
      } catch {}
    };
  }, []); // FIXED: remove isTextMode dependency

  // -------------------- BRUSH SETTINGS --------------------
  useEffect(() => {
    canvasRef.current.fabricCanvas.freeDrawingBrush.color = brushColor;
  }, [brushColor]);

  useEffect(() => {
    canvasRef.current.fabricCanvas.freeDrawingBrush.width = brushSize;
  }, [brushSize]);

  // -------------------- SHAPES --------------------
  const addShape = (type) => {
    const canvas = canvasRef.current.fabricCanvas;
    canvas.isDrawingMode = false;

    let shape;
    if (type === "rect") {
      shape = new fabric.Rect({
        left: 100,
        top: 100,
        width: 120,
        height: 80,
        stroke: brushColor,
        strokeWidth: brushSize,
        fill: "transparent",
        isShape: true,
      });
    }

    if (type === "circle") {
      shape = new fabric.Circle({
        left: 100,
        top: 100,
        radius: 50,
        stroke: brushColor,
        strokeWidth: brushSize,
        fill: "transparent",
        isShape: true,
      });
    }

    canvas.add(shape);
  };

  return (
    <div
      className="ml-64 p-4"
      style={{
        position: "relative",
        height: "90vh",
        width: "calc(100vw - 20rem)",
      }}
    >
      <h1 className="text-xl font-bold mb-4">Real-Time Whiteboard</h1>

      {/* Toolbar */}
      <div className="flex items-center gap-4 mb-3">
        <button onClick={() => (canvasRef.current.fabricCanvas.isDrawingMode = true)}>Pen</button>
        <button onClick={() => {
          const canvas = canvasRef.current.fabricCanvas;
          canvas.isDrawingMode = true;
          canvas.freeDrawingBrush.color = "#ffffff";
        }}>Eraser</button>

        <input type="color" value={brushColor} onChange={(e) => setBrushColor(e.target.value)} />
        <input type="range" min="1" max="50" value={brushSize} onChange={(e) => setBrushSize(parseInt(e.target.value))} />

        <button onClick={() => canvasRef.current.undo()}>Undo</button>
        <button onClick={() => canvasRef.current.redo()}>Redo</button>

        <button onClick={() => {
          const canvas = canvasRef.current.fabricCanvas;
          canvas.isDrawingMode = false;
        }}>Select</button>

        <button onClick={() => {
          const canvas = canvasRef.current.fabricCanvas;
          canvas.isDrawingMode = false;
          canvas.textMode = true;
        }}>Text</button>

        <button onClick={() => addShape("rect")}>Rectangle</button>
        <button onClick={() => addShape("circle")}>Circle</button>
      </div>

      {/* Active Users */}
      <div
  style={{
    position: "absolute",
    right: "1rem",
    top: "5rem",
    zIndex: 200,           // ⬅️ FIX HERE
    background: "white",
    padding: "10px",
    borderRadius: "8px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
  }}
>
  <strong>Active Users</strong>
  <div style={{ marginTop: "8px" }}>
    {activeUsers.map((u) => (
      <div key={u.userId} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
        <div
          style={{
            width: 10,
            height: 10,
            borderRadius: "50%",
            background: u.color,
          }}
        />
        <span>{u.name}</span>
      </div>
    ))}
  </div>
</div>


      {/* Canvas */}
      <div id="wb-container" style={{
        position: "absolute",
        top: "6rem",
        left: "1rem",
        right: "1rem",
        bottom: "1rem",
        border: "1px solid #ccc",
      }}>
        <div id="cursor-layer" style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          zIndex: 100,
        }} />
        <canvas ref={canvasRef} style={{ width: "100%", height: "100%" }} />
      </div>
    </div>
  );
}
