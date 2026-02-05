import { useEffect } from "react";
import AOS from "aos";
import "aos/dist/aos.css";
import "bootstrap/dist/css/bootstrap.min.css";
import { FaStar, FaStarHalfAlt, FaRegStar } from "react-icons/fa";

const testimonials = [
  {
    name: "Ananya Sharma",
    role: "Freelancer",
    feedback: "Xpensify has completely changed the way I track my expenses! The real-time insights are super helpful.",
    image: "./pic4.jpg",
    rating: 4,
  },
  {
    name: "Rahul Verma",
    role: "Software Engineer",
    feedback: "I love how easy it is to plan my budget with Xpensify. The alerts keep me on track!",
    image: "./pic3.jpg",
    rating: 5,
  },
  {
    name: "Meera Kapoor",
    role: "Entrepreneur",
    feedback: "The UI is so intuitive, and I can track my expenses effortlessly. Highly recommend!",
    image: "./pic2.jpg",
    rating: 4.5,
  },
  {
    name: "Amit Khanna",
    role: "Marketing Manager",
    feedback: "The budget planning feature is exactly what I needed. The UI is fantastic and user-friendly.",
    image: "./pic5.jpg",
    rating: 4,
  },
  {
    name: "Priya Iyer",
    role: "Student",
    feedback: "As a student, managing my expenses was tough. Xpensify made it so much easier!",
    image: "./pic1.jpg",
    rating: 4.5,
  },
  {
    name: "Vikram Das",
    role: "Small Business Owner",
    feedback: "I use Xpensify for my business and personal expenses. It’s a game changer!",
    image: "./pic6.jpg",
    rating: 5,
  },
];

// Function to render stars based on rating
const renderStars = (rating) => {
  const stars = [];
  for (let i = 1; i <= 5; i++) {
    if (i <= Math.floor(rating)) {
      stars.push(<FaStar key={i} color="#FFD700" className="me-1" />); // Full Star
    } else if (i === Math.ceil(rating) && rating % 1 !== 0) {
      stars.push(<FaStarHalfAlt key={i} color="#FFD700" className="me-1" />); // Half Star
    } else {
      stars.push(<FaRegStar key={i} color="#B0B0B0" className="me-1" />); // Empty Star
    }
  }
  return stars;
};

const Testimonials = () => {
  useEffect(() => {
    AOS.init({ duration: 1000, easing: "ease-in-out" });
  }, []);

  return (
    <section className="text-center py-5" style={{ backgroundColor: "#E8F6EF", padding: "60px 20px" }} id="testimonials">
      <div className="container">
        <h2 className="fw-bold mb-4" style={{ color: "#222831", fontSize: "2.4rem" }} data-aos="fade-up">
          What Our <span style={{ color: "#0B666A" }}>Users Say</span>
        </h2>
        <p className="mb-5" style={{ fontSize: "1.2rem", color: "#393E46", maxWidth: "700px", margin: "0 auto" }} data-aos="fade-up">
          Trusted by thousands of users to manage their expenses with ease.
        </p>

        <div className="row">
          {testimonials.map((testimonial, index) => (
            <div className="col-md-4 mb-4" key={index} data-aos="zoom-in">
              <div className="card border-0 shadow-sm p-4 h-100 d-flex flex-column align-items-center text-center" style={{ borderRadius: "12px" }}>
                <img
                  src={testimonial.image}
                  alt={testimonial.name}
                  className="rounded-circle mb-3"
                  width="80"
                  height="80"
                  style={{ objectFit: "cover", border: "4px solid #0B666A" }}
                />
                <h5 className="fw-semibold" style={{ color: "#2C3333" }}>{testimonial.name}</h5>
                <p className="text-muted" style={{ fontSize: "0.9rem" }}>{testimonial.role}</p>
                <p className="text-muted">{testimonial.feedback}</p>
                <div className="d-flex justify-content-center">
                  {renderStars(testimonial.rating)}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
