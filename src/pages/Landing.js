import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import Features from "../components/Features";
import Testimonials from "../components/Testimonials";
import ContactUs from "../components/ContactUs";
import Footer from "../components/Footer";

const Landing = () => {
  return (
    <div>
      <Navbar />
      <Hero />
      <Features />
      {/* <Testimonials />
      <ContactUs /> */}
      <Footer />
    </div>
  );
};

export default Landing;

