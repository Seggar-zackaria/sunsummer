'use client';

import { useState, useEffect } from "react";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSession } from "next-auth/react";
import { getUserProfile } from "@/actions/user-profile";
import { toast } from "sonner";

interface ContactDetailsFormProps {
  onFormChange?: (formData: ContactFormData, isValid: boolean) => void;
}

export interface ContactFormData {
  title: string;
  firstName: string;
  surname: string;
  email: string;
  countryCode: string;
  mobileNumber: string;
  address: string;
  postcode: string;
  townCity: string;
  country: string;
}

// Create a Zod schema for form validation
const formSchema = z.object({
  title: z.string().min(1, "Title is required"),
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  surname: z.string().min(2, "Surname must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  countryCode: z.string(),
  mobileNumber: z.string()
    .min(9, "Mobile number must be at least 9 digits")
    .max(15, "Mobile number must not exceed 15 digits")
    .regex(/^\d+$/, "Mobile number must contain only digits"),
  address: z.string().min(5, "Address must be at least 5 characters"),
  postcode: z.string().min(3, "Postcode is required").regex(/^\d+$/, "Postcode must contain only digits"),
  townCity: z.string().min(2, "Town/City is required"),
  country: z.string().min(2, "Country is required")
});

export default function ContactDetailsForm({ onFormChange }: ContactDetailsFormProps) {
  const { data: session } = useSession();
  const [isLoading, setIsLoading] = useState(true);
  
  // Initialize react-hook-form with zod validation
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      firstName: '',
      surname: '',
      email: '',
      countryCode: '+213',
      mobileNumber: '',
      address: '',
      postcode: '',
      townCity: '',
      country: 'Algeria'
    }
  });

  // Fetch user profile data
  useEffect(() => {
    const fetchUserProfile = async () => {
      setIsLoading(true);
      try {
        // First try to get basic info from session
        if (session?.user) {
          const userData = session.user;
          
          // If we have a name, try to split it into first and last name
          if (userData.name) {
            const nameParts = userData.name.split(' ');
            if (nameParts.length >= 2) {
              form.setValue('firstName', nameParts[0]);
              form.setValue('surname', nameParts.slice(1).join(' '));
            } else {
              form.setValue('firstName', userData.name);
            }
          }
          
          // Set email from session
          if (userData.email) {
            form.setValue('email', userData.email);
          }
        }
        
        // Then try to get extended profile data
        const profileResult = await getUserProfile();
        
        if (profileResult.success && profileResult.user) {
          const user = profileResult.user;
          
          // If we have a phone number, extract it
          if (user.phone) {
            // Assume phone is stored with country code
            const phoneStr = user.phone.toString();
            if (phoneStr.startsWith('+')) {
              // For phone numbers with explicit country code
              form.setValue('mobileNumber', phoneStr.substring(4)); // Remove +213
            } else {
              form.setValue('mobileNumber', phoneStr);
            }
          }
          
          // Set address-related fields
          if (user.address) {
            form.setValue('address', user.address);
            
            // Try to parse address for postcode and town if it contains commas
            const addressParts = user.address.split(',');
            if (addressParts.length >= 3) {
              // Assume format: street, town, postcode, country
              form.setValue('townCity', addressParts[1].trim());
              form.setValue('postcode', addressParts[2].trim());
            }
          }
        }
      } catch (error) {
        console.error("Error fetching user profile:", error);
        toast.error("Could not load your profile information");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchUserProfile();
  }, [session, form]);

  // Watch all form values to notify parent component
  const watchedValues = form.watch();
  
  useEffect(() => {
    if (onFormChange && !isLoading) {
      const isValid = form.formState.isValid;
      onFormChange(watchedValues as ContactFormData, isValid);
    }
  }, [watchedValues, form.formState.isValid, onFormChange, isLoading]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="border-l-4 border-teal-500 pl-4 py-1">
          <h2 className="text-lg font-medium">Contact details</h2>
        </div>
        <div className="flex justify-center p-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6" data-contact-form>
      <div className="border-l-4 border-teal-500 pl-4 py-1">
        <h2 className="text-lg font-medium">Contact details</h2>
      </div>

      <Form {...form}>
        <form className="grid grid-cols-12 gap-4">
          {/* Title, First name, Surname row */}
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem className="col-span-12 sm:col-span-2">
                <FormLabel className="text-sm">Title <span className="text-red-500">*</span></FormLabel>
                <Select 
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select title" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="Mr">Mr</SelectItem>
                    <SelectItem value="Mrs">Mrs</SelectItem>
                    <SelectItem value="Miss">Miss</SelectItem>
                    <SelectItem value="Ms">Ms</SelectItem>
                    <SelectItem value="Dr">Dr</SelectItem>
                    <SelectItem value="Prof">Prof</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="firstName"
            render={({ field }) => (
              <FormItem className="col-span-12 sm:col-span-5">
                <FormLabel className="text-sm">First name <span className="text-red-500">*</span></FormLabel>
                <FormControl>
                  <Input 
                    placeholder="Enter first name"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="surname"
            render={({ field }) => (
              <FormItem className="col-span-12 sm:col-span-5">
                <FormLabel className="text-sm">last name <span className="text-red-500">*</span></FormLabel>
                <FormControl>
                  <Input 
                    placeholder="Enter surname"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Email and Mobile Number row */}
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem className="col-span-12 sm:col-span-6">
                <FormLabel className="text-sm">Email <span className="text-red-500">*</span></FormLabel>
                <FormControl>
                  <Input 
                    type="email"
                    placeholder="Enter email"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="col-span-12 sm:col-span-6 space-y-2">
            <Label htmlFor="mobileNumber" className="text-sm">Mobile Number <span className="text-red-500">*</span></Label>
            <div className="flex gap-2">
              <div className="flex items-center justify-center px-3 border rounded-l-md">
                <span className="text-sm font-medium">+213</span>
              </div>
              <FormField
                control={form.control}
                name="mobileNumber"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormControl>
                      <Input 
                        id="mobileNumber"
                        type="tel"
                        inputMode="numeric"
                        placeholder="Please enter a valid number"
                        className="w-full"
                        maxLength={9}
                        {...field}
                        onChange={(e) => {
                          const numericValue = e.target.value.replace(/\D/g, '').slice(0, 9);
                          field.onChange(numericValue);
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
          
          {/* Your address section */}
          <div className="col-span-12 mt-4">
            <div className="border-l-4 border-teal-500 pl-4 py-1">
              <h2 className="text-lg font-medium">Your address</h2>
            </div>
          </div>

          <FormField
            control={form.control}
            name="address"
            render={({ field }) => (
              <FormItem className="col-span-12">
                <FormLabel className="text-sm">Address <span className="text-red-500">*</span></FormLabel>
                <FormControl>
                  <Input 
                    placeholder="Enter address"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
                {!form.formState.errors.address && (
                  <p className="text-xs text-red-500 mt-1">This field is mandatory.</p>
                )}
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="postcode"
            render={({ field }) => (
              <FormItem className="col-span-12 sm:col-span-4">
                <FormLabel className="text-sm">Postcode <span className="text-red-500">*</span></FormLabel>
                <FormControl>
                  <Input 
                    placeholder="Enter postcode"
                    inputMode="numeric"
                    {...field}
                    onChange={(e) => {
                      const numericValue = e.target.value.replace(/\D/g, '');
                      field.onChange(numericValue);
                    }}
                  />
                </FormControl>
                <FormMessage />
                {!form.formState.errors.postcode && (
                  <p className="text-xs text-red-500 mt-1">This field is mandatory.</p>
                )}
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="townCity"
            render={({ field }) => (
              <FormItem className="col-span-12 sm:col-span-8">
                <FormLabel className="text-sm">Town/City <span className="text-red-500">*</span></FormLabel>
                <FormControl>
                  <Input 
                    placeholder="Enter town or city"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
                {!form.formState.errors.townCity && (
                  <p className="text-xs text-gray-500 mt-1">This field is mandatory.</p>
                )}
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="country"
            render={({ field }) => (
              <FormItem className="col-span-12">
                <FormLabel className="text-sm">Country <span className="text-red-500">*</span></FormLabel>
                <FormControl>
                  <Input 
                    placeholder="Country"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </form>
      </Form>
    </div>
  );
} 