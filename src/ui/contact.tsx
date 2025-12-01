import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

import iconUrl from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";
import { CALL_FRAME } from "../assets";
import Button from "../components/button";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";
// @ts-ignore
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl,
  shadowurl: iconShadow,
});
function Contact() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "0px 0px -100px 0px" });
  return (
    <div id="contact" className="w-full lg:h-[630px] h-[1100px] relative">
      {/* Map Layer */}
      <MapContainer
        center={[6.4281, 3.4216]}
        zoom={12}
        scrollWheelZoom={false}
        className="absolute inset-0 z-0"
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={[6.4281, 3.4216]}>
          <Popup>FEND Technologies Ltd.</Popup>
        </Marker>
      </MapContainer>

      {/* Overlay */}
      <div className="absolute inset-0 bg-[#00000099] z-10"></div>

      {/* Contact Card and Form */}
      <motion.div
        ref={ref}
        initial={{ opacity: 0, y: 60 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 1, ease: "easeOut" }}
        className="lg:w-[70vw] w-[90vw] mt-16 absolute z-40 lg:p-16 p-5 rounded-sm gap-x-5 lg:right-1/4 right-5 space-x-4 space-y-4 shadow-lg bg-white flex items-start lg:flex-row flex-col justify-center"
      >
        {/* Contact Info Card */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={isInView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 1.1, ease: "easeOut", delay: 0.3 }}
          className="lg:w-[380px] w-full h-[400px] p-5 flex flex-col gap-y-5 rounded-lg bg-[#FE5208]"
        >
          <div className="flex flex-col gap-y-3 items-start text-white">
            <span className="text-[16px] font-bold">Our Location</span>
            <span className="text-sm font-medium">
              Plot 234, Victoria Island, Lagos, Nigeria
            </span>
          </div>

          <div className="flex flex-col gap-y-3 items-start text-white">
            <span className="text-[16px] font-bold">Quick Contact</span>
            <span className="text-sm font-medium">Email: info@fendtech.ng</span>
          </div>

          <span className="text-sm text-white font-medium">
            We will get back to you within 24 hours, or call us everyday, 09:00
            AM - 06:00 PM
          </span>

          <div className="flex items-center gap-x-3 text-white">
            <img
              src={CALL_FRAME}
              className="w-[40px] h-[40px]"
              alt="Call Icon"
            />
            <span className="text-[16px] font-bold">+234 701 234 5678</span>
          </div>
        </motion.div>

        {/* Contact Form */}
        <div className="w-full h-full flex flex-col items-start gap-y-5">
          <span className="font-bold text-2xl">Contact Us</span>
          <span className="text-sm text-[#9B9B9B] font-medium">
            We’re here to assist you with procurement, export, and general
            merchandise inquiries. Please fill the form below and we’ll respond
            promptly.
          </span>

          <div className="flex flex-col items-start gap-y-3 w-full">
            <span className="text-sm font-semibold">Personal Details</span>
            <div className="w-full grid lg:grid-cols-2 grid-cols-1 lg:gap-3 gap-5">
              <input
                type="text"
                placeholder="Name (Your Full Name)"
                className="outline-none text-sm placeholder:text-[#808080] border border-[#E9EAEB] p-3 lg:w-[230px] w-full"
              />
              <input
                type="text"
                placeholder="Company Name"
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
            </div>
          </div>

          <Button
            title="Send"
            handleClick={() => {}}
            btnStyles="px-8 py-3"
            textStyle=""
          />
        </div>
      </motion.div>
    </div>
  );
}

export default Contact;
