import { useRef } from "react";
import { CHECK_ROUND, FEND_IMPORT } from "../assets";
import { motion, useInView } from "framer-motion";

function Advert() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "0px 0px -100px 0px" });
  return (
    <div className="w-full relative h-[538px] overflow-hidden">
      <div className="w-full h-full absolute inset-0">
        <img src={FEND_IMPORT} className="w-full h-full object-cover" alt="" />
      </div>
      <div className="absolute inset-0 bg-[#00000099] z-10"></div>

      <div className="absolute flex-col lg:p-20 p-10 gap-y-5 inset-0 flex z-40 items-start text-white justify-start">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 1.2, ease: "easeOut" }}
          className="absolute flex-col lg:p-20 p-10 gap-y-5 inset-0 flex z-40 items-start text-white justify-start"
        >
          <p className="text-[16px] font-medium text-start">
            Leading the Way in Digitizing Commerce Across Africa
          </p>
          <span className="lg:text-[32px] text-2xl font-bold text-start leading-snug">
            Empowering Your Business with Seamless <br /> Procurement, Export,
            and Merchandise <br /> Solutions
          </span>

          {/* Checklist */}
          <div className="flex flex-col items-start gap-y-3">
            {[
              "Wide Supplier Network Across Africa & Beyond",
              "Advanced AI-Powered Platform",
              "Trusted by Businesses Large and Small",
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={isInView ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.6, delay: 0.4 + i * 0.2 }}
                className="flex items-center gap-x-3"
              >
                <img
                  src={CHECK_ROUND}
                  className="w-[20px] h-[20px]"
                  alt="Check icon"
                />
                <span>{item}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default Advert;
