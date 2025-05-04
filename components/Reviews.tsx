"use client";

import { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";

const reviews = [
  {
    id: 1,
    title: "A real sense of community, nurtured",
    content: "Really appreciate the help and support from the staff during these tough times. Shoutout to Katie for helping sort out our delayed flight!",
    author: "Olga",
    rating: 5,
    platform: "Google"
  },
  {
    id: 2,
    title: "The facilities are superb. Clean, slick, bright.",
    content: "Really appreciate the help and support from the staff during these tough times. Shoutout to Katie for helping sort out our booking issues!",
    author: "Oliver",
    rating: 5,
    platform: "Trustpilot"
  },
  {
    id: 3,
    title: "A real sense of community, nurtured",
    content: "Really appreciate the help and support from the staff during these tough times. Shoutout to Adam for helping sort out our ticket problems!",
    author: "Olga",
    rating: 5,
    platform: "Google"
  }
];

const Reviews = () => {
  const [activeReview, setActiveReview] = useState(0);

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-baseline mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-800 mb-2">Reviews</h2>
            <p className="text-gray-600">What people say about Golobe facilities</p>
          </div>
          
          <Button 
            variant="link" 
            className="text-gray-800"
            aria-label="See all reviews"
          >
            See All
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {reviews.map((review, index) => (
            <div 
              key={review.id}
              className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden"
            >
              <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-800 mb-3">
                  {review.title}
                </h3>
                
                <p className="text-gray-600 mb-4 text-sm">
                  {review.content}
                </p>
                
                <div className="flex justify-between items-center">
                  <div>
                    <div className="flex items-center gap-0.5 mb-1">
                      {[...Array(5)].map((_, i) => (
                        <svg key={i} className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                    <p className="text-sm font-medium text-gray-800">{review.author}</p>
                  </div>
                  
                  <div className="flex items-center">
                    <div className="w-4 h-4 bg-gray-200 rounded-full mr-1 flex items-center justify-center">
                      <span className="text-xs text-gray-600">
                        {review.platform === "Google" ? "G" : "T"}
                      </span>
                    </div>
                    <span className="text-xs text-gray-500">{review.platform}</span>
                  </div>
                </div>
              </div>
              
              <div className="relative h-48 w-full">
                <Image
                  src="/assets/mountains.jpg"
                  alt="Review scene"
                  className="object-cover"
                  fill
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Reviews; 