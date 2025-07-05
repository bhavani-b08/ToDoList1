import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search } from "lucide-react";

interface TaskFiltersProps {
  activeFilter: string;
  onFilterChange: (filter: string) => void;
  taskCounts: {
    all: number;
    pending: number;
    progress: number;
    completed: number;
  };
  searchQuery: string;
  onSearchChange: (query: string) => void;
  sortBy: string;
  onSortChange: (sort: string) => void;
}

export function TaskFilters({
  activeFilter,
  onFilterChange,
  taskCounts,
  searchQuery,
  onSearchChange,
  sortBy,
  onSortChange,
}: TaskFiltersProps) {
  const filters = [
    { key: "all", label: "All", count: taskCounts.all },
    { key: "pending", label: "Pending", count: taskCounts.pending },
    { key: "progress", label: "In Progress", count: taskCounts.progress },
    { key: "completed", label: "Completed", count: taskCounts.completed },
  ];

  return (
    <div className="mb-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold text-slate-900">My Tasks</h2>
          <p className="text-slate-600 text-sm mt-1">Stay organized and productive</p>
        </div>
        
        {/* Filter Chips */}
        <div className="flex flex-wrap gap-2">
          {filters.map((filter) => (
            <Button
              key={filter.key}
              variant={activeFilter === filter.key ? "default" : "secondary"}
              size="sm"
              onClick={() => onFilterChange(filter.key)}
              className={`rounded-full text-sm font-medium transition-all ${
                activeFilter === filter.key
                  ? "bg-primary text-white hover:bg-primary/90"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              {filter.label}{" "}
              <span className={`ml-1 px-2 py-0.5 rounded-full text-xs ${
                activeFilter === filter.key
                  ? "bg-primary-foreground/20"
                  : "bg-slate-200"
              }`}>
                {filter.count}
              </span>
            </Button>
          ))}
        </div>
      </div>

      {/* Search and Sort */}
      <div className="mt-6 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
          <Input
            type="text"
            placeholder="Search tasks..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={sortBy} onValueChange={onSortChange}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="created_desc">Newest First</SelectItem>
            <SelectItem value="created_asc">Oldest First</SelectItem>
            <SelectItem value="due_asc">Due Date</SelectItem>
            <SelectItem value="priority_desc">Priority</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
