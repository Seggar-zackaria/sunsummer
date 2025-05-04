import { Card } from "@/components/ui/card";

interface StatsCardProps {
    title: string
    value: number
    icon: React.ReactNode
}


function StatsCard({ title, value, icon }: StatsCardProps) {
return (
    <Card className="p-6">
        <div className="flex items-center flex-shrink justify-between">
            <h6 className="font-semibold text-sm">{title}</h6>
            <span className="text-muted-foreground">{icon}</span>
        </div>
        <div className="font-extrabold text-4xl mt-4">
            <p>{value}</p>
        </div>
    </Card>
)
}


export {StatsCard};
