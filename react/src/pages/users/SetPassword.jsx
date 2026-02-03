import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import Spinner from '../../components/Spinner/Spinner';
import ToastNotify from '../../components/toast/toast';
import { postData } from '../../api';

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

const SetPassword = () => {
  const navigate = useNavigate();
  const params = useParams();
  const query = useQuery();
  const token = query.get('token') || params.token || '';

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [validToken, setValidToken] = useState(null); // null = checking, false = invalid, true = ok

  useEffect(() => {
    const validate = async () => {
      if (!token) {
        setValidToken(false);
        return;
      }
      setLoading(true);
      try {
        // Intentamos validar el token en el backend.
        // Endpoint asumido: POST /auth/validate-invite  { token }
        const res = await postData('auth/validate-invite', { token });
        setValidToken(!!res?.valid);
      } catch (err) {
        console.error('Error validando token', err);
        setValidToken(false);
      } finally {
        setLoading(false);
      }
    };
    validate();
  }, [token]);

  const handleSubmit = async () => {
    if (!password || password.length < 6) {
      ToastNotify({ message: 'La contraseña debe tener al menos 6 caracteres.', type: 'error', position: 'top-left' });
      return;
    }
    if (password !== confirm) {
      ToastNotify({ message: 'Las contraseñas no coinciden.', type: 'error', position: 'top-left' });
      return;
    }

    setLoading(true);
    try {
      // Endpoint asumido: POST /auth/set-password { token, password }
      const res = await postData('auth/set-password', { token, password });
      if (res) {
        ToastNotify({ message: 'Contraseña establecida. Inicia sesión.', type: 'success', position: 'top-left' });
        navigate('/login');
      } else {
        throw new Error('Respuesta inválida');
      }
    } catch (err) {
      console.error('Error al establecer contraseña', err);
      ToastNotify({ message: 'No se pudo establecer la contraseña. Intenta de nuevo.', type: 'error', position: 'top-left' });
    } finally {
      setLoading(false);
    }
  };

  if (loading && validToken === null) return <Spinner />;

  return (
    <div className="max-w-xl mx-auto mt-12 p-6 bg-white rounded shadow">
      <h2 className="text-xl font-semibold mb-4">Establecer contraseña</h2>
      {validToken === false && (
        <div className="text-red-600">
          Token inválido o expirado. Solicita al administrador que reenvíe la invitación.
        </div>
      )}
      {validToken === null && <div>Validando token...</div>}
      {validToken === true && (
        <>
          <div className="mb-3">
            <label className="font-semibold">Nueva contraseña</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="border rounded px-3 py-2 w-full"
            />
          </div>
          <div className="mb-3">
            <label className="font-semibold">Confirmar contraseña</label>
            <input
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              className="border rounded px-3 py-2 w-full"
            />
          </div>
          <div className="flex justify-end space-x-2">
            <button onClick={() => navigate('/')} className="bg-gray-300 px-4 py-2 rounded">Cancelar</button>
            <button onClick={handleSubmit} className="bg-blue-600 text-white px-4 py-2 rounded" disabled={loading}>
              {loading ? 'Procesando...' : 'Guardar contraseña'}
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default SetPassword;

