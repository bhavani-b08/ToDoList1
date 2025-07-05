import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { CheckCircle, ChevronDown } from "lucide-react";
import { TaskFilters } from "@/components/task-filters";
import { TaskList } from "@/components/task-list";
import { AddTaskModal } from "@/components/add-task-modal";
import { ShareTaskModal } from "@/components/share-task-modal";
import { useQuery } from "@tanstack/react-query";
import { Task } from "@shared/schema";
import { isUnauthorizedError } from "@/lib/authUtils";

export default function Home() {
  const { user, isLoading } = useAuth();
  const { toast } = useToast();
  const [isAddTaskModalOpen, setIsAddTaskModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [activeFilter, setActiveFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("created_desc");

  const {
    data: tasks = [],
    isLoading: tasksLoading,
    error: tasksError,
    refetch: refetchTasks,
  } = useQuery<Task[]>({
    queryKey: ["/api/tasks"],
    enabled: !!user,
  });

  // Handle unauthorized errors at page level
  useEffect(() => {
    if (tasksError && isUnauthorizedError(tasksError as Error)) {
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
  }, [tasksError, toast]);

  // Periodic refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (user) {
        refetchTasks();
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [user, refetchTasks]);

  // Filter and sort tasks
  const filteredAndSortedTasks = tasks
    .filter((task) => {
      // Filter by status
      if (activeFilter === "pending" && task.status !== "pending") return false;
      if (activeFilter === "progress" && task.status !== "progress") return false;
      if (activeFilter === "completed" && !task.completed) return false;

      // Filter by search query
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          task.title.toLowerCase().includes(query) ||
          task.description?.toLowerCase().includes(query)
        );
      }

      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "created_asc":
          return new Date(a.createdAt!).getTime() - new Date(b.createdAt!).getTime();
        case "created_desc":
          return new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime();
        case "due_asc":
          if (!a.dueDate && !b.dueDate) return 0;
          if (!a.dueDate) return 1;
          if (!b.dueDate) return -1;
          return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
        case "priority_desc":
          const priorityOrder = { high: 3, medium: 2, low: 1 };
          return priorityOrder[b.priority as keyof typeof priorityOrder] - priorityOrder[a.priority as keyof typeof priorityOrder];
        default:
          return 0;
      }
    });

  // Calculate task counts
  const taskCounts = {
    all: tasks.length,
    pending: tasks.filter(t => t.status === "pending").length,
    progress: tasks.filter(t => t.status === "progress").length,
    completed: tasks.filter(t => t.completed).length,
  };

  const handleShareTask = (task: Task) => {
    setSelectedTask(task);
    setIsShareModalOpen(true);
  };

  if (isLoading || tasksLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Loading your tasks...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <CheckCircle className="h-5 w-5 text-white" />
              </div>
              <h1 className="text-xl font-semibold text-slate-900">TaskFlow</h1>
            </div>

            {/* User Profile & Actions */}
            <div className="flex items-center space-x-4">
              {/* Sync Status */}
              <div className="flex items-center space-x-2 text-sm text-slate-600">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                <span>Synced</span>
              </div>

              {/* User Profile */}
              <div className="flex items-center space-x-3">
                <img
                  src={user?.profileImageUrl || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&h=150"}
                  alt="User profile"
                  className="w-8 h-8 rounded-full object-cover"
                />
                <span className="text-sm font-medium text-slate-700">
                  {user?.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : user?.email}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => window.location.href = '/api/logout'}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <TaskFilters
          activeFilter={activeFilter}
          onFilterChange={setActiveFilter}
          taskCounts={taskCounts}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          sortBy={sortBy}
          onSortChange={setSortBy}
        />

        <TaskList
          tasks={filteredAndSortedTasks}
          isLoading={tasksLoading}
          onShareTask={handleShareTask}
          onRefresh={refetchTasks}
        />
      </main>

      {/* Floating Action Button */}
      <Button
        className="fixed bottom-6 right-6 w-14 h-14 bg-primary text-white rounded-full shadow-lg hover:bg-primary/90 hover:shadow-xl transition-all duration-300 z-30"
        onClick={() => setIsAddTaskModalOpen(true)}
      >
        <CheckCircle className="h-6 w-6" />
      </Button>

      <AddTaskModal
        isOpen={isAddTaskModalOpen}
        onClose={() => setIsAddTaskModalOpen(false)}
        onSuccess={() => refetchTasks()}
      />

      <ShareTaskModal
        isOpen={isShareModalOpen}
        task={selectedTask}
        onClose={() => {
          setIsShareModalOpen(false);
          setSelectedTask(null);
        }}
        onSuccess={() => refetchTasks()}
      />
    </div>
  );
}
