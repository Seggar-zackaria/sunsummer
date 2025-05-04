import Hero from "@/components/Hero";
import SearchForm from "@/components/SearchForm";
import PopularDestinations from "@/components/PopularDestinations";
import TravelCategory from "@/components/TravelCategory";
import Reviews from "@/components/Reviews";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    
    <div className="min-h-screen">
      <Navbar />

      {/* Hero Section */}
      <Hero />
      
      {/* Search Form */}
      <SearchForm />
      
      {/* Popular Destinations */}
      <PopularDestinations />
      
      {/* Flights Category */}
      <TravelCategory
        title="Flights"
        type="flights"
        imageUrl="/assets/mountains.jpg"
        description="Search Flights & Places to our most popular destinations. Book your flights and explore the world with us."
        linkHref="/flights"
      />
      
      {/* Hotels Category */}
      <TravelCategory
        title="Hotels"
        type="hotels"
        imageUrl="/assets/mountains.jpg"
        description="Search hotels & Place to stay in our most popular destinations. Book your perfect accommodation with us."
        linkHref="/hotels"
      />
      
      {/* Reviews Section */}
      <Reviews />
      <Footer />

    </div>
  );
}

