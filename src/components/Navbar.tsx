"use client";

import Link from "next/link";
import { Search, Globe, Menu, UserCircle, Home, Truck } from "lucide-react";
import { ConnectButton } from "thirdweb/react";
import { client, chain } from "@/lib/thirdweb";

function Navbar() {
  return (
    <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-md z-50 border-b border-gray-100">
      <div className="max-w-[2520px] mx-auto xl:px-20 md:px-10 sm:px-2 px-4">
        <div className="flex flex-row items-center justify-between gap-3 md:gap-0 h-20">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-1 cursor-pointer shrink-0">
            <div className="text-[#FF5A5F]">
              <svg
                viewBox="0 0 32 32"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
                role="presentation"
                focusable="false"
                style={{ display: "block", height: "32px", width: "32px", fill: "currentcolor" }}
              >
                <path d="M16 1c2.008 0 3.463.963 4.751 3.269l.533 1.025c1.954 3.83 6.114 12.54 7.1 14.836l.145.353c.667 1.591.91 3.162.726 4.692-.246 2.05-1.453 4.192-3.689 5.618-2.656 1.694-5.926 2.207-9.566 2.207-3.64 0-6.91-.513-9.566-2.207-2.236-1.426-3.443-3.568-3.689-5.618-.184-1.53-.162-3.141.602-4.73l.125-.26c.983-2.228 5.15-11.006 7.106-14.838l.532-1.023C12.536 1.963 13.992 1 16 1zm0 2c-1.273 0-2.29.629-3.208 2.27l-.448.862c-1.928 3.777-6.117 12.604-7.018 14.697-.611 1.272-.61 2.536-.452 3.755.19 1.488 1.15 2.977 2.872 4.075 2.274 1.45 5.025 1.741 8.254 1.741 3.23 0 5.98-.291 8.254-1.741 1.722-1.098 2.682-2.587 2.872-4.075.158-1.219.16-2.483-.452-3.755-.901-2.093-5.09-10.92-7.018-14.697l-.448-.862C18.29 3.629 17.273 3 16 3zm0 7c.828 0 1.5.672 1.5 1.5S16.828 13 16 13s-1.5-.672-1.5-1.5S15.172 10 16 10zm-8.205 7.44c1.076.602 4.691 2.376 8.205 2.376 3.513 0 7.128-1.774 8.205-2.376.545-.306 1.154.265.753.805-1.554 2.086-5.028 4.755-8.958 4.755-3.929 0-7.404-2.669-8.958-4.755-.401-.54-.208-1.11.753-.805z"></path>
              </svg>
            </div>
            <div className="hidden sm:block">
              <span className="text-[#FF5A5F] font-bold text-xl tracking-tighter">cartagena</span>
              <span className="text-gray-900 font-bold text-xl ml-0.5 opacity-40">concierge</span>
            </div>
          </Link>

          {/* Search Bar - Center (Desktop) */}
          <div className="hidden lg:flex border border-gray-200 rounded-full shadow-sm hover:shadow-md transition cursor-pointer py-2 pl-6 pr-2 items-center justify-between min-w-[400px]">
            <div className="text-[13px] font-bold px-4 border-r border-gray-100 text-[#222222]">
              Servicios
            </div>
            <div className="text-[13px] font-bold px-4 border-r border-gray-100 text-[#222222]">
              Logística
            </div>
            <div className="text-[13px] font-medium px-4 text-gray-400">
              ¿Qué necesitas?
            </div>
            <div className="p-2.5 bg-[#FF5A5F] rounded-full text-white">
              <Search size={14} strokeWidth={4} />
            </div>
          </div>

          {/* Mobile Search Icon (Instead of full bar) */}
          <div className="lg:hidden flex border border-gray-200 rounded-full shadow-sm p-3 items-center justify-center text-gray-900">
            <Search size={18} strokeWidth={2.5} />
          </div>

          {/* User Menu - Right */}
          <div className="flex items-center gap-2">
            <Link
              href="/business"
              className="hidden md:block text-[13px] font-bold text-[#222222] rounded-full hover:bg-gray-50 py-3 px-4 transition uppercase tracking-tight"
            >
              Portal Host
            </Link>

            <div className="hidden sm:flex hover:bg-gray-50 rounded-full p-3 transition cursor-pointer">
              <Globe size={16} className="text-[#222222]" />
            </div>

            {/* Refactor: SaaS Login Button (CRO) */}
            {/* 
            <div className="flex items-center gap-2 ml-1">
              <ConnectButton
                client={client}
                chain={chain}
                theme="light"
                connectButton={{
                  label: "Ingresar",
                  className: "!bg-transparent !text-[#222222] !font-bold !text-[13px] !border-2 !border-gray-100 !rounded-2xl !px-6 !h-11 hover:!bg-gray-50 transition-all",
                }}
              />
              <div className="hidden sm:block bg-gray-100 rounded-full p-2 border border-gray-200">
                <UserCircle size={22} className="text-gray-400 fill-white" />
              </div>
            </div> 
            */}

            <Link href="/login" className="flex items-center gap-2 ml-1 hover:shadow-md transition-all rounded-full border border-gray-200 p-2 pl-4 bg-white cursor-pointer group">
              <Menu size={18} className="text-gray-500 group-hover:text-gray-800" />
              <div className="bg-gray-500 rounded-full p-1 text-white group-hover:bg-[#FF5A5F] transition-colors">
                <UserCircle size={20} className="fill-current" />
              </div>
              <span className="sr-only">Ingresar</span>
            </Link>
          </div>

        </div>
      </div>

      {/* Mobile Bottom Navigation (Property Manager Style) */}
      <div className="md:hidden fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] glass rounded-2xl h-16 border border-white/50 shadow-hero z-50 flex items-center justify-around px-4">
        <Link href="/" className="flex flex-col items-center gap-1 text-[#FF5A5F]">
          <Search size={22} strokeWidth={2.5} />
          <span className="text-[10px] font-black uppercase tracking-tighter">Buscar</span>
        </Link>
        <Link href="/business" className="flex flex-col items-center gap-1 text-gray-400">
          <Home size={22} strokeWidth={2.5} />
          <span className="text-[10px] font-black uppercase tracking-tighter">Mis Props</span>
        </Link>
        <Link href="/orders" className="flex flex-col items-center gap-1 text-gray-400">
          <Truck size={22} strokeWidth={2.5} />
          <span className="text-[10px] font-black uppercase tracking-tighter">Pedidos</span>
        </Link>
      </div>
    </nav>
  );
}

export default Navbar;
