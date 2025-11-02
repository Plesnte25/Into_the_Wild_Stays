import { createBrowserRouter } from "react-router-dom";
import App from "../App";
import Home from "../pages/Home";
import Properties from "../pages/Properties";
import Tours from "../pages/Tours";
import ContactUs from "../pages/ContactUs";
import AboutUs from "./../pages/AboutUs";
import Blog from "../pages/Blog";
import Login from "./../components/Login";
import Register from "./../components/Register";
import PropertyDetail from "../pages/PropertyDetail";
import { BlogPost } from "./../components/BlogPost";
import UserProfile from "./../components/UserProfile";
import Events from "../pages/Events";
import EventDetail from "../pages/EventDetail";
import ToursDetail from "../pages/ToursDetail";
import NotFound from "../pages/NotFound";
import Checkout from "../components/Checkout";
import BookingConfirmed from "../pages/BookingConfirmed";
import Review from "../pages/Review";

const blogs = [];

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        path: "/",
        element: <Home />,
      },
      {
        path: "/properties",
        element: <Properties />,
      },
      {
        path: "/properties/:id",
        element: <PropertyDetail />,
      },
      {
        path: "/tours",
        element: <Tours />,
      },
      {
        path: "/tours/:id",
        element: <ToursDetail />,
      },
      {
        path: "/contact-us",
        element: <ContactUs />,
      },
      {
        path: "/property/:id",
        element: <PropertyDetail />,
      },
      {
        path: "/checkout",
        element: <Checkout />,
      },
      {
        path: "/booking-confirmation",
        element: <BookingConfirmed />,
      },
      {
        path: "/about-us",
        element: <AboutUs />,
      },
      {
        path: "/blog",
        element: <Blog />,
      },
      {
        path: "/login",
        element: <Login />,
      },
      {
        path: "/register",
        element: <Register />,
      },
      {
        path: "/user-profile",
        element: <UserProfile />,
      },
      {
        path: "/blog/:id",
        element: <BlogPost blogs={blogs} />,
      },
      {
        path: "/events",
        element: <Events />,
      },
      {
        path: "/events/:id",
        element: <EventDetail />,
      },
      {
        path: "*",
        element: <NotFound />,
      },
      {
        path: "review",
        element: <Review />,
      },
    ],
  },
]);

export default router;
