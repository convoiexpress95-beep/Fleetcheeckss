import { TripCard } from "./TripCard";

const mockTrips = [
  {
    id: "1",
    departure: "Paris",
    destination: "Lyon",
    departureTime: "08:30",
    duration: "4h 30min",
    price: 25,
    availableSeats: 3,
    route: ["Melun", "Auxerre", "Chalon-sur-Saône"],
    driver: {
      id: "d1",
      name: "Marie Dubois",
      avatar: "/placeholder-avatar.jpg",
      rating: 4.8,
      reviewCount: 127,
      isVerified: true,
    },
  },
  {
    id: "2",
    departure: "Paris",
    destination: "Lyon",
    departureTime: "14:15",
    duration: "4h 45min",
    price: 28,
    availableSeats: 2,
    route: ["Fontainebleau", "Sens", "Mâcon"],
    driver: {
      id: "d2",
      name: "Thomas Martin",
      avatar: "/placeholder-avatar.jpg",
      rating: 4.9,
      reviewCount: 89,
      isVerified: true,
    },
  },
  {
    id: "3",
    departure: "Paris",
    destination: "Lyon",
    departureTime: "18:45",
    duration: "4h 20min",
    price: 30,
    availableSeats: 1,
    route: ["Nemours", "Joigny", "Villefranche"],
    driver: {
      id: "d3",
      name: "Sophie Leclerc",
      avatar: "/placeholder-avatar.jpg",
      rating: 4.7,
      reviewCount: 203,
      isVerified: false,
    },
  },
];

export function TripList() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-foreground">
          Trajets disponibles
        </h2>
        <div className="text-sm text-muted-foreground">
          {mockTrips.length} trajets trouvés
        </div>
      </div>
      
      <div className="space-y-4">
        {mockTrips.map((trip) => (
          <TripCard key={trip.id} trip={trip} />
        ))}
      </div>
    </div>
  );
}