import './App.css';
import Navbar from './components/Navbar';
import MainContainer from './components/MainContainer';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Darkmode from "darkmode-js";

function App() {

  const pokeNotify = (senderUsername: string) => toast(<span><strong>{senderUsername}</strong> waved at you 👋🏼 !</span>);

  const connectionNotify = (connectionState: boolean) => toast(connectionState ?
    <span>Your ShareMate connected with you. You can now share files!</span>
    :
    <span>ShareMates are disconnected.</span>
  );

  new Darkmode({label: "🌓"}).showWidget();

  return (
    <>
      <div className='flex flex-col items-center bg-lightmode_bg dark:bg-darkmode_bg h-screen w-full'>
        <Navbar />
        <MainContainer handlePokeNotif={(senderUsername: string) => pokeNotify(senderUsername)} handleConnectionNotif={(connectionState) => connectionNotify(connectionState)} />
        <ToastContainer stacked hideProgressBar autoClose={2500} />
      </div>
    </>
  )
}

export default App;
