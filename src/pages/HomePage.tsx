import Navbar from "../components/Navbar";
import MainContainer from "../components/MainContainer";
import Darkmode from "darkmode-js";
import React from "react";
import { useParams } from "react-router-dom";


const HomePage:React.FC = () => {
    
    new Darkmode({label: "🌓"}).showWidget();

    const { roomId } = useParams();
    
    return (
        <div className='flex flex-col items-center bg-lightmode_bg dark:bg-darkmode_bg h-screen w-full'>
            <Navbar />
            <MainContainer roomId={roomId} />
        </div>
    )
};

export default HomePage;