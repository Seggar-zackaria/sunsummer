"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useState, useEffect } from "react";
import { HotelUpdateSchema } from "@/schemas";
import { editHotel } from "@/actions/hotel";
import { Button } from "@/components/ui/button";
import { HotelBasicInfo } from "@/components/hotel-form/hotel-basic-info";
import { HotelLocationDetails } from "@/components/hotel-form/hotel-location-details";
import { HotelAmenities } from "@/components/hotel-form/hotel-amenities";
import { FormError } from "@/components/form-error";
import { FormSuccess } from "@/components/form-succes";
import { Form } from "@/components/ui/form";
import { ImageInput } from "@/components/hotel-form/image-input";
import { UpdateHotelForm } from "@/lib/definitions";

interface EditHotelFormProps {
  initialData: Partial<UpdateHotelForm>;
}

export default function EditForm({ initialData }: EditHotelFormProps) {
  const [error, setError] = useState<string | undefined>("");
  const [success, setSuccess] = useState<string | undefined>("");
  const [loading, setLoading] = useState(false);

  const form = useForm<UpdateHotelForm>({
    resolver: zodResolver(HotelUpdateSchema),
    defaultValues: {
      name: initialData.name || "",
      description: initialData.description || "",
      address: initialData.address || "",
      city: initialData.city || "",
      country: initialData.country || "",
      state: initialData.state || "",
      rating: initialData.rating || 0,
      price: initialData.price || 0,
      images: [], // Will be handled separately
      amenities: initialData.amenities || [],
    },
  });

  // Initialize location fields
  useEffect(() => {
    if (initialData.country) {
      form.setValue("country", initialData.country);
    }
    if (initialData.state) {
      form.setValue("state", initialData.state);
    }
    if (initialData.city) {
      form.setValue("city", initialData.city);
    }
  }, [form, initialData]);

  const onSubmit = async (values: UpdateHotelForm) => {
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      // Only include fields that have changed
      const changedFields = Object.entries(values).reduce((acc, [key, value]) => {
        if (JSON.stringify(initialData[key as keyof UpdateHotelForm]) !== JSON.stringify(value)) {
          acc[key as keyof typeof values] = value;
        }
        return acc;
      }, {} as Partial<typeof values>);

      // If no fields have changed, return early
      if (Object.keys(changedFields).length === 0) {
        setSuccess("No changes to update");
        setLoading(false);
        return;
      }

      const response = await editHotel(initialData.id!, changedFields);

      if (response.status === 200) {
        setSuccess(response.message);
      } else {
        setError(response.error || "Failed to update hotel");
      }
    } catch (error) {
      console.error("Submission error:", error);
      setError("Something went wrong!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <HotelBasicInfo form={form} />
            <HotelLocationDetails 
              form={form} 
              initialCountry={initialData.country}
              initialState={initialData.state ?? ""}
              initialCity={initialData.city}
            />
            <HotelAmenities form={form} />
            <ImageInput 
              form={form} 
              existingImages={initialData.images} 
              />

              
            <FormError message={error} />
            <FormSuccess message={success} />

            <Button
              type="submit"
              disabled={loading}
              className="w-full"
              onClick={() => {
                onSubmit(form.getValues());
              }}  
            >
             {loading ? "Updating Hotel...": "Update Hotel"}
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
}