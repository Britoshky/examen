
import { useState } from "react";
import { auth } from "../firebase";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";
import { toast } from "react-toastify";

export function Auth() {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [isRegister, setIsRegister] = useState(false);
	const [loading, setLoading] = useState(false);
	const user = auth.currentUser;



	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoading(true);
		try {
			if (isRegister) {
				await createUserWithEmailAndPassword(auth, email, password);
				toast.success("Usuario registrado");
			} else {
				await signInWithEmailAndPassword(auth, email, password);
				toast.success("Sesión iniciada");
			}
		} catch (err: any) {
			toast.error(err.message);
		} finally {
			setLoading(false);
		}
	};





	if (user) {
		return (
			<div className="alert alert-success text-center">
				Sesión iniciada como <b>{user.email}</b>
			</div>
		);
	}

			return (
				<form className="card p-3 mb-3" onSubmit={handleSubmit} style={{maxWidth: 400}}>
					<h5 className="mb-3">{isRegister ? "Registro" : "Iniciar sesión"}</h5>
					<div className="mb-2">
						<input type="email" className="form-control" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required />
					</div>
					<div className="mb-2">
						<input type="password" className="form-control" placeholder="Contraseña" value={password} onChange={e => setPassword(e.target.value)} required />
					</div>

					<button className="btn btn-primary w-100 mb-2" type="submit" disabled={loading}>
						{loading ? "Procesando..." : isRegister ? "Registrarse" : "Entrar"}
					</button>
					<button type="button" className="btn btn-link w-100" onClick={() => setIsRegister(x => !x)}>
						{isRegister ? "¿Ya tienes cuenta? Inicia sesión" : "¿No tienes cuenta? Regístrate"}
					</button>
				</form>
			);
}

export default Auth;
