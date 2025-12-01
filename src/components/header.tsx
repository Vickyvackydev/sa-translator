import { Link } from "react-router-dom";
import { FEND_FOOTER_LOGO, FEND_LOGO } from "../assets";
import Button from "./button";
import { useEffect, useState } from "react";
import { useMediaQuery } from "../hooks";
import { FaBars, FaTimes } from "react-icons/fa";
import { Transition } from "@headlessui/react";
function Header() {
  const [scrolled, setScrolled] = useState(false);
  const mobile = useMediaQuery("(max-width: 640px)");
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const handleScroll = () => {
      const heroHeight =
        document.getElementById("hero-section")?.offsetHeight || 300;
      const scrollY = window.scrollY;
      setScrolled(scrollY > heroHeight - 60);
    };
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const handleScrollToElem = (id: string) => {
    const elem = document.getElementById(id);
    if (elem) {
      elem.scrollIntoView({ behavior: "smooth" });
    }
  };
  return (
    <>
      {mobile ? (
        <div
          className={`w-full top-0 z-50 flex items-center justify-between p-5 fixed ${
            scrolled
              ? "bg-white shadow-md "
              : open
              ? "bg-black/80"
              : "bg-transparent"
          } transition-colors duration-300 `}
        >
          <Link to={"/"}>
            <img
              src={scrolled ? FEND_FOOTER_LOGO : FEND_LOGO}
              className="w-[113.62px] h-[42px]"
              alt=""
            />
          </Link>
          <div onClick={() => setOpen((prev) => !prev)}>
            {open ? (
              <FaTimes color={scrolled ? "black" : "white"} />
            ) : (
              <FaBars color={scrolled ? "black" : "white"} />
            )}
          </div>
          <Transition
            show={open}
            enter="transform transition-transform ease-out duration-300"
            enterFrom="-translate-y-full"
            enterTo="-translate-y-0"
            leave="transform transition-transform ease-in duration-200"
            leaveFrom="-translate-y-0"
            leaveTo="-translate-y-full"
          >
            <div
              className={`absolute ${
                scrolled ? "bg-white" : "bg-black/80"
              } w-full h-[250px] flex items-start flex-col top-20 z-50 shadow-2xl left-0 p-5 gap-y-3`}
            >
              <div
                className={`flex items-start flex-col space-y-5 ${
                  scrolled ? "text-black " : "text-white"
                } transition-colors duration-300 font-normal text-[16px]`}
              >
                <span
                  onClick={() => handleScrollToElem("hero-section")}
                  className="cursor-pointer"
                >
                  Home
                </span>
                <span
                  onClick={() => handleScrollToElem("about")}
                  className="cursor-pointer"
                >
                  About Us
                </span>
                <span
                  onClick={() => handleScrollToElem("why-fend")}
                  className="cursor-pointer"
                >
                  Why Fend
                </span>
                <span
                  onClick={() => handleScrollToElem("contact")}
                  className="cursor-pointer"
                >
                  Contact
                </span>
              </div>
              <Button
                title={"Get a Quote"}
                handleClick={() => {}}
                btnStyles={"px-4 py-2"}
                textStyle={""}
              />
            </div>
          </Transition>
        </div>
      ) : (
        <div
          className={`w-full fixed left-0 px-20 py-7  z-50 top-0 right-0 flex items-center justify-between ${
            scrolled ? "bg-white shadow-md " : "bg-transparent"
          } transition-colors duration-300`}
        >
          <Link to={"/"}>
            <img
              src={scrolled ? FEND_FOOTER_LOGO : FEND_LOGO}
              className="w-[113.62px] h-[42px]"
              alt=""
            />
          </Link>
          <div
            className={`flex items-center justify-center space-x-7 ${
              scrolled ? "text-black " : "text-white"
            } transition-colors duration-300 font-normal text-[16px]`}
          >
            <span
              onClick={() => handleScrollToElem("hero-section")}
              className="cursor-pointer"
            >
              Home
            </span>
            <span
              onClick={() => handleScrollToElem("about")}
              className="cursor-pointer"
            >
              About Us
            </span>
            <span
              onClick={() => handleScrollToElem("why-fend")}
              className="cursor-pointer"
            >
              Why Fend
            </span>
            <span
              onClick={() => handleScrollToElem("contact")}
              className="cursor-pointer"
            >
              Contact
            </span>
          </div>
          <Button
            title={"Get a Quote"}
            handleClick={() => {}}
            btnStyles={"px-4 py-2"}
            textStyle={""}
          />
        </div>
      )}
    </>
  );
}

export default Header;
