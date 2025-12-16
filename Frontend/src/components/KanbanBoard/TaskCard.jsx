import React from "react";
import { Draggable } from "@hello-pangea/dnd";

const TaskCard = ({ task, index, stage, onDeleteTask }) => {
  return (
    <Draggable draggableId={task._id} index={index}>
      {(provided) => (
        <div
          className="task-card"
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          ref={provided.innerRef}
        >
          <h4>{task.title}</h4>
          <p>{task.description}</p>

          <button
            onClick={() => {
              const confirmDelete = window.confirm(
                "Are you sure you want to delete this task?"
              );
              if (confirmDelete) {
                onDeleteTask(task._id, stage);
              }
            }}
            style={{
              background: "transparent",
              border: "none",
              color: "red",
              cursor: "pointer",
              fontSize: "12px",
              marginTop: "6px",
              marginRight: "5px",
            }}
          >
            Delete
          </button>

          <small>Due: {new Date(task.dueDate).toLocaleDateString()}</small>
        </div>
      )}
    </Draggable>
  );
};

export default TaskCard;
