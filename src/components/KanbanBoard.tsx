import { useEffect, useMemo, useState } from "react";
import PlusIcon from "../icons/Plusicon";
import { APIData, Column, Id, Task } from "../type";
import { nanoid } from "nanoid";
import ColumnContainer from "./ColumnContainer";
import axios, { AxiosResponse } from "axios";
import {
    DndContext,
    DragEndEvent,
    // DragOverEvent,
    DragOverlay,
    DragStartEvent,
    PointerSensor,
    useSensor,
    useSensors,
} from "@dnd-kit/core";
import { SortableContext, arrayMove } from "@dnd-kit/sortable";
import { createPortal } from "react-dom";
import TaskCard from "./TaskCard";
const KanbanBoard = (): JSX.Element => {
    const [columns, setColumns] = useState<Column[]>([]);

    const [tasks, setTasks] = useState<Task[]>([]);
    const columnsId = useMemo(() => columns.map((col) => col.id), []);
    const [activeColumn, setActiveColumn] = useState<Column | null>(null);
    const [activeTask, setActiveTask] = useState<Task | null>(null);
    /**
     *
     */
    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 3,
            },
        })
    );

    
    const createNewCollection = async () => {
        const response:AxiosResponse<Column> = await axios.post("http://localhost:8000/api/columns",{
            title:`Column ${columns.length +1}`
        })
        const columnToAdd = response.data
           

        setColumns([...columns, columnToAdd]);
    };

    const deleteColumn = async (id: Id) => {

        const response:AxiosResponse = await axios.delete(`http://localhost:8000/api/columns/${id}`)
        console.log(response.data)


        const newColumns = columns.filter((cols) => cols.id !== id);
        setColumns(newColumns);
    };
    const deleteTask = (id: Id) => {
        const newTasks = tasks.filter((task) => task.id !== id);
        setTasks(newTasks);
    };

    const onDragStart = (event: DragStartEvent) => {
        if (event.active.data.current?.type === "Column") {
            setActiveColumn(event.active.data.current.column);
            return;
        } else if (event.active.data.current?.type === "Task") {
            console.log(event.active.data.current.task.id);
            setActiveTask(event.active.data.current.task);
            return;
        }
    };
    const onDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        if (!over) return;
        const activeColumnId = active.id;
        const overColumnId = over.id;

        if (activeColumnId === overColumnId) return;
        setColumns((columns) => {
            const activeColumnIndex = columns.findIndex((col) => col.id === activeColumnId);
            const overColumnIndex = columns.findIndex((col) => col.id === overColumnId);
            return arrayMove(columns, activeColumnIndex, overColumnIndex);
        });
    };

    const updateColumn = async (id: Id, title: string) => {
        
        const newColumns = columns.map((col) => {
            if (col.id !== id) return col;
            return { ...col, title };
        });
        
        const response: AxiosResponse<Column> = await axios.put(`http://localhost:8000/api/columns/${id}`, {
            title,
        });
        console.log(response)
        setColumns(newColumns);
    };
    const updateTask = (id: Id, content: string) => {
        const newTask = tasks.map((task) => {
            if (task.id !== id) return task;
            return { ...task, content };
        });
        setTasks(newTask);
    };
    const createTask = (columnId: Id) => {
        const newTask: Task = {
            id: nanoid(5),
            columnId: columnId,
            content: `task ${tasks.length + 1}`,
        };
        setTasks([...tasks, newTask]);
    };
    const getColumns = async () => {
        const response: AxiosResponse<APIData> = await axios.get("http://localhost:8000/");
        const data:APIData = response.data

        setColumns(data.columns)
        setTasks(data.tasks)
        console.log(data)
    };
    useEffect(() => {
        getColumns();
    },[]);

    return (
        <main className="my-7">
            <div className="flex justify-center items-center">
                <button
                    onClick={() => {
                        createNewCollection();
                    }}
                    className="h-[60px] w-[350px] min-w-[350px] rounded-lg cursor-pointer bg-mainBackgroundColor border-2  ring-rose-500 p-4 mx-5 border-columnBackgroundColor hover:ring-2 flex gap-2">
                    <PlusIcon />
                    Add Column
                </button>
            </div>
            <div className="mx-auto  flex min-h-screen w-full items-center overflow-x-auto overflow-y-hidden px-[40px] my-8">
                <DndContext sensors={sensors} onDragStart={onDragStart} onDragEnd={onDragEnd}>
                    <div className="m-auto flex gap-4">
                        <div className="grid grid-cols-3  gap-4">
                            <SortableContext items={columnsId}>
                                {columns.map((col) => (
                                    <ColumnContainer
                                        key={col.id}
                                        deleteTask={deleteTask}
                                        tasks={tasks.filter((task) => task.columnId === col.id)}
                                        createTask={createTask}
                                        updateColumn={updateColumn}
                                        column={col}
                                        deleteColumn={deleteColumn}
                                        updateTask={updateTask}
                                    />
                                ))}
                            </SortableContext>
                        </div>
                    </div>
                    {createPortal(
                        <DragOverlay>
                            {activeColumn && (
                                <ColumnContainer
                                    tasks={tasks.filter((task) => task.columnId === activeColumn.id)}
                                    column={activeColumn}
                                    updateColumn={updateColumn}
                                    deleteColumn={deleteColumn}
                                    createTask={function (): void {}}
                                    deleteTask={function (): void {}}
                                    updateTask={function (): void {}}
                                />
                            )}
                            {activeTask && (
                                <TaskCard task={activeTask} deleteTask={deleteTask} updateTask={updateTask} />
                            )}
                        </DragOverlay>,
                        document.body
                    )}
                </DndContext>
            </div>
        </main>
    );
};
export default KanbanBoard;
