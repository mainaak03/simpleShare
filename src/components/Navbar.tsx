import React from "react";
import logoUrl from "../assets/logo.svg";

const Navbar:React.FC = () => {
    
    return (
        <div className="flex flex-row justify-between w-full px-12 border-b-2 border-darkmode_bg dark:border-lightmode_bg border-opacity-20 dark:border-opacity-20">
            <div className="flex items-center text-2xl font-light tracking-wide text-darkmode_bg dark:text-lightmode_bg px-8 py-4">
                <img src={logoUrl} className="h-10 w-10 mr-4 dark:invert" alt="logo" />
                <p>simpleShare</p>
            </div>
            <div className="flex flex-row items-center px-8 text-darkmode_bg dark:text-lightmode_bg text-opacity-80 dark:text-opacity-80">
                <div className="text-sm font-normal p-4">
                    About
                </div>
                <div className="text-sm font-normal p-4">
                    Privacy
                </div>
            </div>
        </div>
    )
}

export default Navbar;