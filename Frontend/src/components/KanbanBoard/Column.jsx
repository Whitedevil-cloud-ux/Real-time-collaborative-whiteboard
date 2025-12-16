import React from "react";
import { Droppable } from "@hello-pangea/dnd";
import TaskCard from "./TaskCard";

const stageLabels = {
  backlog: "Backlog",
  todo: "To Do",
  "in-progress": "In Progress",
  completed: "Completed"
};

const Column = ({ stage, tasks, onDeleteTask }) => {
  return (
    <div className="kanban-column">
      <h3>{stageLabels[stage]}</h3>

      <Droppable droppableId={stage}>
        {(provided) => (
          <div
            className="task-list"
            {...provided.droppableProps}
            ref={provided.innerRef}
          >
            {tasks.map((task, index) => (
              <TaskCard key={task._id} task={task} index={index} stage={stage} onDeleteTask={onDeleteTask} />
            ))}

            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  );
};

export default Column;
