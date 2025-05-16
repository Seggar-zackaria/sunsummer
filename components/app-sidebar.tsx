"use client";

import * as React from "react";
import {
  SunIcon,
  Frame,
  Map,
  PieChart,
  Plane,
  Hotel,
  Calendar,
  Bed,
  User,
  Settings,
} from "lucide-react";

import { NavMain } from "@/components/nav-main";
import { NavUser } from "@/components/nav-user";
import { TeamSwitcher } from "@/components/team-switcher";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";
import { useSession } from "next-auth/react";

export const AppSidebar = () => {
  const { data: session } = useSession();
  const isAdmin = session?.user?.role === "ADMIN";

  const dashboardURL = [
    {
      name: "Sun Summer",
      logo: SunIcon,
      url: isAdmin ? "/dashboard/admin" : "/dashboard",
    }
  ];

  const adminNavItems = [
    {
      title: "Hotel",
      url: "#",
      icon: Hotel,
      isActive: true,
      items: [
        {
          title: "Add Hotel",
          url: "/dashboard/admin/hotel/add",
        },     
        {
          title: "View Hotel",
          url: "/dashboard/admin/hotel",
        }
      ],
    },
    {
      title: "Room",
      url: "#",
      icon: Bed,
      isActive: true,
      items: [
        {
          title: "Add Room",
          url: "/dashboard/admin/rooms/add",
        },     
        {
          title: "View Room",
          url: "/dashboard/admin/rooms",
        }
      ],
    },
    {
      title: "Flight",
      url: "#",
      icon: Plane,
      items: [
        {
          title: "Add Flight",
          url: "/dashboard/admin/flight/add",
        },
        {
          title: "View Flight",
          url: "/dashboard/admin/flight",
        },
      ],
    },
    {
      title: "Booking",
      url: "/dashboard/admin/bookings",
      icon: Calendar,
      items: [
        {
          title: "View Booking",
          url: "/dashboard/admin/bookings",
        }
      ],
    }
  ];

  const userNavItems = [
    {
      title: "My Profile",
      url: "/dashboard/profile",
      icon: User,
      items: [
        {
          title: "Edit Profile",
          url: "/dashboard/profile",
        },
      ],
    },
    {
      title: "My Bookings",
      url: "/dashboard/bookings",
      icon: Calendar,
      items: [
        {
          title: "View Bookings",
          url: "/dashboard/bookings",
        },
      ],
    },
    {
      title: "Book Services",
      url: "#",
      icon: Hotel,
      items: [
        {
          title: "Hotels",
          url: "/hotels",
        },
        {
          title: "Flights",
          url: "/flights",
        },
      ],
    },
  ];

  return (
    <Sidebar>
      <SidebarHeader>
        <TeamSwitcher teams={dashboardURL} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={isAdmin ? adminNavItems : userNavItems} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
};
