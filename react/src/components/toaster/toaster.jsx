import toast, { Toaster } from 'react-hot-toast';

const ToastNotify = ({ message, duration = 3000, position='top-center' }) => {
    toast(message, {
        duration: duration,
        position: position,
        style: {
          background: '#8080ff',
          color: 'white',
          opacity: '0.3'
        }
        
      });
 
      return null; // Este componente no renderiza nada en el DOM    
}

export default ToastNotify;
