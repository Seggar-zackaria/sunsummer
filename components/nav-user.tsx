"use client";

import {
  BadgeCheck,
  Bell,
  ChevronsUpDown,
  Sparkles,
  User,
  Save,
  Camera
} from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { SignOutButton } from "./auth/sign-out";
import { useUser } from "@/hooks/use-user";
import { useEffect, useState, useCallback, useRef } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { updateUserProfile } from "@/actions/user-profile";
import { toast } from "sonner";
import { Label } from "./ui/label";

// Form Schema
const profileFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string()
    .length(10, "Phone number must be exactly 10 digits")
    .regex(/^\d+$/, "Phone number must contain only digits"),
  address: z.string().min(5, "Address must be at least 5 characters"),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

export function NavUser() {
  const { isMobile } = useSidebar();
  const user = useUser();
  const session = useSession();
  const [nameFallback, setNameFallback] = useState<string>("");
  const [imageError, setImageError] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Initialize form with empty values
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      address: "",
    }
  });

  // Update form values when user data changes
  useEffect(() => {
    if (user?.name || user?.email) {
      const userProfile = async () => {
        try {
          const response = await fetch('/api/user/profile');
          if (response.ok) {
            const data = await response.json();
            form.reset({
              name: user.name || "",
              email: user.email || "",
              phone: data.phone || "",
              address: data.address || "",
            });
          }
        } catch (error) {
          console.error("Failed to fetch user profile:", error);
        }
      };
      userProfile();
    }
  }, [user?.name, user?.email, form]);

  // Update the fallback name whenever user data changes
  useEffect(() => {
    if (user?.name) {
      setNameFallback(user.name.charAt(0).toUpperCase());
    }
  }, [user?.name]);

  // Reset image error state when image URL changes
  useEffect(() => {
    setImageError(false);
  }, [user?.image]);

  // Process the image URL to ensure it's valid
  const processImageUrl = useCallback((imageUrl: string | null | undefined): string => {
    if (!imageUrl) return "";
    
    if (imageUrl.startsWith('http')) {
      return imageUrl;
    }
    
    if (!imageUrl.startsWith('/')) {
      return `/${imageUrl}`;
    }
    
    return imageUrl;
  }, []);

  const imageUrl = processImageUrl(user?.image);

  const handleImageUpload = async (file: File) => {
    try {
      setIsUploadingImage(true);
      const formData = new FormData();
      formData.append("avatar", file);

      const response = await fetch("/api/user/avatar", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to upload image");
      }

      const data = await response.json();
      user.updateAvatar(data.imageUrl);
      toast.success("Profile picture updated successfully");
    } catch (error) {
      console.error("Image upload error:", error);
      toast.error("Failed to update profile picture");
    } finally {
      setIsUploadingImage(false);
    }
  };

  const onSubmit = async (data: ProfileFormValues) => {
    try {
      setIsSubmitting(true);
      const result = await updateUserProfile(data.phone, data.address);
      
      if (result.success) {
        toast.success("Profile updated successfully");
        setDialogOpen(false);
      } else {
        toast.error(result.message || "Failed to update profile");
      }
    } catch (error) {
      toast.error("An error occurred while updating your profile");
      console.error("Profile update error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <Avatar className="h-8 w-8 rounded-lg">
                {!imageError && imageUrl ? (
                  <AvatarImage 
                    src={imageUrl} 
                    alt={user?.name || ""}
                    onError={() => setImageError(true)}
                  />
                ) : (
                  <AvatarFallback className="rounded-lg">{nameFallback}</AvatarFallback>
                )}
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">{user?.name}</span>
                <span className="truncate text-xs">{user?.email}</span>
              </div>
              <ChevronsUpDown className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <Avatar className="h-8 w-8 rounded-lg">
                  {!imageError && imageUrl ? (
                    <AvatarImage 
                      src={imageUrl} 
                      alt={user?.name || ""}
                      onError={() => setImageError(true)}
                    />
                  ) : (
                    <AvatarFallback className="rounded-lg">{nameFallback}</AvatarFallback>
                  )}
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">{user?.name}</span>
                  <span className="truncate text-xs">{user?.email}</span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem asChild>
                <Link href="/dashboard/bookings">
                  <Sparkles className="mr-2 h-4 w-4" />
                  My Bookings
                </Link>
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DropdownMenuItem onSelect={(e) => {
                  e.preventDefault();
                  setDialogOpen(true);
                }}>
                  <User className="mr-2 h-4 w-4" />
                  Profile
                </DropdownMenuItem>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Edit Profile</DialogTitle>
                    <DialogDescription>
                      Update your profile information here.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="flex justify-center mb-6">
                    <div className="relative">
                      <Avatar className="h-24 w-24 rounded-lg">
                        {!imageError && imageUrl ? (
                          <AvatarImage 
                            src={imageUrl} 
                            alt={user?.name || ""}
                            onError={() => setImageError(true)}
                          />
                        ) : (
                          <AvatarFallback className="rounded-lg text-2xl">{nameFallback}</AvatarFallback>
                        )}
                      </Avatar>
                      <input
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            handleImageUpload(file);
                          }
                        }}
                      />
                      <Button
                        size="icon"
                        variant="outline"
                        className="absolute bottom-0 right-0 rounded-full"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploadingImage}
                      >
                        <Camera className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Name</FormLabel>
                            <FormControl>
                              <Input {...field} disabled placeholder="Your name" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <Input {...field} disabled type="email" placeholder="Your email" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <div className="col-span-12 sm:col-span-6 space-y-2">
                        <Label htmlFor="phone" className="text-sm">Mobile Number <span className="text-red-500">*</span></Label>
                        <FormField
                          control={form.control}
                          name="phone"
                          render={({ field }) => (
                            <FormItem className="w-full">
                              <FormControl>
                                <Input 
                                  id="phone"
                                  type="tel"
                                  inputMode="numeric"
                                  placeholder="Please enter a valid number"
                                  className="w-full"
                                  maxLength={10}
                                  {...field}
                                  onChange={(e) => {
                                    const numericValue = e.target.value.replace(/\D/g, '').slice(0, 10);
                                    field.onChange(numericValue);
                                  }}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <FormField
                        control={form.control}
                        name="address"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Address</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="Your address" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <div className="flex justify-end">
                        <Button type="submit" disabled={isSubmitting}>
                          <Save className="mr-2 h-4 w-4" />
                          {isSubmitting ? "Saving..." : "Save Changes"}
                        </Button>
                      </div>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <Bell className="mr-2 h-4 w-4" />
                Notifications
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <SignOutButton />
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}