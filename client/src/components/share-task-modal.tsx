import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Task } from "@shared/schema";
import { Share2, X } from "lucide-react";
import { isUnauthorizedError } from "@/lib/authUtils";

interface ShareTaskModalProps {
  isOpen: boolean;
  task: Task | null;
  onClose: () => void;
  onSuccess: () => void;
}

export function ShareTaskModal({ isOpen, task, onClose, onSuccess }: ShareTaskModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [emails, setEmails] = useState("");
  const [permission, setPermission] = useState("view");

  const shareTaskMutation = useMutation({
    mutationFn: async ({ taskId, emailList }: { taskId: number; emailList: string[] }) => {
      await apiRequest("POST", `/api/tasks/${taskId}/share`, {
        emails: emailList,
        permission,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      toast({
        title: "Success",
        description: "Task shared successfully!",
      });
      setEmails("");
      setPermission("view");
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
        description: "Failed to share task",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!task || !emails.trim()) {
      toast({
        title: "Error",
        description: "Please enter at least one email address",
        variant: "destructive",
      });
      return;
    }

    const emailList = emails
      .split(",")
      .map(email => email.trim())
      .filter(Boolean);

    if (emailList.length === 0) {
      toast({
        title: "Error",
        description: "Please enter valid email addresses",
        variant: "destructive",
      });
      return;
    }

    shareTaskMutation.mutate({ taskId: task.id, emailList });
  };

  const handleClose = () => {
    setEmails("");
    setPermission("view");
    onClose();
  };

  if (!task) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            Share Task
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

        <div className="space-y-4">
          {/* Task Preview */}
          <div className="bg-slate-50 rounded-lg p-4">
            <h4 className="font-medium text-slate-900 mb-1">{task.title}</h4>
            {task.description && (
              <p className="text-sm text-slate-600 line-clamp-2">{task.description}</p>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="emails" className="text-sm font-medium text-slate-700">
                Share with
              </Label>
              <Input
                id="emails"
                type="email"
                placeholder="Enter email addresses separated by commas..."
                value={emails}
                onChange={(e) => setEmails(e.target.value)}
                className="mt-2"
                required
              />
            </div>

            <div>
              <Label htmlFor="permission" className="text-sm font-medium text-slate-700">
                Permission Level
              </Label>
              <Select value={permission} onValueChange={setPermission}>
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder="Select permission" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="view">View Only</SelectItem>
                  <SelectItem value="edit">Can Edit</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex space-x-3 pt-4">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={handleClose}
                disabled={shareTaskMutation.isPending}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1"
                disabled={shareTaskMutation.isPending}
              >
                {shareTaskMutation.isPending ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                ) : (
                  <Share2 className="h-4 w-4 mr-2" />
                )}
                Share Task
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
