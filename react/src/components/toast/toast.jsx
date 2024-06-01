import { toast } from 'react-hot-toast';
import { createRoot } from 'react-dom/client';

const showToastNearRef = ({ message, ref, duration = 5000, type = '' }) => {
  if (ref && ref.current) {
    const rect = ref.current.getBoundingClientRect();
    const customPosition = {
      top: `${rect.top + window.scrollY - 30}px`,
      left: `${rect.left}px`,
    };

    const CustomToast = () => (
      <div
        style={{
          position: 'absolute',
          top: customPosition.top,
          left: customPosition.left,
          background: type === 'error' ? '#ff4d4f' : '#00C851',
          padding: '5px',
          borderRadius: '5px',
          textAlign: 'center',
          color: 'white',
          zIndex: 1000,
        }}
      >
        {message}
      </div>
    );

    // Create a container for the custom toast
    const container = document.createElement('div');
    document.body.appendChild(container);

    // Use createRoot instead of ReactDOM.render
    const root = createRoot(container);
    root.render(<CustomToast />);

    // Clean up the container after the toast duration
    setTimeout(() => {
      root.unmount();
      document.body.removeChild(container);
    }, duration);
  } else {
    const toastOptions = {
      duration,
      position: 'top-right',
    };

    if (type === 'error') {
      toast.error(message, toastOptions);
    } else if (type === 'success') {
      toast.success(message, toastOptions);
    } else {
      toast(message, toastOptions);
    }
  }
};

export default showToastNearRef;
