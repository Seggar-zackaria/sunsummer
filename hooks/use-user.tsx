"use client"
import { useSession } from "next-auth/react"


export const useUser = () => {
    const session = useSession()
    const userSession = session.data?.user

    return userSession;
}


