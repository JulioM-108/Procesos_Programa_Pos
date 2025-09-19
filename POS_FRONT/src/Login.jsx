import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createClient } from "@supabase/supabase-js";
import "./styles/Login.css"; 

const supabaseUrl = "https://xunxhvkgyirimhcwzzhj.supabase.co";
const supabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh1bnhodmtneWlyaW1oY3d6emhqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYwNzA5NzUsImV4cCI6MjA3MTY0Njk3NX0.ewDrdnuaB4Uz34mldXLhdqnTF1wNHSWQp3wZHA3O5tQ"; 
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mfaCode, setMfaCode] = useState("");
  const [needsMfa, setNeedsMfa] = useState(false);
  const [factorId, setFactorId] = useState(null);
  const [challengeId, setChallengeId] = useState(null); // ✅ Estado faltante
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false); // 🆕 Loading state
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      if (!needsMfa) {
        // Paso 1: login normal con email y password
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;

        // 🔍 DEBUG: Ver qué factores tiene el usuario
        console.log("User factors:", data?.user?.factors);
        console.log("Data completa:", data);

        // Verificar si el usuario tiene MFA habilitado
        if (data?.user && data.user.factors && data.user.factors.length > 0) {
          const firstFactor = data.user.factors[0];

          // Crear challenge para MFA
          const { data: challengeData, error: challengeError } =
            await supabase.auth.mfa.challenge({ factorId: firstFactor.id });

          if (challengeError) throw challengeError;

          // Guardar datos para el paso 2
          setFactorId(firstFactor.id);
          setChallengeId(challengeData.id);
          setNeedsMfa(true);
          return;
        }

        // Si no hay MFA, login directo
        if (data?.session) {
          localStorage.setItem("token", data.session.access_token);
          navigate("/Clientes");
        }
      } else {
        // Paso 2: verificar código MFA
        if (!mfaCode || mfaCode.length !== 6) {
          throw new Error("El código MFA debe tener 6 dígitos");
        }

        // 🔍 DEBUG: Ver qué datos estamos enviando
        console.log("Verificando MFA:", { factorId, challengeId, code: mfaCode });
        
        // 🚀 SOLUCIÓN: Crear nuevo challenge justo antes de verificar
        const { data: newChallenge, error: newChallengeError } = 
          await supabase.auth.mfa.challenge({ factorId });
        
        if (newChallengeError) {
          console.error("Error creando nuevo challenge:", newChallengeError);
          throw newChallengeError;
        }

        console.log("Nuevo challenge creado:", newChallenge.id);

        // Verificar inmediatamente después de crear el challenge
        const { data, error } = await supabase.auth.mfa.verify({
          factorId,
          challengeId: newChallenge.id,
          code: mfaCode,
        });

        if (error) {
          if (error.message.includes("Invalid TOTP code")) {
            throw new Error("Código incorrecto o expirado. Los códigos cambian cada 30 segundos.");
          }
          throw error;
        }

        // 🔍 DEBUG: Ver respuesta de verificación MFA
        console.log("Respuesta MFA verify:", data);

        // Login exitoso con MFA - verificar tanto session como access_token
        if (data?.access_token) {
          console.log("✅ MFA exitoso - guardando token y navegando");
          localStorage.setItem("token", data.access_token);
          navigate("/Clientes");
        } else if (data?.session) {
          console.log("✅ MFA exitoso - guardando session token y navegando");
          localStorage.setItem("token", data.session.access_token);
          navigate("/Clientes");
        } else {
          console.error("❌ No se encontró token en la respuesta:", data);
          throw new Error("No se recibió token de autenticación");
        }
      }
    } catch (err) {
      console.error("Error de login:", err);
      setError(err.message || "Error al iniciar sesión");
      
      // Reset MFA state en caso de error
      if (needsMfa) {
        // No resetear needsMfa para que el usuario pueda intentar otro código
        setMfaCode(""); // Solo limpiar el código
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h2 className="login-title">Iniciar sesión</h2>
        <form onSubmit={handleLogin}>
          {!needsMfa && (
            <>
              <input
                type="email"
                placeholder="Correo"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <input
                type="password"
                placeholder="Contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </>
          )}

          {needsMfa && (
            <div>
              <p>Ingresa el código de 6 dígitos de tu aplicación Google Authenticator:</p>
              <p style={{ fontSize: "12px", color: "#666", marginTop: "5px" }}>
                ⏱️ El código cambia cada 30 segundos. Usa el código más reciente.
              </p>
              <input
                type="text"
                placeholder="000000"
                value={mfaCode}
                onChange={(e) => {
                  // Solo permitir números y máximo 6 dígitos
                  const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                  setMfaCode(value);
                }}
                maxLength="6"
                required
                style={{ 
                  textAlign: "center", 
                  fontSize: "18px", 
                  letterSpacing: "2px",
                  fontFamily: "monospace"
                }}
              />
            </div>
          )}

          {error && <p style={{ color: "red" }}>{error}</p>}

          <button type="submit" disabled={isLoading}>
            {isLoading ? "Verificando..." : (needsMfa ? "Verificar MFA" : "Ingresar")}
          </button>

          {needsMfa && (
            <button 
              type="button" 
              onClick={() => {
                setNeedsMfa(false);
                setFactorId(null);
                setChallengeId(null);
                setMfaCode("");
                setError("");
              }}
              style={{ marginTop: "10px", backgroundColor: "#6c757d" }}
            >
              Cancelar
            </button>
          )}
        </form>
      </div>
    </div>
  );
}