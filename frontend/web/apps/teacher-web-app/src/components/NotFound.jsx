import { useNavigate } from 'react-router-dom';
import { AlertCircle, ChevronLeft, Home } from 'lucide-react';

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="notfound-page">
      <div className="notfound-container">
        <div className="notfound-content">
          <div className="notfound-icon">
            <AlertCircle size={64} />
          </div>
          
          <h1>404</h1>
          <h2>Page Not Found</h2>
          <p>The page you're looking for doesn't exist or has been moved.</p>
          
          <div className="notfound-actions">
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

export default NotFound;