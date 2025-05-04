"use client"

import { TrendingUp, TrendingDown } from "lucide-react"
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"

interface ChartProps {
  data: {
    month: string;
    users: number;
  }[];
}

const chartConfig = {
  users: {
    label: "Users",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig

export function Chart({ data }: ChartProps) {
  const calculateTrend = () => {
    if (data.length < 2) return 0;
    const currentMonth = data[data.length - 1].users;
    const previousMonth = data[data.length - 2].users;
    return ((currentMonth - previousMonth) / previousMonth) * 100;
  };

  const trend = calculateTrend();
  const isTrendingUp = trend >= 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle>User Growth</CardTitle>
        <CardDescription>
          Monthly user registration trends
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer className="lg:min-h-[200px]" config={chartConfig}>
          <AreaChart
            accessibilityLayer
            data={data}
            margin={{
              left: 12,
              right: 12,
              top: 20,
              bottom: 20,
            }}
          >
            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => value.slice(0, 3)}
            />
            <YAxis 
              tickLine={false}
              axisLine={false}
              tickMargin={8}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="line" />}
            />
            <Area
              dataKey="users"
              type="monotone"
              fill="var(--color-users)"
              fillOpacity={0.4}
              stroke="var(--color-users)"
              strokeWidth={2}
              dot={{ strokeWidth: 2, r: 4, fill: "white" }}
              activeDot={{ r: 6, strokeWidth: 2 }}
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
      <CardFooter>
        <div className="flex w-full items-start gap-2 text-sm">
          <div className="grid gap-2">
            <div className="flex items-center gap-2 font-medium leading-none">
              {isTrendingUp ? (
                <>
                  Trending up by {Math.abs(trend).toFixed(1)}% this month
                  <TrendingUp className="h-4 w-4 text-green-500" />
                </>
              ) : (
                <>
                  Trending down by {Math.abs(trend).toFixed(1)}% this month
                  <TrendingDown className="h-4 w-4 text-red-500" />
                </>
              )}
            </div>
            <div className="flex items-center gap-2 leading-none text-muted-foreground">
              {data[0]?.month} - {data[data.length - 1]?.month} {new Date().getFullYear()}
            </div>
          </div>
        </div>
      </CardFooter>
    </Card>
  )
}
