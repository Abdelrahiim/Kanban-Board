import { useEffect, useMemo, useState } from "react";
import PlusIcon from "../icons/Plusicon";
import { APIData, Column, Id, Task } from "../type";

import ColumnContainer from "./ColumnContainer";
import axios, { AxiosError, AxiosResponse } from "axios";
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
// import TaskCard from "./TaskCard";
const KanbanBoard = (): JSX.Element => {
    const [columns, setColumns] = useState<Column[]>([]);

    const [tasks, setTasks] = useState<Task[]>([]);
    const columnsId = useMemo(() => columns.map((col) => col.id), [columns]);
    const [activeColumn, setActiveColumn] = useState<Column | null>(null);
    // const [activeTask, setActiveTask] = useState<Task | null>(null);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 10,
            },
        })
    );

    // Column Functions

    // -----------------------------------------------------------------------------
    /**
     * Create New Column instance
     *
     * */
    const createNewCollection = async () => {
        try {
            const response: AxiosResponse<Column> = await axios.post("http://localhost:8000/api/columns", {
                title: `Column ${columns.length + 1}`,
            });
            const columnToAdd = response.data;
            setColumns([...columns, columnToAdd]);
        } catch (err) {
            const e = err as AxiosError;
            console.log(e);
        }
    };

    /**
     * Update an Exiting Column instance
     * @param id
     * @param title
     */
    const updateColumn = async (id: Id, title: string) => {
        try {
            const newColumns = columns.map((col) => {
                if (col.id !== id) return col;
                return { ...col, title };
            });

            const response: AxiosResponse<Column> = await axios.put(`http://localhost:8000/api/columns/${id}`, {
                title,
            });
            console.log(response);
            setColumns(newColumns);
        } catch (err) {
            err = err as AxiosError;
            console.log(err);
        }
    };

    /**
     * Delete A Column
     * @param id
     *
     */
    const deleteColumn = async (id: Id) => {
        try {
            const newColumns = columns.filter((cols) => cols.id !== id);
            await axios.delete(`http://localhost:8000/api/columns/${id}`);

            setColumns(newColumns);
        } catch (err) {
            const e = err as AxiosError;
            console.log(e);
        }
    };

    //  DND Drag Functions

    // -------------------------------------------------------------------
    const onDragStart = (event: DragStartEvent) => {
        if (event.active.data.current?.type === "Column") {
            console.log(event.active.data.current.column);
            setActiveColumn(event.active.data.current.column);
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

    

    // Tasks Functions
    // -------------------------------------------------------------------------------------------------

    /**
     *  Create New Task
     * @param columnId
     */
    const createTask = async (columnId: Id) => {
        try {
            const response: AxiosResponse<Task> = await axios.post("http://localhost:8000/api/tasks", {
                column_id: columnId,
                content: `task ${tasks.length + 1}`,
            });
            const newTask = response.data;
            setTasks([...tasks, newTask]);
        } catch (err) {
            const e = err as AxiosError;
            console.log(e.status);
        }
    };
    /**
     *  update Existing Task
     * @param id
     * @param Content
     */
    const updateTask = async (id: Id, content: string) => {
        try {
            const response: AxiosResponse<Task> = await axios.put(`http://localhost:8000/api/tasks/${id}`, {
                content,
            });
            const newTask = tasks.map((task) => {
                if (task.id !== id) return task;
                return { ...task, content };
            });
            console.log(response.status, response.data);
            setTasks(newTask);
        } catch (err) {
            const e = err as AxiosError;
            console.log(e.status);
        }
    };

    /**
     * Delete a Task
     * @param id
     *
     */
    const deleteTask = async (id: Id) => {
        try {
            const response: AxiosResponse<Task> = await axios.delete(`http://localhost:8000/api/tasks/${id}`);
            console.log(response.status, response.data);
            const newTasks = tasks.filter((task) => task.id !== id);
            setTasks(newTasks);
        } catch (err) {
            const e = err as AxiosError;
            console.log(e.status);
        }
    };

    // Fetching
    /**
     *
     * Fetch Data From The Api and
     *
     */
    const getData = async () => {
        try {
            const response: AxiosResponse<APIData> = await axios.get("http://localhost:8000/");
            const data: APIData = response.data;
            setColumns(data.columns);
            setTasks(data.tasks);
        } catch (err) {
            err = err as AxiosError;
            console.log(err);
        }
    };

    useEffect(() => {
        getData();
    }, []);

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
                <DndContext sensors={sensors} onDragStart={onDragStart} onDragEnd={onDragEnd} >
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
                                    updateColumn={function (): void {}}
                                    deleteColumn={function (): void {}}
                                    createTask={function (): void {}}
                                    deleteTask={function (): void {}}
                                    updateTask={function (): void {}}
                                />
                            )}
                            {/* {activeTask && (
                                <TaskCard
                                    task={activeTask}
                                    deleteTask={function (): void {}}
                                    updateTask={function (): void {}}
                                />
                            )} */}
                        </DragOverlay>,
                        document.body
                    )}
                </DndContext>
            </div>
        </main>
    );
};
export default KanbanBoard;
