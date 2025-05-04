"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useState } from "react";
import { RoomSchema } from "@/schemas";
import { editRoom } from "@/actions/room";
import { Button } from "@/components/ui/button";
import { FormError } from "@/components/form-error";
import { FormSuccess } from "@/components/form-succes";
import {
  Form,
  FormControl,
  FormField,
  FormLabel,
  FormMessage,
  FormItem,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ImageInput } from "@/components/hotel-form/image-input";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Hotel } from "@/lib/definitions";
import * as z from "zod";

interface EditRoomFormProps {
  hotels: {
    id: string;
    name: string;
  }[];
  initialData: {
    id: string;
    hotelId: string;
    type: string;
    description: string;
    capacity: number;
    price: number;
    available: boolean;
    amenities: string[];
    images: string[];
  };
}

export default function EditRoomForm({ hotels, initialData }: EditRoomFormProps) {
  const [error, setError] = useState<string | undefined>();
  const [success, setSuccess] = useState<string | undefined>();
  const [loading, setLoading] = useState(false);

  const form = useForm<z.infer<typeof RoomSchema>>({
    resolver: zodResolver(RoomSchema),
    defaultValues: {
      hotelId: initialData.hotelId,
      type: initialData.type,
      description: initialData.description,
      capacity: initialData.capacity,
      price: initialData.price,
      available: initialData.available,
      amenities: initialData.amenities,
      images: [],
    },
  });

  const onSubmit = async (values: z.infer<typeof RoomSchema>) => {
    setLoading(true);
    setError(undefined);
    setSuccess(undefined);

    try {
      const response = await editRoom(initialData.id, values);
      
      if (response.error) {
        setError(response.error);
      } else {
        setSuccess(response.message);
      }
    } catch (error) {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const roomTypes = [
    "Single",
    "Double",
    "Twin",
    "Suite",
    "Deluxe",
    "Family",
    "Presidential",
  ];

  const roomAmenities = [
    "Air Conditioning",
    "TV",
    "Mini Bar",
    "Free WiFi",
    "Safe",
    "Balcony",
    "Sea View",
    "City View",
    "Room Service",
    "Coffee Maker",
  ];

  return (
    <div className="max-w-3xl mx-auto p-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="hotelId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Select Hotel</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a hotel" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {hotels.map((hotel) => (
                      <SelectItem key={hotel.id} value={hotel.id || ""}>
                        {hotel.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Room Type</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select room type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {roomTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea
                    {...field}
                    placeholder="Enter room description"
                    className="min-h-[100px]"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <FormField
              control={form.control}
              name="capacity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Capacity</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                      min={1}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Price per Night</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                      min={0}
                      step={0.01}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="available"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">Availability</FormLabel>
                  <div className="text-sm text-muted-foreground">
                    Set if this room is currently available
                  </div>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="amenities"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Amenities</FormLabel>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {roomAmenities.map((amenity) => (
                    <div key={amenity} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id={amenity}
                        value={amenity}
                        checked={field.value.includes(amenity)}
                        onChange={(e) => {
                          const value = e.target.value;
                          const newValue = e.target.checked
                            ? [...field.value, value]
                            : field.value.filter((item) => item !== value);
                          field.onChange(newValue);
                        }}
                        className="h-4 w-4 rounded border-gray-300"
                      />
                      <label htmlFor={amenity} className="text-sm">
                        {amenity}
                      </label>
                    </div>
                  ))}
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-medium">Current Images</h3>
              <div className="grid grid-cols-3 gap-4 mt-2">
                {initialData.images.map((image, index) => (
                  <div key={index} className="relative aspect-square">
                    <img
                      src={image}
                      alt={`Room ${index + 1}`}
                      className="object-cover rounded-lg"
                    />
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h3 className="text-lg font-medium">Upload New Images</h3>
              <p className="text-sm text-muted-foreground mb-2">
                Upload new images to replace the existing ones
              </p>
              <ImageInput form={form} />
            </div>
          </div>

          <FormError message={error} />
          <FormSuccess message={success} />

          <Button
            type="submit"
            className="w-full"
            disabled={loading}
          >
            {loading ? "Saving..." : "Save Changes"}
          </Button>
        </form>
      </Form>
    </div>
  );
} 