import { useRef } from "react";
import { CALL_FRAME } from "../assets";
import Button from "../components/button";
import { motion, useInView } from "framer-motion";

function Quote() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "0px 0px -100px 0px" });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 60 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 1, ease: "easeOut" }}
      className="w-[90vw] -mt-16 absolute z-40 lg:p-16 p-5 rounded-sm gap-x-5 gap-y-5 lg:right-16 right-4 space-x-4 shadow-lg bg-white flex lg:flex-row flex-col items-start justify-center"
    >
      <motion.div
        initial={{ opacity: 0, x: -30 }}
        animate={isInView ? { opacity: 1, x: 0 } : {}}
        transition={{ duration: 1.1, ease: "easeOut", delay: 0.3 }}
        className="lg:w-[380px] w-full h-[400px] p-7 flex flex-col gap-y-5 rounded-lg bg-[#FE5208]"
      >
        <div className="flex flex-col gap-y-3 items-start text-white">
          <span className="text-[16px] font-bold">Our Location</span>
          <span className="text-sm font-medium">
            Plot 234, Victoria Island, Lagos, Nigeria
          </span>
        </div>
        <div className="flex flex-col gap-y-3 items-start text-white">
          <span className="text-[16px] font-bold">Quick Contact</span>
          <div>
            <span className="text-sm font-medium">Email: info@fendtech.ng</span>
          </div>
        </div>
        <span className="text-sm text-white font-medium">
          We will get back to you within 24 hours, or call us everyday, 09:00 AM
          - 06:00 PM
        </span>
        <div className="flex items-center gap-x-3 text-white">
          <img src={CALL_FRAME} className="w-[40px] h-[40px]" alt="" />
          <span className="text-[16px] font-bold"> +234 701 234 5678</span>
        </div>
      </motion.div>
      <div className="w-full h-full flex flex-col items-start gap-y-5">
        <span className="font-bold text-2xl">Request a Quote</span>
        <span className="text-sm text-[#9B9B9B] font-medium">
          We’re here to assist you with procurement, export, and general
          merchandise inquiries. Please fill the form below and we’ll respond
          promptly.
        </span>
        <div className="w-full flex flex-col items-start gap-y-3">
          <span className="text-sm font-semibold">Personal Details</span>
          <div className="w-full grid lg:grid-cols-3 grid-cols-1 gap-4">
            <input
              type="text"
              placeholder="Name (Your Full Name)"
              className="outline-none  text-sm placeholder:text-[#808080] border border-[#E9EAEB] p-3 lg:w-[230px] w-full"
            />
            <input
              placeholder="Company Name"
              type="text"
              className="outline-none text-sm placeholder:text-[#808080] border border-[#E9EAEB] p-3 lg:w-[230px] w-full"
            />
            <input
              type="email"
              placeholder="Email (Your Email Address)"
              className="outline-none text-sm placeholder:text-[#808080] border border-[#E9EAEB] p-3 lg:w-[230px] w-full"
            />
            <input
              type="tel"
              placeholder="Phone (Phone Number)"
              className="outline-none text-sm placeholder:text-[#808080] border border-[#E9EAEB] p-3 lg:w-[230px] w-full"
            />
            <input
              type="text"
              placeholder="Industry / Sector"
              className="outline-none text-sm placeholder:text-[#808080] border border-[#E9EAEB] p-3 lg:w-[230px] w-full"
            />
          </div>
        </div>
        <div className="w-full flex flex-col items-start gap-y-3">
          <span className="text-sm font-semibold">Shipment Details</span>
          <div className="w-full grid lg:grid-cols-3 grid-cols-1 gap-4">
            <input
              type="text"
              placeholder="Product/Service Needed"
              className="outline-none text-sm placeholder:text-[#808080] border border-[#E9EAEB] p-3 lg:w-[230px] w-full"
            />
            <input
              placeholder="Quantity / Volume (Optional)"
              type="text"
              className="outline-none text-sm placeholder:text-[#808080] border border-[#E9EAEB] p-3 lg:w-[230px] w-full"
            />
            <input
              type="email"
              placeholder="Delivery Location"
              className="outline-none text-sm placeholder:text-[#808080] border border-[#E9EAEB] p-3 lg:w-[230px] w-full"
            />
            <input
              type="tel"
              placeholder="Preferred Delivery Date (Optional)"
              className="outline-none text-sm placeholder:text-[#808080] border border-[#E9EAEB] p-3 lg:w-[230px] w-full"
            />
            <input
              type="text"
              placeholder="Additional Details"
              className="outline-none text-sm placeholder:text-[#808080] border border-[#E9EAEB] p-3 lg:w-[230px] w-full"
            />
            <div className=" text-sm flex items-start text-[#808080] border border-[#E9EAEB] p-3 lg:w-[230px] w-full">
              Additional Details
            </div>
          </div>
        </div>
        <Button
          title={"Request a Quote"}
          handleClick={() => {}}
          btnStyles={"px-8 py-3 self-end"}
          textStyle={""}
        />
      </div>
    </motion.div>
  );
}

export default Quote;
