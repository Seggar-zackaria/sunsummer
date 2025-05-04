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
} from "lucide-react";

import { NavMain } from "@/components/nav-main";
import { NavProjects } from "@/components/nav-projects";
import { NavUser } from "@/components/nav-user";
import { TeamSwitcher } from "@/components/team-switcher";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";


export const AppSidebar = () => {

 const dashboardURL = [
  {
    name: "Sun Summer",
    logo: SunIcon,
    url: "/dashboard/admin",
  }
]

const adminRole = [
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
        icon: Bed ,
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
        url: "#",
        icon: Calendar,
        items: [

          {
            title: "View Booking",
            url: "/dashboard/admin/booking",
          },
            {
              title: "Add Booking",
                url: "/dashboard/admin/booking/add",
            },
        ],
      },
    ]
  const userRole = [
  {
    name: "Book a Voyage",
    url: "/dashboard/voyage-booking",
    icon: Map,
  },
  {
    name: "Book a Hotel",
    url: "/dashboard/Hotel-Booking",
    icon: Frame,
  },
  {
    name: "Book a Flight",
    url: "/dashboard/flight-booking",
    icon: PieChart,
  },
  {
    name: "My Bookings",
    url: "/dashboard/booked-travel",
    icon: Calendar,
  },
]

  return (
    <Sidebar>
      <SidebarHeader>

        <TeamSwitcher teams={dashboardURL} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={adminRole} />
        <NavProjects projects={userRole} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
};
