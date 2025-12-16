import React, { useState } from "react";
import KanbanBoard from "../components/KanbanBoard/KanbanBoard";
import CreateTaskModal from "../components/KanbanBoard/CreateTaskModal";

const Tasks = () => {
  const [openModal, setOpenModal] = useState(false);

  return (
    <div className="ml-64 h-screen overflow-y-auto p-6">

      <h2 style={{ color: "black", marginBottom: "20px" }}>Task Board</h2>

      {/* New Task Button */}
      <button
        onClick={() => setOpenModal(true)}
        style={{
          padding: "10px 16px",
          background: "#4a90e2",
          color: "white",
          border: "none",
          borderRadius: "6px",
          cursor: "pointer",
          marginBottom: "15px"
        }}
      >
        + New Task
      </button>

      <KanbanBoard openModal={openModal} setOpenModal={setOpenModal} />

      {openModal && (
        <CreateTaskModal setOpenModal={setOpenModal} />
      )}

    </div>
  );
};

export default Tasks;
