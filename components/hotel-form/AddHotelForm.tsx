"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useState } from "react";
import { HotelSchema } from "@/schemas";
import { addHotel } from "@/actions/hotel";
import { Button } from "@/components/ui/button";
import { HotelBasicInfo } from "@/components/hotel-form/hotel-basic-info";
import { HotelLocationDetails } from "@/components/hotel-form/hotel-location-details";
import { HotelAmenities } from "@/components/hotel-form/hotel-amenities";
import { FormError } from "@/components/form-error";
import { FormSuccess } from "@/components/form-succes";
import { Form } from "@/components/ui/form";
import { ImageInput } from "@/components/hotel-form/image-input";
import { CreateHotelForm } from "@/lib/definitions";

export default function AddHotelForm() {
  const [error, setError] = useState<string | undefined>(undefined);
  const [success, setSuccess] = useState<string | undefined>(undefined);
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState<File[]>([]);

  const form = useForm<CreateHotelForm>({
    resolver: zodResolver(HotelSchema),
    defaultValues: {
      name: "",
      description: "",
      address: "",
      city: "",
      country: "",
      rating: 1,
      state: "",
      price: 0,
      images: [],
      amenities: [],
    },
  });

  const onSubmit = async (values: CreateHotelForm) => {
    setError("");
    setSuccess("");
    setLoading(true);
    
    try {
      const response = await addHotel({
        ...values,
        images: values.images || []
      });
      
      if (response.status === 201) {
        setSuccess(response.message);
        form.reset({images: []})
        // Reset images state
        images.length = 0;
        setImages([]);
      } else {
        setError(response.error || "Failed to create hotel");
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
          <HotelLocationDetails form={form} />
          <HotelAmenities form={form} />
          <ImageInput form={form} />
          <FormError message={error} />
          <FormSuccess message={success} /> 

          <Button type="submit" disabled={loading} className="w-full">
           {loading ? "Adding..." : "Add Hotel"}
          </Button>
        </form>
      </Form>
    </div>
  </div>
);
}