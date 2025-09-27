import { ToastContainer } from 'react-toastify'
import './App.css'
import Index from './routes/Index'

function App() {

  return (
   <> 
    <ToastContainer
        position="top-right"
        autoClose={4000}
        hideProgressBar={true}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
      />
   <Index />
   </>
  )
}

export default App
