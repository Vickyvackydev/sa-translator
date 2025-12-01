import { useRef } from "react";
import { FRAME } from "../assets";
import { motion, useInView } from "framer-motion";
const services = [
  "Import & Export Services",
  "Procurement & Sourcing",
  "Ethical & Sustainable Trade Partnerships",
  "Agricultural & Industrial Supply",
  "Household & Commercial Equipment",
  "Logistics & Freight Solutions",
  "General Merchandise",
  "SME & Enterprise Solutions",
  "Technology & Communication Devices",
  "Construction & Building Materials",
];
function About() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "0px 0px -100px 0px" });
  return (
    <motion.div
      id="about"
      ref={ref}
      initial={{ opacity: 0, y: 50 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 1, ease: "easeOut" }}
      className="lg:p-16 p-10 flex items-start lg:flex-row flex-col space-x-16 justify-between lg:mt-20 mt-52"
    >
      <div className="w-full flex flex-col items-start gap-y-5 -mt-10">
        <span className="text-[#FE5208] font-semibold text-[16px]">
          ABOUT US
        </span>
        <span className="text-[28px] font-semibold">
          Fend Technologies Limited
        </span>
        <p className="font-medium text-sm">
          Fend Technologies Limited is an innovative Nigerian company
          established to transform how trade is conducted across Africa. Since
          its founding, FEND has been committed to simplifying commerce by
          providing intelligent solutions in Procurement, Import & Export,
          General Merchandise, and Cross-Border Trade. Through a combination of
          technology, transparency, and trust, the company delivers seamless
          sourcing, reliable logistics, and sustainable commerce services to
          businesses and institutions.
        </p>
        <p className="font-medium text-sm">
          FEND operates across multiple sectors, offering end-to-end support in
          product sourcing, international shipping, warehousing, and supply
          chain optimization. We are driven by a mission to digitize trade and
          empower African businesses with tools that enhance efficiency,
          cost-effectiveness, and global competitiveness
        </p>
        <span className="text-[#FE5208] font-semibold text-[20px]">
          Our Core Business Areas
        </span>
        <div className="w-full grid lg:grid-cols-2 grid-cols-1 gap-5">
          {services.map((s, i) => (
            <div key={i} className="flex items-center gap-x-2">
              <div className="w-[16px] h-[16px] bg-[#FE5208] rounded-sm rotate-45" />
              <span className="text-sm font-medium">{s}</span>
            </div>
          ))}
        </div>
      </div>

      <motion.img
        src={FRAME}
        alt="About Frame"
        className="w-[479px] h-[452px] object-contain"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={isInView ? { opacity: 1, scale: 1 } : {}}
        transition={{ duration: 1.2, ease: "easeOut", delay: 0.3 }}
      />
    </motion.div>
  );
}

export default About;
