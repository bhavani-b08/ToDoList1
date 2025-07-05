import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Task } from "@shared/schema";
import { Calendar, Share2, Edit, Trash2, Users, Flag, Check, ListTodo } from "lucide-react";
import { format } from "date-fns";
import { isUnauthorizedError } from "@/lib/authUtils";

interface TaskListProps {
  tasks: Task[];
  isLoading: boolean;
  onShareTask: (task: Task) => void;
  onRefresh: () => void;
}

export function TaskList({ tasks, isLoading, onShareTask, onRefresh }: TaskListProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const toggleTaskMutation = useMutation({
    mutationFn: async ({ id, completed, status }: { id: number; completed: boolean; status: string }) => {
      await apiRequest("PATCH", `/api/tasks/${id}`, { 
        completed, 
        status: completed ? "completed" : status 
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      toast({
        title: "Success",
        description: "Task updated successfully!",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to update task",
        variant: "destructive",
      });
    },
  });

  const deleteTaskMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/tasks/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      toast({
        title: "Success",
        description: "Task deleted successfully!",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to delete task",
        variant: "destructive",
      });
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      await apiRequest("PATCH", `/api/tasks/${id}`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      toast({
        title: "Success",
        description: "Task status updated!",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to update task status",
        variant: "destructive",
      });
    },
  });

  const handleToggleComplete = (task: Task) => {
    const newCompleted = !task.completed;
    toggleTaskMutation.mutate({
      id: task.id,
      completed: newCompleted,
      status: newCompleted ? "completed" : task.status,
    });
  };

  const handleDeleteTask = (id: number) => {
    if (confirm("Are you sure you want to delete this task?")) {
      deleteTaskMutation.mutate(id);
    }
  };

  const handleStatusChange = (id: number, newStatus: string) => {
    updateStatusMutation.mutate({ id, status: newStatus });
  };

  const getStatusBadge = (status: string, completed: boolean) => {
    if (completed) {
      return (
        <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100">
          <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full mr-1.5"></div>
          Completed
        </Badge>
      );
    }
    
    switch (status) {
      case "progress":
        return (
          <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100">
            <div className="w-1.5 h-1.5 bg-amber-500 rounded-full mr-1.5"></div>
            In Progress
          </Badge>
        );
      case "pending":
        return (
          <Badge className="bg-slate-100 text-slate-700 hover:bg-slate-100">
            <div className="w-1.5 h-1.5 bg-slate-500 rounded-full mr-1.5"></div>
            Pending
          </Badge>
        );
      default:
        return (
          <Badge variant="secondary">
            <div className="w-1.5 h-1.5 bg-slate-500 rounded-full mr-1.5"></div>
            {status}
          </Badge>
        );
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case "high":
        return <Flag className="h-4 w-4 text-red-500" />;
      case "medium":
        return <Flag className="h-4 w-4 text-amber-500" />;
      case "low":
        return <Flag className="h-4 w-4 text-slate-400" />;
      default:
        return <Flag className="h-4 w-4 text-slate-400" />;
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 animate-pulse">
            <div className="flex items-start space-x-4">
              <div className="w-5 h-5 bg-slate-200 rounded"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-slate-200 rounded w-3/4"></div>
                <div className="h-3 bg-slate-200 rounded w-1/2"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (tasks.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <ListTodo className="h-8 w-8 text-slate-400" />
        </div>
        <h3 className="text-slate-900 font-medium text-lg mb-2">No tasks found</h3>
        <p className="text-slate-500 text-sm mb-6">Get started by creating your first task</p>
        <Button onClick={() => document.querySelector<HTMLButtonElement>('[data-add-task]')?.click()}>
          <ListTodo className="h-4 w-4 mr-2" />
          Add First Task
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {tasks.map((task) => (
        <div
          key={task.id}
          className={`bg-white rounded-xl p-6 shadow-sm border border-slate-200 hover:shadow-md transition-all duration-300 ${
            task.completed ? "opacity-75" : ""
          }`}
        >
          <div className="flex items-start space-x-4">
            {/* Task Checkbox */}
            <Button
              variant="ghost"
              size="sm"
              className={`mt-1 w-5 h-5 p-0 border-2 rounded hover:border-primary transition-colors flex items-center justify-center ${
                task.completed
                  ? "bg-emerald-500 border-emerald-500"
                  : "border-slate-300"
              }`}
              onClick={() => handleToggleComplete(task)}
              disabled={toggleTaskMutation.isPending}
            >
              {task.completed && <Check className="h-3 w-3 text-white" />}
            </Button>

            {/* Task Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3
                    className={`text-slate-900 font-medium text-base leading-6 ${
                      task.completed ? "line-through text-slate-500" : ""
                    }`}
                  >
                    {task.title}
                  </h3>
                  {task.description && (
                    <p
                      className={`text-slate-600 text-sm mt-1 line-clamp-2 ${
                        task.completed ? "text-slate-400" : ""
                      }`}
                    >
                      {task.description}
                    </p>
                  )}
                </div>

                {/* Task Actions */}
                <div className="flex items-center space-x-2 ml-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onShareTask(task)}
                    className="p-2 text-slate-400 hover:text-primary hover:bg-primary/10"
                  >
                    <Share2 className="h-4 w-4" />
                  </Button>
                  
                  <select
                    value={task.status}
                    onChange={(e) => handleStatusChange(task.id, e.target.value)}
                    className="text-xs border border-slate-200 rounded px-2 py-1 text-slate-600 hover:border-amber-300"
                    disabled={task.completed || updateStatusMutation.isPending}
                  >
                    <option value="pending">Pending</option>
                    <option value="progress">In Progress</option>
                    <option value="completed">Completed</option>
                  </select>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteTask(task.id)}
                    className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50"
                    disabled={deleteTaskMutation.isPending}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Task Meta Information */}
              <div className="flex items-center justify-between mt-4">
                <div className="flex items-center space-x-4">
                  {/* Status Badge */}
                  {getStatusBadge(task.status, task.completed)}

                  {/* Due Date */}
                  {task.dueDate && (
                    <div className="flex items-center text-slate-500 text-sm">
                      <Calendar className="h-4 w-4 mr-1.5" />
                      <span>{format(new Date(task.dueDate), "MMM dd, yyyy")}</span>
                    </div>
                  )}

                  {/* Shared indicator */}
                  {task.shareWith && task.shareWith.length > 0 && (
                    <div className="flex items-center text-slate-500 text-sm">
                      <Users className="h-4 w-4 mr-1.5" />
                      <span>Shared</span>
                    </div>
                  )}
                </div>

                {/* Priority Indicator */}
                <div className="flex items-center space-x-1">
                  {getPriorityIcon(task.priority)}
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
