//------------>All Imports<------------
import { navList } from "../Navbars/landingNavBar";
import Logo from "../logo";

export const Community = [
  {
    id: 1,
    name: "Instagram",
    path: "",
  },
  {
    id: 2,
    name: "Twitter",
    path: "",
  },
  {
    id: 3,
    name: "WhatsApp",
    path: "https://wa.me/+2347068214943",
  },
];

const Footer = () => {
  return (
    <footer className="w-full mt-5 md:flex-col sm:flex-col md:gap-7 sm:gap-7 items-start flex gap-10 px-5 py-3 bg-slate-900 text-white h-[45vh] md:h-fit sm:h-fit">
      <div className="w-full h-full flex-col gap-2 flex justify-center">
        <Logo color="white" size="medium" />
        <p>A new way to make payment easy,relaible and secure.</p>
      </div>
      <div className="w-full">
        <h2 className="text-xl font-semibold">Useful Links</h2>
        <div className="flex mt-2 flex-col gap-3">
          {navList.map((nav) => (
            <li className="list-none" key={nav.id}>
              <a href={nav.path}>{nav.name}</a>
            </li>
          ))}
        </div>
      </div>
      <div className="w-full">
        <h2 className="text-xl font-semibold">Community</h2>
        <div className="flex mt-2 flex-col gap-3">
          {Community.map((nav) => (
            <li className="list-none" key={nav.id}>
              <a href={nav.path}>{nav.name}</a>
            </li>
          ))}
        </div>
      </div>
      <div className="w-full h-[2px] hidden md:block sm:block bg-gray-300" />
      <div className="w-full flex md:flex-col sm:flex-col items-center justify-between">
        <p className="text-lg">
          Copyright &copy; 2023 9jaWise. All Right Reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
