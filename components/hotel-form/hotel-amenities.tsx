import { useState, useCallback } from "react";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import {HotelFormComponentProps} from "@/lib/definitions"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const PRESET_AMENITIES = [
  "WiFi",
  "Gym",
  "Pool",
  "Spa",
  "Restaurant",
  "Bar",
  "Room Service",
  "Parking",
  "Air Conditioning",
  "Conference Room",
  "Business Center",
  "Laundry Service",
  "Airport Shuttle",
  "Fitness Center",
  "Beach Access",
] as const;



export function HotelAmenities({ form }: HotelFormComponentProps) {
  const [amenityInput, setAmenityInput] = useState("");
  
  // Watch the amenities array so the component updates reactively.
  const amenities = form.watch("amenities") as string[];

  const handleAmenityClick = useCallback(
    (amenity: string) => {
      if (!amenities.includes(amenity)) {
        form.setValue("amenities", [...amenities, amenity]);
      }
    },
    [amenities, form]
  );

  const handleRemoveAmenity = useCallback(
    (amenityToRemove: string) => {
      form.setValue(
        "amenities",
        amenities.filter((amenity) => amenity !== amenityToRemove)
      );
    },
    [amenities, form]
  );

  const handleAddAmenity = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const trimmedInput = amenityInput.trim();
      if (trimmedInput && !amenities.includes(trimmedInput)) {
        form.setValue("amenities", [...amenities, trimmedInput]);
        setAmenityInput("");
      }
    }
  };

  const handleClearAmenities = useCallback(() => {
    form.setValue("amenities", []);
  }, [form]);

  return (
    <Form {...form}>
      <div className="space-y-6">
        <h2 className="text-xl font-semibold text-gray-900">Hotel Amenities</h2>
        <FormField
          control={form.control}
          name="amenities"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Available Amenities</FormLabel>
              <FormControl>
                <div className="space-y-4">
                  <div className="flex flex-wrap gap-2 p-4 bg-gray-50 rounded-md">
                    {PRESET_AMENITIES.map((amenity) => (
                      <Badge
                        key={amenity}
                        variant="outline"
                        className={`cursor-pointer hover:bg-primary hover:text-primary-foreground ${
                          field.value.includes(amenity)
                            ? "bg-primary text-primary-foreground"
                            : ""
                        }`}
                        onClick={() => handleAmenityClick(amenity)}
                        aria-label={`Select ${amenity}`}
                      >
                        {amenity}
                      </Badge>
                    ))}
                  </div>

                  <div className="space-y-2">
                    <Input
                      placeholder="Add custom amenity and press Enter..."
                      value={amenityInput}
                      onChange={(e) => setAmenityInput(e.target.value)}
                      onKeyDown={handleAddAmenity}
                      aria-label="Add custom amenity"
                    />

                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-500">
                          Selected Amenities ({field.value.length})
                        </span>
                        {field.value.length > 0 && (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={handleClearAmenities}
                            className="text-red-500 hover:text-red-600"
                          >
                            Clear All
                          </Button>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-2 p-2 border rounded-md min-h-[50px]">
                        {field.value.map((amenity: string) => (
                          <Badge
                            key={amenity}
                            variant="secondary"
                            className="flex items-center gap-1"
                          >
                            {amenity}
                            <X
                              className="h-3 w-3 cursor-pointer"
                              onClick={() => handleRemoveAmenity(amenity)}
                              aria-label={`Remove ${amenity}`}
                            />
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </Form>
  );
}
