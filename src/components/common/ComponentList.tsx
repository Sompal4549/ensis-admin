"use client";

import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import { GripVertical, Edit2, Eye, MoreVertical, Trash2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { type ComponentContent } from "@/lib/api";

interface ComponentListProps {
  records: ComponentContent[];
  onEdit: (record: ComponentContent) => void;
  onDelete: (id: string) => void;
  onReorder: (result: DropResult) => void;
  editingId?: string | null;
  knownKeys?: string[];
}

export default function ComponentList({
  records,
  onEdit,
  onDelete,
  onReorder,
  editingId,
  knownKeys = [],
}: ComponentListProps) {
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  return (
    <DragDropContext onDragEnd={onReorder}>
      <Droppable droppableId="components-list">
        {(provided) => (
          <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-3">
            {records.map((record, index) => (
              <Draggable key={record._id} draggableId={record._id} index={index}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    className={`flex items-center justify-between rounded-xl border p-4 transition-all ${
                      snapshot.isDragging 
                        ? "bg-[#f3eee6] border-[#8d6a3a] shadow-lg z-50" 
                        : editingId === record._id 
                          ? "bg-[#f3eee6] border-[#8d6a3a]" 
                          : "bg-white border-[#eee5d9] hover:border-[#d9cdbb] shadow-sm"
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div {...provided.dragHandleProps} className="cursor-grab text-slate-300 hover:text-slate-500">
                        <GripVertical size={20} />
                      </div>
                      <div onClick={() => onEdit(record)} className="cursor-pointer">
                        <div className="font-bold text-[#1f261b] text-sm">{record.label}</div>
                        <div className="text-[10px] text-[#8d6a3a] mt-0.5 font-black uppercase tracking-tighter">
                          {record.key} • {record.isActive ? "Active" : "Inactive"}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        title="Edit"
                        disabled={knownKeys.length > 0 && !knownKeys.includes(record.key)}
                        onClick={() => onEdit(record)}
                        className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-30"
                      >
                        <Edit2 size={18} />
                      </button>
                      <Link
                        href={`/preview/${record.key}`}
                        target="_blank"
                        className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                      >
                        <Eye size={18} />
                      </Link>
                      <div className="relative">
                        <button
                          type="button"
                          onClick={() => setOpenMenuId(openMenuId === record._id ? null : record._id)}
                          className="p-2 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
                        >
                          <MoreVertical size={18} />
                        </button>
                        {openMenuId === record._id && (
                          <>
                            <div 
                              className="fixed inset-0 z-40" 
                              onClick={() => setOpenMenuId(null)}
                            />
                            <div className="absolute right-0 top-full z-50 mt-1 w-36 rounded-lg bg-white p-1 shadow-xl border border-slate-100 animate-in fade-in slide-in-from-top-2">
                              <button
                                type="button"
                                onClick={() => {
                                  onDelete(record._id);
                                  setOpenMenuId(null);
                                }}
                                className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs font-bold text-red-600 hover:bg-red-50 rounded-md"
                              >
                                <Trash2 size={14} /> Delete
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  );
}