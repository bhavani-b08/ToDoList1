import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { insertTaskSchema } from "@shared/schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Plus, X } from "lucide-react";
import { isUnauthorizedError } from "@/lib/authUtils";

const formSchema = insertTaskSchema.extend({
  shareWith: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

interface AddTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function AddTaskModal({ isOpen, onClose, onSuccess }: AddTaskModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      priority: "medium",
      status: "pending",
      completed: false,
      shareWith: "",
    },
  });

  const createTaskMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const { shareWith, ...taskData } = data;
      const shareWithArray = shareWith
        ? shareWith.split(",").map(email => email.trim()).filter(Boolean)
        : [];

      await apiRequest("POST", "/api/tasks", {
        ...taskData,
        shareWith: shareWithArray,
        dueDate: data.dueDate ? new Date(data.dueDate) : null,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      toast({
        title: "Success",
        description: "Task created successfully!",
      });
      form.reset();
      onClose();
      onSuccess();
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
        description: "Failed to create task",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: FormData) => {
    createTaskMutation.mutate(data);
  };

  const handleClose = () => {
    form.reset();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            Add New Task
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClose}
              className="p-2 text-slate-400 hover:text-slate-600"
            >
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {/* Task Title */}
          <div>
            <Label htmlFor="title" className="text-sm font-medium text-slate-700">
              Task Title
            </Label>
            <Input
              id="title"
              placeholder="Enter task title..."
              {...form.register("title")}
              className="mt-2"
            />
            {form.formState.errors.title && (
              <p className="text-red-500 text-sm mt-1">{form.formState.errors.title.message}</p>
            )}
          </div>

          {/* Task Description */}
          <div>
            <Label htmlFor="description" className="text-sm font-medium text-slate-700">
              Description
            </Label>
            <Textarea
              id="description"
              placeholder="Enter task description..."
              rows={3}
              {...form.register("description")}
              className="mt-2 resize-none"
            />
          </div>

          {/* Due Date and Priority */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="dueDate" className="text-sm font-medium text-slate-700">
                Due Date
              </Label>
              <Input
                id="dueDate"
                type="date"
                {...form.register("dueDate")}
                className="mt-2"
              />
            </div>
            <div>
              <Label htmlFor="priority" className="text-sm font-medium text-slate-700">
                Priority
              </Label>
              <Select
                value={form.watch("priority")}
                onValueChange={(value) => form.setValue("priority", value as "low" | "medium" | "high")}
              >
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Share Settings */}
          <div>
            <Label htmlFor="shareWith" className="text-sm font-medium text-slate-700">
              Share with others (optional)
            </Label>
            <Input
              id="shareWith"
              type="email"
              placeholder="Enter email addresses separated by commas..."
              {...form.register("shareWith")}
              className="mt-2"
            />
            <p className="text-xs text-slate-500 mt-1">
              Recipients will be able to view and collaborate on this task
            </p>
          </div>

          {/* Modal Actions */}
          <div className="flex space-x-3 pt-4">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={handleClose}
              disabled={createTaskMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1"
              disabled={createTaskMutation.isPending}
              data-add-task
            >
              {createTaskMutation.isPending ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
              ) : (
                <Plus className="h-4 w-4 mr-2" />
              )}
              Add Task
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
