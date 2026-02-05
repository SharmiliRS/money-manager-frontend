import { useEffect } from "react";
import AOS from "aos";
import "aos/dist/aos.css";
import { 
  ChartBar, 
  Wallet, 
  Bell, 
  Layers, 
  Users,
  Shield,
  Smartphone,
  Target,
  PieChart,
  Zap
} from "lucide-react";

const Features = () => {
  useEffect(() => {
    AOS.init({ 
      duration: 800, 
      easing: "ease-in-out",
      once: true 
    });
  }, []);

  const features = [
    {
      icon: <ChartBar size={28} />,
      title: "Real-Time Analytics",
      description: "Get instant insights with live expense tracking and spending patterns.",
      delay: 100
    },
    {
      icon: <Wallet size={28} />,
      title: "Smart Budgeting",
      description: "Set, track, and optimize budgets with AI-powered recommendations.",
      delay: 200
    },
    {
      icon: <Bell size={28} />,
      title: "Smart Alerts",
      description: "Receive instant notifications when nearing budget limits or unusual spending.",
      delay: 300
    },
    {
      icon: <Layers size={28} />,
      title: "Expense Categorization",
      description: "Auto-categorize expenses for clear financial organization and reporting.",
      delay: 100
    },
    {
      icon: <Users size={28} />,
      title: "Multi-User Collaboration",
      description: "Share budgets and track expenses with family, friends, or teams seamlessly.",
      delay: 200
    },
    {
      icon: <Shield size={28} />,
      title: "Bank-Level Security",
      description: "Your financial data protected with end-to-end encryption and privacy.",
      delay: 300
    },
    {
      icon: <Smartphone size={28} />,
      title: "Cross-Platform Sync",
      description: "Access your finances anywhere, on all your devices in real-time.",
      delay: 100
    },
    {
      icon: <Target size={28} />,
      title: "Goal Tracking",
      description: "Set and track financial goals with progress monitoring and insights.",
      delay: 200
    }
  ];

  return (
    <section className="py-12 sm:py-16 md:py-20 bg-gradient-to-b from-white via-gray-50 to-gray-100" id="features">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12 sm:mb-16" data-aos="fade-up">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#0B666A]/10 rounded-full mb-6">
            <Zap size={16} className="text-[#0B666A]" />
            <span className="text-[#0B666A] font-medium text-sm">
              Powerful Features
            </span>
          </div>
          
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Why Choose{" "}
            <span className="text-[#0B666A]">
              Xpensify?
            </span>
          </h2>
          
          <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-3xl mx-auto px-4">
            Smart, simple, and effective features that help you take complete control of your finances.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {features.map((feature, index) => (
            <div
              key={index}
              data-aos="fade-up"
              data-aos-delay={feature.delay}
              className="group"
            >
              <div className="h-full bg-white rounded-xl sm:rounded-2xl border border-gray-200 p-5 sm:p-6 hover:shadow-lg hover:border-gray-300 transition-all duration-300">
                {/* Icon Container */}
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-lg sm:rounded-xl bg-[#0B666A]/10 flex items-center justify-center mb-4 sm:mb-5 group-hover:bg-[#0B666A]/20 transition-colors duration-300">
                  <div className="text-[#0B666A]">
                    {feature.icon}
                  </div>
                </div>
                
                {/* Content */}
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 sm:mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600 text-sm sm:text-base">
                  {feature.description}
                </p>
                
                {/* Bottom border on hover - straight line */}
                <div className="w-0 h-0.5 bg-[#0B666A] mt-4 sm:mt-5 group-hover:w-full transition-all duration-300 ease-in-out"></div>
              </div>
            </div>
          ))}
        </div>

        {/* Stats Banner - Responsive */}
        <div 
          className="mt-12 sm:mt-16 bg-gradient-to-r from-black to-gray-900 rounded-xl sm:rounded-2xl p-6 sm:p-8 text-white"
          data-aos="fade-up"
          data-aos-delay="400"
        >
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-8">
            <div className="text-center">
              <div className="text-2xl sm:text-3xl md:text-4xl font-bold mb-1 sm:mb-2">10,000+</div>
              <div className="text-gray-300 text-xs sm:text-sm md:text-base">Active Users</div>
            </div>
            <div className="text-center">
              <div className="text-2xl sm:text-3xl md:text-4xl font-bold mb-1 sm:mb-2">$2.5M+</div>
              <div className="text-gray-300 text-xs sm:text-sm md:text-base">Total Savings</div>
            </div>
            <div className="text-center">
              <div className="text-2xl sm:text-3xl md:text-4xl font-bold mb-1 sm:mb-2">24/7</div>
              <div className="text-gray-300 text-xs sm:text-sm md:text-base">Support</div>
            </div>
            <div className="text-center">
              <div className="text-2xl sm:text-3xl md:text-4xl font-bold mb-1 sm:mb-2">99.9%</div>
              <div className="text-gray-300 text-xs sm:text-sm md:text-base">Uptime</div>
            </div>
          </div>
        </div>

        
      </div>
    </section>
  );
};

export default Features;