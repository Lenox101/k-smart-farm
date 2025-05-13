import React from 'react';
import { BrowserRouter as Router, Route, Routes } from "react-router-dom"; // Use Routes instead of Switch
import { StateContextProvider } from './Context'; // Import the StateContextProvider
import Homepage from "./Homepage";
import Login from "./Login"; // Import your Login component
import Signup from './Signup';
import Landingpage from './Landingpage';
import Weather from './Weather';
import Marketplace from './Marketplace';
import FarmInputs from './Farminputs';
import Farmingguides from './Farmingguide';
import CommunityForum from './Community';
import PrivateRoute from './PrivateRoute';
import Settings from './Settings';
import Forgotpassword from './Forgotpassword';
import Resetpassword from './ResetPassword';
import AdminPanel from './admin/AdminPanel';
import ProtectedRoute from './ProtectedRoute';
import AdminRegistration from './admin/AdminRegistration';

function App() {
  return (
    <StateContextProvider> {/* Wrap the Routes with StateContextProvider */}
      <Router>
        <Routes>
          <Route path="/" element={<Homepage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/forgotpassword" element={<Forgotpassword />} />
          <Route path="/resetpassword/:token" element={<Resetpassword />} />
          <Route path='/signup' element={<Signup />} />
          <Route 
            path='/landingpage' 
            element={
              <PrivateRoute>
                <Landingpage />
              </PrivateRoute>
            } 
          />
          <Route 
            path='/settings'
            element={
              <PrivateRoute>
                <Settings/>
              </PrivateRoute>
            }
          />
          <Route path='/weather' element={<Weather />} />
          <Route path='/marketplace' element={<Marketplace />} />
          <Route path='/farminputs' element={<FarmInputs />} /> 
          <Route path='/farmingguides' element={<Farmingguides />} />
          <Route path='/community' element={<CommunityForum />} />
          <Route path="/admin" element={
            <ProtectedRoute isAdmin>
                <AdminPanel />
            </ProtectedRoute>
          } />
          <Route path="/admin-register" element={<AdminRegistration />} />
        </Routes>
      </Router>
    </StateContextProvider>
  );
}

export default App;