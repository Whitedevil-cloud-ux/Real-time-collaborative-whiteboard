import React, { useEffect, useState } from "react";
import { DragDropContext } from "@hello-pangea/dnd";
import Column from "./Column";
import api from "../../api/axios";
import "./kanban.css";

const KanbanBoard = () => {
  const [columns, setColumns] = useState({
    backlog: [],
    todo: [],
    "in-progress": [],
    completed: []
  });

  // Load tasks initially
  const fetchTasks = async () => {
    const res = await api.get("/api/tasks");
    const tasks = res.data;

    const grouped = {
      backlog: tasks.filter(task => task.stage === "backlog"),
      todo: tasks.filter(task => task.stage === "todo"),
      "in-progress": tasks.filter(task => task.stage === "in-progress"),
      completed: tasks.filter(task => task.stage === "completed"),
    };

    setColumns(grouped);
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  // Handle Drag
  const onDragEnd = async (result) => {
    const { destination, source } = result;

    // dropped outside
    if (!destination) return;

    // If dropped in same place → ignore
    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    ) return;

    const sourceCol = columns[source.droppableId];
    const destCol = columns[destination.droppableId];

    const movedTask = sourceCol[source.index];

    // Remove from source
    sourceCol.splice(source.index, 1);

    // Insert into destination
    destCol.splice(destination.index, 0, movedTask);

    setColumns({
      ...columns,
      [source.droppableId]: sourceCol,
      [destination.droppableId]: destCol
    });

    // Update backend stage
    await api.put(`/api/tasks/${movedTask._id}/stage`, {
      stage: destination.droppableId
    });
  };

    const deleteTask = async (taskId, stage) => {
    try {
      await api.delete(`/api/tasks/${taskId}`);

      setColumns(prev => ({
        ...prev,
        [stage]: prev[stage].filter(task => task._id !== taskId)
      }));
    } catch (err) {
      console.error(err);
      alert("Failed to delete task");
    }
  };


  return (
    <div className="kanban-container">

      <DragDropContext onDragEnd={onDragEnd}>
        {Object.entries(columns).map(([stage, tasks]) => (
          <Column key={stage} stage={stage} tasks={tasks} onDeleteTask={deleteTask} />
        ))}
      </DragDropContext>

    </div>
  );
};

export default KanbanBoard;
