import { ArrowRight, TrendingUp, BarChart3 } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Hero = () => {
  const navigate = useNavigate();

  const features = [
    { icon: <TrendingUp size={24} />, text: "Real-time Analytics" },
    { icon: <BarChart3 size={24} />, text: "Smart Insights" },
  ];

  // Graph data
  const graphData = [
    { day: "Mon", value: 40 },
    { day: "Tue", value: 65 },
    { day: "Wed", value: 80 },
    { day: "Thu", value: 60 },
    { day: "Fri", value: 75 },
    { day: "Sat", value: 90 },
    { day: "Sun", value: 70 },
  ];

  const maxValue = 100;
  const svgHeight = 120;
  const svgWidth = 280;

  // Calculate points for polyline
  const calculatePoints = () => {
    return graphData.map((data, index) => {
      const x = (index / (graphData.length - 1)) * svgWidth;
      const y = svgHeight - (data.value / maxValue) * svgHeight;
      return `${x},${y}`;
    }).join(' ');
  };

  return (
    <section className="min-h-screen bg-gradient-to-br from-white via-gray-50 to-[#F5F5F5] flex items-center px-4 py-20 sm:py-12 md:py-28">
      <div className="max-w-7xl mx-auto w-full">
        <div className="grid lg:grid-cols-2 gap-8 sm:gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-6 sm:space-y-8 px-2 sm:px-0">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-snug sm:leading-tight">
              <span className="block text-black">
                Know Your Spend,
              </span>
              <span className="block mt-2 sm:mt-4">
                <span className="text-[#0B666A]">Grow</span> Your Savings
              </span>
            </h1>

            <p className="text-base sm:text-lg md:text-xl text-gray-600 leading-relaxed max-w-2xl">
              Take control of your finances with 
              <span className="text-[#0B666A] font-semibold"> Xpensify</span> – 
              the intelligent platform that transforms spending habits into 
              actionable insights for financial freedom.
            </p>

            {/* Features */}
            <div className="flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-4">
              {features.map((feature, index) => (
                <div 
                  key={index}
                  className="flex items-center gap-2 px-4 py-3 sm:px-4 sm:py-2 bg-white border border-gray-200 rounded-lg shadow-sm w-full sm:w-auto"
                >
                  <div className="text-[#0B666A]">
                    {feature.icon}
                  </div>
                  <span className="text-gray-700 font-medium text-sm sm:text-base">
                    {feature.text}
                  </span>
                </div>
              ))}
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-2">
              <button
                onClick={() => navigate("/register")}
                className="group bg-black text-white px-5 sm:px-6 py-3 sm:py-4 rounded-xl font-semibold text-base sm:text-lg hover:bg-gray-900 transition-all duration-300 hover:shadow-xl flex items-center justify-center gap-2"
              >
                <span className="whitespace-nowrap">Start Free Trial</span>
                <ArrowRight className="group-hover:translate-x-1 transition-transform w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </div>
          </div>

          {/* Right Content - Dashboard Preview */}
          <div className="relative px-2 sm:px-0">
            {/* Main Dashboard Card */}
            <div className="bg-white rounded-2xl shadow-xl sm:shadow-2xl p-4 sm:p-6 border border-gray-200">
              <div className="flex justify-between items-center mb-4 sm:mb-6">
                <div>
                  <h3 className="text-lg sm:text-xl font-bold text-black">
                    Monthly Overview
                  </h3>
                  <p className="text-gray-500 text-sm sm:text-base">November 2023</p>
                </div>
                <div className="px-3 sm:px-4 py-1.5 sm:py-2 bg-[#0B666A]/10 text-[#0B666A] rounded-full font-medium text-sm sm:text-base">
                  +12.5%
                </div>
              </div>
              
              {/* Responsive Line Graph */}
              <div className="h-36 sm:h-40 md:h-48 relative mb-6 sm:mb-8">
                {/* Grid lines */}
                <div className="absolute inset-0 ml-8 sm:ml-10 flex flex-col justify-between">
                  {[0, 1, 2, 3, 4].map((i) => (
                    <div key={i} className="border-t border-gray-100"></div>
                  ))}
                </div>
                
                {/* Y-axis labels - Responsive text size */}
                <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-[10px] sm:text-xs text-gray-400">
                  <span className="hidden sm:inline">$1000</span>
                  <span className="sm:hidden">$1K</span>
                  <span className="hidden sm:inline">$750</span>
                  <span className="sm:hidden">$750</span>
                  <span>$500</span>
                  <span className="hidden sm:inline">$250</span>
                  <span className="sm:hidden">$250</span>
                  <span>$0</span>
                </div>

                {/* SVG Graph Container */}
                <div className="ml-8 sm:ml-10 h-full relative">
                  <svg 
                    viewBox="0 0 280 120" 
                    preserveAspectRatio="none"
                    className="w-full h-full"
                  >
                    {/* Line connecting all points */}
                    <polyline
                      points={calculatePoints()}
                      fill="none"
                      stroke="#0B666A"
                      strokeWidth="1.5 sm:strokeWidth-2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    
                    {/* Data points - Smaller on mobile */}
                    {graphData.map((data, index) => {
                      const x = (index / (graphData.length - 1)) * svgWidth;
                      const y = svgHeight - (data.value / maxValue) * svgHeight;
                      const isPeak = data.value === 90;
                      
                      return (
                        <circle 
                          key={index}
                          cx={x}
                          cy={y}
                          r="3"
                          fill="#0B666A"
                          className={isPeak ? "ring-2 ring-[#0B666A]/30" : ""}
                        />
                      );
                    })}
                  </svg>

                  {/* Day labels - Responsive text */}
                  <div className="absolute -bottom-5 sm:-bottom-6 left-0 right-0 flex">
                    {graphData.map((data, index) => (
                      <div 
                        key={index} 
                        className="flex-1 text-center"
                      >
                        <span className="text-[10px] sm:text-xs text-gray-500">
                          {data.day}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Stats - Responsive grid */}
              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                <div className="bg-gray-50 p-3 sm:p-4 rounded-xl">
                  <p className="text-gray-600 text-xs sm:text-sm">Total Savings</p>
                  <p className="text-xl sm:text-2xl font-bold text-black">$2,840</p>
                </div>
                <div className="bg-[#0B666A]/5 p-3 sm:p-4 rounded-xl">
                  <p className="text-[#0B666A] text-xs sm:text-sm">Monthly Goal</p>
                  <p className="text-xl sm:text-2xl font-bold text-[#0B666A]">85%</p>
                </div>
              </div>
            </div>

            {/* Floating Cards - Responsive positioning and size */}
            <div className="absolute -bottom-4 -left-4 sm:-bottom-6 sm:-left-6 bg-black text-white p-2.5 sm:p-4 rounded-lg sm:rounded-xl shadow-lg sm:shadow-xl">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-[#0B666A] rounded-md sm:rounded-lg flex items-center justify-center">
                  <TrendingUp size={16} className="sm:w-5 sm:h-5" />
                </div>
                <div>
                  <p className="font-bold text-sm sm:text-base">24% Growth</p>
                  <p className="text-gray-300 text-xs sm:text-sm">This month</p>
                </div>
              </div>
            </div>

            <div className="absolute -top-4 -right-4 sm:-top-6 sm:-right-6 bg-white p-2.5 sm:p-4 rounded-lg sm:rounded-xl shadow-lg sm:shadow-xl border border-gray-200">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gray-100 rounded-md sm:rounded-lg flex items-center justify-center">
                  <BarChart3 className="text-gray-700 w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <div>
                  <p className="font-bold text-black text-sm sm:text-base">AI Insights</p>
                  <p className="text-gray-500 text-xs sm:text-sm">Active</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;