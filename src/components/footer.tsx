import { Link } from "react-router-dom";
import { FEND_FOOTER_LOGO } from "../assets";
import { footer } from "../constant";

const FooterLinks = ({
  title,
  links,
}: {
  title: string;
  links: Array<{ title: string; link: string }>;
}) => (
  <div className="flex flex-col gap-y-3">
    <span className="text-white font-medium text-[16px]">{title}</span>
    <ul className="flex flex-col gap-y-3">
      {links.map((item) => (
        <Link to={item.link} className="text-sm font-normal text-[#9B9B9B]">
          {item.title}
        </Link>
      ))}
    </ul>
  </div>
);
function Footer() {
  return (
    <div className="w-full h-full bg-[#121212]">
      <div className="flex items-start lg:flex-row flex-col  justify-between gap-10 lg:p-20 p-10">
        <div className="lg:w-[20vw] w-full flex items-start flex-col gap-y-3">
          <img
            src={FEND_FOOTER_LOGO}
            className="w-[122.86px] h-[40px] object-contain"
            alt=""
          />
          <span className="text-[#9B9B9B] text-sm font-normal">
            Digitizing commerce across Africa, empowering smarter procurement
            and seamless export.
          </span>
        </div>
        <FooterLinks title={footer[0].title} links={footer[0].links} />
        <FooterLinks title={footer[1].title} links={footer[1].links} />
      </div>
      <div className="flex items-center justify-center border-t border-[#FFFFFF] py-5">
        <span className="text-sm font-normal text-[#9B9B9B] text-center">
          Copyright © 2025 Fend Technologies Limited, All Right Reserved.
        </span>
      </div>
    </div>
  );
}

export default Footer;
