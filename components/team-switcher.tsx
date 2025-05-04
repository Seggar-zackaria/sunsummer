"use client"

import * as React from "react"

import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import Link from 'next/link'

export function TeamSwitcher({
  teams,
}: {
  teams: {
    name: string
    logo: React.ElementType
  }[]
}) {
  const activeTeam = teams[0]

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <Link href='/dashboard/'>
          <SidebarMenuButton
            tooltip={activeTeam.name}
            size="lg"
            className="bg-sidebar-accent text-sidebar-accent-foreground"
            >
            <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
              <activeTeam.logo className="size-4" />
            </div>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-semibold">
                {activeTeam.name}
              </span>
            </div>
          </SidebarMenuButton>
        </Link>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
