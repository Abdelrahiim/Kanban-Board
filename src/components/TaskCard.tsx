import { useState } from "react";
import DeleteIcon from "../icons/DeleteIcon";
import { Id, Task } from "../type";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
interface Props {
    task: Task;
    deleteTask: (id: Id) => void;
    updateTask: (id: Id, content: string) => void;
}

function TaskCard({ task, deleteTask, updateTask }: Props) {
    const [mouseIsOver, setMouseIsOver] = useState<boolean>(false);
    const [editMode, setEditMode] = useState<boolean>(false);
    const { setNodeRef, attributes, listeners, transform, transition, isDragging } = useSortable({
        id: task.id,
        data: {
            type: "Task",
            task,
        },
        disabled: editMode,
    });
    const style = {
        transition,
        transform: CSS.Transform.toString(transform),
    };

    if (isDragging) {
        return (
            <div
                ref={setNodeRef}
                style={style}
                className="bg-columnBackgroundColor opacity-40 border-2 border-rose-500  h-[100px] min-h-[100px] rounded-md flex flex-col"></div>
        );
    }
    return (
        <div
            ref={setNodeRef}
            style={style}
            {...listeners}
            {...attributes}
            className="bg-mainBackgroundColor cursor-grab task p-2.5 h-[100px] min-h-[100px] flex items-center justify-between rounded-xl  text-left hover:ring-2 hover:ring-inset hover:ring-red-500 "
            onMouseEnter={() => {
                setMouseIsOver(true);
            }}
            onMouseLeave={() => {
                setMouseIsOver(false);
            }}
            onClick={() => {
                setEditMode(true);
            }}>
            {!editMode && (
                <p className="my-auto h-[90%] w-full overflow-y-auto overflow-x-auto whitespace-pre-wrap">
                    {task.content}
                </p>
            )}
            {editMode && (
                <textarea
                    className="h-[90%] focus:outline-none w-full resize-none border-none rounded bg-transparent text-white"
                    value={task.content}
                    autoFocus
                    placeholder="Text Content Here"
                    onBlur={() => {
                        setEditMode(false);
                    }}
                    onChange={(e) => {
                        updateTask(task.id, e.target.value);
                    }}
                    onKeyDown={(e) => {
                        if (e.key === "Enter" && e.shiftKey) {
                            setEditMode(false);
                        }
                        return;
                    }}></textarea>
            )}

            {!editMode && mouseIsOver && (
                <button
                    onClick={() => {
                        deleteTask(task.id);
                    }}
                    className="stroke-white opacity-60 hover:opacity-100 bg-columnBackgroundColor p-2  rounded">
                    <DeleteIcon />
                </button>
            )}
        </div>
    );
}
export default TaskCard;
