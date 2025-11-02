import HomeHero from "../components/HomeHero";
import LocationSection from "../components/LocationSection";
import GuestExperience from "../components/GuestExperience";
import MostViewedProperties from "../components/MostViewedProperties";
import GalleryAndReviews from "../components/GalleryAndReviews";
import Testimonials from "../components/Testimonials";
import PropertiesBanner from "./../components/PropertiesBanner";
import InstagramGallery from "../components/InstagramGallery";
import BlogSection from "../components/BlogSection";
import ListYourProperties from "../components/ListYourProperties";
import { useGoogleOneTapLogin } from "@react-oauth/google";
import { googleSignup } from "../api";
import { toast } from "react-toastify";

const Home = () => {
  const token = localStorage.getItem("token");
  console.log("token", token);
  {
    !token &&
      useGoogleOneTapLogin({
        onSuccess: async (credentialResponse) => {
          const res = await googleSignup(credentialResponse);
          localStorage.setItem("token", res.data.token);
          localStorage.setItem("user", JSON.stringify(res.data.user));
          toast.success(res.data.message);
          window.location.reload();
        },
        onError: () => {
          toast.error("Login failed.");
        },
        prompt: "select_account",
      });
  }

  return (
    <>
      <HomeHero />
      <LocationSection />
      <MostViewedProperties />
      <GalleryAndReviews />
      <Testimonials />
      <BlogSection />
      <InstagramGallery />
      <GuestExperience />
      <ListYourProperties />
      <PropertiesBanner />
    </>
  );
};

export default Home;
