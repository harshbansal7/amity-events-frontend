import { useState, useEffect } from "react";
import {
  getEvents,
  getRegisteredEvents,
  getCreatedEvents,
} from "../../services/api";
import { Users, Calendar, TrendingUp, Clock } from "lucide-react";

const StatCard = ({ title, value, icon: Icon, trend }) => (
  <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-600">{title}</p>
        <p className="text-2xl font-semibold mt-2">{value}</p>
        {trend && (
          <p
            className={`text-sm mt-2 ${
              trend > 0 ? "text-green-600" : "text-red-600"
            }`}
          >
            {trend > 0 ? "↑" : "↓"} {Math.abs(trend)}% from last month
          </p>
        )}
      </div>
      <div className="p-3 bg-indigo-50 rounded-lg">
        <Icon className="w-6 h-6 text-indigo-600" />
      </div>
    </div>
  </div>
);

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalEvents: 0,
    activeEvents: 0,
    totalParticipants: 0,
    upcomingEvents: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [allEvents, registeredEvents, createdEvents] = await Promise.all([
          getEvents(),
          getRegisteredEvents(),
          getCreatedEvents(),
        ]);

        const currentDate = new Date();
        const activeEvents = allEvents.filter(
          (event) => new Date(event.date) >= currentDate,
        );

        setStats({
          totalEvents: allEvents.length,
          activeEvents: activeEvents.length,
          totalParticipants: allEvents.reduce(
            (acc, event) => acc + event.participants.length,
            0,
          ),
          upcomingEvents: activeEvents.length,
        });
      } catch (error) {
        console.error("Failed to fetch dashboard stats:", error);
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500">Overview of your events and activities</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Events"
          value={stats.totalEvents}
          icon={Calendar}
          trend={12}
        />
        <StatCard
          title="Active Events"
          value={stats.activeEvents}
          icon={TrendingUp}
          trend={8}
        />
        <StatCard
          title="Total Participants"
          value={stats.totalParticipants}
          icon={Users}
          trend={15}
        />
        <StatCard
          title="Upcoming Events"
          value={stats.upcomingEvents}
          icon={Clock}
          trend={5}
        />
      </div>

      {/* Add more dashboard sections here */}
    </div>
  );
};

export default Dashboard;
