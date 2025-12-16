import React, { useState } from "react";
import api from "../../api/axios";
import "./modal.css";

const CreateTaskModal = ({ setOpenModal }) => {
    const user = JSON.parse(localStorage.getItem("user"));

  const [form, setForm] = useState({
    title: "",
    description: "",
    dueDate: "",
    stage: "backlog"
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const createTask = async () => {
    try {
      await api.post("/api/tasks", {
        ...form,
        createdBy: user._id
      });

      // Close modal
      setOpenModal(false);

      // Reload the page OR trigger Kanban refresh
      window.location.reload();
    } catch (err) {
      console.error(err);
      alert("Error creating task");
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal">

        <h2>Create New Task</h2>

        <input
          name="title"
          placeholder="Task Title"
          value={form.title}
          onChange={handleChange}
        />

        <textarea
          name="description"
          placeholder="Description"
          rows="3"
          value={form.description}
          onChange={handleChange}
        />

        <input
          type="date"
          name="dueDate"
          value={form.dueDate}
          onChange={handleChange}
        />

        <select name="stage" value={form.stage} onChange={handleChange}>
          <option value="backlog">Backlog</option>
          <option value="todo">Todo</option>
          <option value="in-progress">In Progress</option>
          <option value="completed">Completed</option>
        </select>

        <div className="modal-actions">
          <button className="cancel" onClick={() => setOpenModal(false)}>
            Cancel
          </button>

          <button className="create" onClick={createTask}>
            Create Task
          </button>
        </div>

      </div>
    </div>
  );
};

export default CreateTaskModal;
