import { useState } from "react";
import { Search, Filter, Calendar, Download, List, Kanban } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ViewMode, MissionFilters as FilterType } from "@/lib/types";
import { getStatusLabel } from "@/lib/mock-data";

interface MissionFiltersProps {
  filters: FilterType;
  onFiltersChange: (filters: FilterType) => void;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
}

const MissionFilters = ({ filters, onFiltersChange, viewMode, onViewModeChange }: MissionFiltersProps) => {
  const [activeFiltersCount, setActiveFiltersCount] = useState(0);

  const handleSearchChange = (value: string) => {
    onFiltersChange({ ...filters, search: value });
  };

  const handleStatusFilter = (status: string) => {
    const newStatuses = filters.status.includes(status as any)
      ? filters.status.filter(s => s !== status)
      : [...filters.status, status as any];
    onFiltersChange({ ...filters, status: newStatuses });
  };

  const clearFilters = () => {
    onFiltersChange({
      search: "",
      status: [],
      client: [],
      assignedTo: [],
      dateRange: {}
    });
  };

  const statusOptions = [
    { value: "pending", label: "En attente", color: "bg-blue-500/20 text-blue-400" },
    { value: "in-progress", label: "En cours", color: "bg-primary/20 text-primary" },
    { value: "delivered", label: "Livrée", color: "bg-green-500/20 text-green-400" },
    { value: "cancelled", label: "Annulée", color: "bg-gray-500/20 text-gray-400" }
  ];

  return (
    <div className="glass rounded-xl p-4 mb-6">
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher par client, véhicule, lieu..."
            value={filters.search}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-10 bg-background/50 border-border"
          />
        </div>

        {/* Status Filters */}
        <div className="flex flex-wrap gap-2">
          {statusOptions.map((status) => (
            <Badge
              key={status.value}
              variant={filters.status.includes(status.value as any) ? "default" : "outline"}
              className={`cursor-pointer transition-all ${
                filters.status.includes(status.value as any) 
                  ? status.color 
                  : "hover:bg-secondary"
              }`}
              onClick={() => handleStatusFilter(status.value)}
            >
              {status.label}
            </Badge>
          ))}
        </div>

        <div className="flex items-center gap-2">
          {/* Clear Filters */}
          {(filters.search || filters.status.length > 0) && (
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              Effacer
            </Button>
          )}

          {/* View Mode Toggle */}
          <div className="flex rounded-lg bg-secondary p-1">
            <Button
              variant={viewMode === "list" ? "default" : "ghost"}
              size="sm"
              onClick={() => onViewModeChange("list")}
              className={viewMode === "list" ? "bg-primary text-primary-foreground" : ""}
            >
              <List className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === "kanban" ? "default" : "ghost"}
              size="sm"
              onClick={() => onViewModeChange("kanban")}
              className={viewMode === "kanban" ? "bg-primary text-primary-foreground" : ""}
            >
              <Kanban className="h-4 w-4" />
            </Button>
          </div>

          {/* Export */}
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>
    </div>
  );
};

export default MissionFilters;