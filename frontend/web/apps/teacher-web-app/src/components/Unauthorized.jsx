import { useLocation, useNavigate } from 'react-router-dom';
import { ShieldX, ChevronLeft, Home } from 'lucide-react';

const Unauthorized = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  const message = location.state?.message || 'You do not have permission to access this page.';

  return (
    <div className="unauthorized-page">
      <div className="unauthorized-container">
        <div className="unauthorized-content">
          <div className="unauthorized-icon">
            <ShieldX size={64} />
          </div>
          
          <h1>Access Denied</h1>
          <p>{message}</p>
          
          <div className="unauthorized-actions">
            <button 
              className="primary-button"
              onClick={() => navigate('/overview')}
            >
              <Home size={16} />
              Go to Dashboard
            </button>
            
            <button 
              className="secondary-button"
              onClick={() => navigate(-1)}
            >
              <ChevronLeft size={16} />
              Go Back
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Unauthorized;