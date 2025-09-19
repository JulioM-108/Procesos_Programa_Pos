import React, { useEffect, useState } from "react";
import { getUsuarioActual, enrollMFA, verifyMFA, getMfaFactors, unenrollMFA } from "./api";
import "./styles/UserInfo.css";

export default function UserInfo() {
  const [usuario, setUsuario] = useState(null);
  const [loading, setLoading] = useState(true);
  const [factors, setFactors] = useState([]);
  const [qrCode, setQrCode] = useState(null);
  const [factorId, setFactorId] = useState(null);
  const [mfaCode, setMfaCode] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchData() {
      const data = await getUsuarioActual();
      if (!data.error) setUsuario(data);
      else setError(data.error);

      const factorsData = await getMfaFactors();
      if (factorsData.success) setFactors(factorsData.factors);

      setLoading(false);
    }
    fetchData();
  }, []);

  const handleEnrollMFA = async () => {
    setError("");
    const result = await enrollMFA();
    if (result.success) {
      setQrCode(result.qr);
      setFactorId(result.factorId);
    } else {
      setError(result.error || "Error al generar código QR");
    }
  };

  const handleVerifyMFA = async () => {
    setError("");
    if (!mfaCode || !factorId) {
      setError("Ingrese el código MFA y asegúrese de haber generado un QR");
      return;
    }
    const result = await verifyMFA(factorId, mfaCode);
    if (result.success) {
      setQrCode(null);
      setFactorId(null);
      setMfaCode("");
      const factorsData = await getMfaFactors();
      if (factorsData.success) setFactors(factorsData.factors);
    } else {
      setError(result.error || "Código MFA inválido");
    }
  };

  const handleUnenrollMFA = async (factorId) => {
    setError("");
    const result = await unenrollMFA(factorId);
    if (result.success) {
      const factorsData = await getMfaFactors();
      if (factorsData.success) setFactors(factorsData.factors);
    } else {
      setError(result.error || "Error al eliminar MFA");
    }
  };

  if (loading) return <p>Cargando...</p>;
  if (!usuario) return <p>No se pudo obtener el usuario actual</p>;

  return (
    <div className="user-info-wrapper">
      <div className="user-info-card">
        <h2>Información del Usuario</h2>
        <p><strong>Nombre:</strong> {usuario.nombre}</p>
        <p><strong>Email:</strong> {usuario.email}</p>
        <p><strong>Rol:</strong> {usuario.rol === "administrador" ? "Administrador" : "Cajero"}</p>

        <h3>Autenticación Multifactor (MFA)</h3>
        <button className="mfa-btn" onClick={handleEnrollMFA}>Activar MFA</button>

        {qrCode && (
          <div className="mfa-qr">
            <p>Escanear con Google Authenticator:</p>
            <img src={qrCode} alt="Código QR para MFA" />
            <div className="mfa-input">
              <input
                type="text"
                placeholder="Código MFA (6 dígitos)"
                value={mfaCode}
                onChange={(e) => setMfaCode(e.target.value)}
              />
              <button onClick={handleVerifyMFA}>Verificar MFA</button>
            </div>
          </div>
        )}

        <h4>Factores MFA Activos</h4>
        {factors.length > 0 ? (
          <ul>
            {factors.map((factor) => (
              <li key={factor.id}>
                Factor ID: {factor.id} (Estado: {factor.status})
                <button className="unenroll-btn" onClick={() => handleUnenrollMFA(factor.id)}>Eliminar</button>
              </li>
            ))}
          </ul>
        ) : (
          <p>No hay factores MFA activos</p>
        )}

        {error && <p className="error">{error}</p>}
      </div>
    </div>
  );
}
