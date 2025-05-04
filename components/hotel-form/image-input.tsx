import {ImageInputProps, CreateHotelForm} from "@/lib/definitions"
import {Input} from "@/components/ui/input"
import Image from "next/image"
import {
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
    FormControl,
    FormDescription
} from "@/components/ui/form"
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ChangeEvent, useEffect } from "react"
import { useState } from "react"

export const ImageInput = ({ form, existingImages = [] }: ImageInputProps<CreateHotelForm>) => {
    const [previewUrls, setPreviewUrls] = useState<string[]>(existingImages)
    const [newImages, setNewImages] = useState<File[]>([])

    const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const files = Array.from(e.target.files)
            
            // Create temporary URLs for preview
            const urls = files.map(file => URL.createObjectURL(file))
            setPreviewUrls(prev => [...prev, ...urls])
            
            // Store the new files
            setNewImages(prev => [...prev, ...files])
            
            // Update form value with all images
            form.setValue("images", [...newImages, ...files], {
                shouldValidate: true,
                shouldDirty: true,
                shouldTouch: true
            })
        }
    }

    const removeImage = (index: number) => {
        // Remove from preview URLs
        setPreviewUrls(prev => prev.filter((_, i) => i !== index))

        // If it's a new image, remove from newImages array
        if (index >= existingImages.length) {
            const newImageIndex = index - existingImages.length
            setNewImages(prev => prev.filter((_, i) => i !== newImageIndex))
            form.setValue("images", newImages.filter((_, i) => i !== newImageIndex))
        } else {
            // If it's an existing image, update the form to indicate removal
            const remainingExistingImages = existingImages.filter((_, i) => i !== index)
            form.setValue("images", remainingExistingImages)
        }
    }

    // Cleanup preview URLs when component unmounts
    useEffect(() => {
        return () => {
            previewUrls.forEach(url => {
                if (!existingImages.includes(url)) {
                    URL.revokeObjectURL(url)
                }
            })
        }
    }, [previewUrls, existingImages])

    return (
        <FormField
            control={form.control}
            name="images"
            render={() => (
                <FormItem>
                    <FormLabel>Hotel Images</FormLabel>
                    <FormControl>
                        <Input
                            type="file"
                            accept="image/*"
                            multiple
                            onChange={handleImageChange}
                            className="cursor-pointer"
                        />
                    </FormControl>
                    <FormDescription>
                        Upload multiple images of your hotel
                    </FormDescription>
                    <FormMessage />
                    
                    {/* Image Preview Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-4">
                        {previewUrls.map((url, index) => (
                            <div key={url} className="relative group aspect-square">
                                <Image
                                    src={url}
                                    alt={`Preview ${index + 1}`}
                                    fill
                                    className="object-cover rounded-lg"
                                />
                                <Button
                                    type="button"
                                    variant="destructive"
                                    size="icon"
                                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                                    onClick={() => removeImage(index)}
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>
                        ))}
                    </div>
                </FormItem>
            )}
        />
    )
}