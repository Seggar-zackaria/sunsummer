"use client";

import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface TravelCategoryProps {
  title: string;
  type: "flights" | "hotels";
  imageUrl: string;
  description: string;
  linkHref: string;
}

const TravelCategory = ({
  title,
  type,
  imageUrl,
  description,
  linkHref,
}: TravelCategoryProps) => {
  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <div className="relative overflow-hidden rounded-xl">
          <div className="grid md:grid-cols-2 gap-8">
            <div className="p-8 md:p-12 bg-white z-10 flex flex-col justify-center">
              <h2 className="text-4xl font-bold text-gray-800 mb-4">{title}</h2>
              <p className="text-gray-600 mb-8 max-w-md">
                {description}
              </p>
              <div>
                <Button 
                  className="mr-4 bg-green-500 hover:bg-green-600 text-white"
                  asChild
                >
                  <Link 
                    href={linkHref}
                    aria-label={`Find and book ${type}`}
                  >
                    Find {type}
                  </Link>
                </Button>
                
                <Button 
                  variant="outline" 
                  className="border-gray-300 text-gray-800"
                  asChild
                >
                  <Link 
                    href={`/${type}/deals`}
                    aria-label={`View ${type} deals`}
                  >
                    View deals
                  </Link>
                </Button>
              </div>
            </div>
            
            <div className="relative h-64 md:h-auto">
              <Image
                src={imageUrl}
                alt={title}
                className="object-cover rounded-b-xl md:rounded-r-xl md:rounded-bl-none"
                fill
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TravelCategory; 