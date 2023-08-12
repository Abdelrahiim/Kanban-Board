import { SortableContext, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import DeleteIcon from "../icons/DeleteIcon";
import { Column, Id, Task } from "../type";
import { useMemo, useState } from "react";
import PlusIcon from "../icons/Plusicon";
import TaskCard from "./TaskCard";

interface Props {
    column: Column;
    deleteColumn: (id: Id) => void;
    createTask: (columnId: Id) => void;
    updateColumn: (id: Id, title: string) => void;
    tasks: Task[];
    deleteTask: (id: Id) => void;
    updateTask: (id: Id, content: string) => void;
}

function ColumnContainer({ column, deleteColumn, updateColumn, updateTask, createTask, tasks, deleteTask }: Props) {
    const [editMode, setEditMode] = useState<boolean>(false);
    const [value,SetValue] = useState<string>(column.title)
    const { setNodeRef, attributes, listeners, transform, transition, isDragging } = useSortable({
        id: column.id,
        data: {
            type: "Column",
            column,
        },
        disabled: editMode,
    });

    const style = {
        transition,
        transform: CSS.Transform.toString(transform),
    };

    const taskIDs = useMemo(() => tasks.map((task) => task.id), [tasks]);

    if (isDragging) {
        return (
            <div className="bg-columnBackgroundColor opacity-40 border-2 border-rose-500 w-[350px] h-[500px] max-h-[500px] rounded-md flex flex-col"></div>
        );
    }

    return (
        <div
            className="bg-columnBackgroundColor w-[350px] h-[500px] max-h-[500px] rounded-md flex flex-col"
            ref={setNodeRef}
            style={style}>
            {/* Column title  */}
            <div
                {...attributes}
                {...listeners}
                onClick={() => {
                    setEditMode(true);
                }}
                className="bg-mainBackgroundColor justify-between text-md  flex items-center cursor-grab rounded-md rounded-b-none p-3 font-bold border-columnBackgroundColor bottom-4">
                <div className="flex gap-2">
                    <div className="flex  justify-between items-center bg-columnBackgroundColor px-2 py-1 text-sm rounded-full">
                        0
                    </div>

                    {!editMode && column.title}
                    {editMode && (
                        <input
                            value={value}
                            autoFocus
                            className="bg-black focus:border-rose-500 border rounded outline-none px-2"
                            onBlur={() => {
                                setEditMode(false);
                            }}
                            onChange={(e) => {
                                SetValue(e.target.value)
                            }}
                            onKeyDown={(e) => {
                                if (e.key !== "Enter") return;
                                updateColumn(column.id, value);

                                setEditMode(false);
                            }}
                            type="text"
                        />
                    )}
                </div>
                <button
                    className="stroke-gray-600 rounded px-1 py-2 hover:stroke-white hover:bg-columnBackgroundColor"
                    onClick={() => {
                        deleteColumn(column.id);
                        console.log("clicked");
                    }}>
                    <DeleteIcon />
                </button>
            </div>

            {/* Column body  */}

            <div className="flex flow-grow flex-col gap-4 p-2 overflow-x-hidden overflow-y-auto">
               
                    {tasks.map((task) => (
                        <TaskCard key={task.id} updateTask={updateTask} deleteTask={deleteTask} task={task} />
                    ))}
                
            </div>

            {/* Column Footer */}
            <button
                className="flex gap-2 items-center border-columnBackgroundColor border-2 rounded-md hover:bg-mainBackgroundColor hover:text-rose-500 active:bg-black"
                onClick={() => {
                    createTask(column.id);
                }}>
                <PlusIcon />
                Add Task
            </button>
        </div>
    );
}
export default ColumnContainer;
