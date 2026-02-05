import "bootstrap/dist/css/bootstrap.min.css";
import { FaFacebook, FaTwitter, FaInstagram, FaLinkedin } from "react-icons/fa";

const ContactUs = () => {
  return (
    <section className="py-5" style={{ backgroundColor: "#F8F9FA", padding: "60px 20px" }} id="contact">
      <div className="container">
        <h2 className="fw-bold text-center mb-4" style={{ color: "#222831", fontSize: "2.4rem" }}>
          Get In <span style={{ color: "#0B666A" }}>Touch</span>
        </h2>
        <p className="text-center mb-5" style={{ fontSize: "1.2rem", color: "#393E46", maxWidth: "700px", margin: "0 auto" }}>
          Have questions or feedback? We'd love to hear from you!
        </p>

        <div className="row">
          <div className="col-md-6 mx-auto">
            <form>
              <div className="mb-3">
                <label className="form-label">Your Name</label>
                <input type="text" className="form-control" placeholder="Enter your name" required />
              </div>
              <div className="mb-3">
                <label className="form-label">Email Address</label>
                <input type="email" className="form-control" placeholder="Enter your email" required />
              </div>
              <div className="mb-3">
                <label className="form-label">Message</label>
                <textarea className="form-control" rows="4" placeholder="Type your message..." required></textarea>
              </div>
              <button type="submit" className="btn btn-dark w-100">
                Send Message
              </button>
            </form>
          </div>
        </div>

        {/* Social Media Links */}
        <div className="text-center mt-5">
          <p className="fw-semibold">Follow us on</p>
          <div className="d-flex justify-content-center gap-3">
            <FaFacebook size={30} color="#1877F2" />
            <FaTwitter size={30} color="#1DA1F2" />
            <FaInstagram size={30} color="#E4405F" />
            <FaLinkedin size={30} color="#0077B5" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactUs;
