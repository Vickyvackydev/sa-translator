import { useRef } from "react";
import { moreDetails } from "../constant";
import { motion, useInView } from "framer-motion";

function More() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "0px 0px -100px 0px" });
  return (
    <motion.div
      id="why-fend"
      ref={ref}
      initial={{ opacity: 0, y: 60 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="bg-[#F7F7F7] lg:p-20 p-10 lg:mt-[35rem] mt-[85rem] flex flex-col gap-y-10"
    >
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ delay: 0.2, duration: 0.6 }}
        className="w-full flex items-center lg:flex-row flex-col justify-between"
      >
        <div className="flex flex-col w-full gap-y-3">
          <span className="text-[#FE5208] text-[16px]">
            Safe, Transparent, and Efficient Trade Solutions!
          </span>
          <span className="text-[32px] font-semibold">
            Simplifying Procurement & Export Across Africa and Beyond.
          </span>
        </div>
        <span className="text-[16px] font-medium lg:w-[65vw] w-full">
          Our extensive network, advanced technology, and expert logistics
          solutions ensure your supply chain operates seamlessly — from sourcing
          to delivery.
        </span>
      </motion.div>
      <div className="w-full flex lg:flex-row flex-col gap-y-5 items-start gap-x-7">
        {moreDetails.map((item, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 40 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.3 + index * 0.2 }}
            className="w-full h-full flex flex-col gap-y-3 p-7 bg-white border-b-[3px] border-[#FE5208]"
          >
            <img src={item.img} className="w-[46.83px] h-[50px]" alt="" />
            <span className="text-lg font-medium">{item.title}</span>
            <p className="text-[#9B9B9B] font-medium text-sm">{item.details}</p>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

export default More;
