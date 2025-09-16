import { useState } from "react";
import AnimatedBackground from "@/components/AnimatedBackground";
import MissionHeader from "@/components/missions/MissionHeader";
import MissionKPIs from "@/components/missions/MissionKPIs";
import MissionFilters from "@/components/missions/MissionFilters";
import MissionTable from "@/components/missions/MissionTable";
import MissionKanban from "@/components/missions/MissionKanban";
import { MissionCreateDrawer } from "@/components/missions/MissionCreateDrawer";
import { ViewMode, MissionFilters as FilterType } from "@/lib/types";
import { mockMissions } from "@/lib/mock-data";

const Missions = () => {
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [isCreateDrawerOpen, setIsCreateDrawerOpen] = useState(false);
  const [filters, setFilters] = useState<FilterType>({
    search: "",
    status: [],
    client: [],
    assignedTo: [],
    dateRange: {}
  });

  // Filter missions based on current filters
  const filteredMissions = mockMissions.filter(mission => {
    const matchesSearch = filters.search === "" || 
      mission.client.name.toLowerCase().includes(filters.search.toLowerCase()) ||
      mission.vehicle.brand.toLowerCase().includes(filters.search.toLowerCase()) ||
      mission.vehicle.model.toLowerCase().includes(filters.search.toLowerCase()) ||
      mission.vehicle.registration.toLowerCase().includes(filters.search.toLowerCase()) ||
      mission.itinerary.departure.address.toLowerCase().includes(filters.search.toLowerCase()) ||
      mission.itinerary.arrival.address.toLowerCase().includes(filters.search.toLowerCase());

    const matchesStatus = filters.status.length === 0 || 
      filters.status.includes(mission.status);

    return matchesSearch && matchesStatus;
  });

  const handleCreateMission = () => {
    setIsCreateDrawerOpen(true);
  };

  const handleCloseCreateDrawer = () => {
    setIsCreateDrawerOpen(false);
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <AnimatedBackground />
      
      <div className="relative z-10 container mx-auto px-4 py-6">
        <MissionHeader onCreateMission={handleCreateMission} />
        
        <MissionKPIs />
        
        <MissionFilters
          filters={filters}
          onFiltersChange={setFilters}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
        />

        {viewMode === "list" ? (
          <MissionTable missions={filteredMissions} />
        ) : (
          <MissionKanban missions={filteredMissions} />
        )}
      </div>

      <MissionCreateDrawer
        open={isCreateDrawerOpen}
        onClose={handleCloseCreateDrawer}
      />
    </div>
  );
};

export default Missions;