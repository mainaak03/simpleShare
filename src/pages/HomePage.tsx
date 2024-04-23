import Navbar from "../components/Navbar";
import MainContainer from "../components/MainContainer";
import Darkmode from "darkmode-js";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import React from "react";
import { useParams } from "react-router-dom";


const HomePage:React.FC = () => {
    const connectionNotify = (connectionState: boolean) => toast(connectionState ?
        <span>A ShareMate connected with you. You can now share files!</span>
        :
        <span>Your ShareMate disconnected.</span>
      );
    
    new Darkmode({label: "🌓"}).showWidget();

    const { roomId } = useParams();
    
    return (
        <div className='flex flex-col items-center bg-lightmode_bg dark:bg-darkmode_bg h-screen w-full'>
            <Navbar />
            <MainContainer roomId={roomId} handleConnectionNotif={(connectionState) => connectionNotify(connectionState)} />
            <ToastContainer stacked hideProgressBar autoClose={2500} />
        </div>
    )
};

export default HomePage;