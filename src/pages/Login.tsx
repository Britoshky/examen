import Auth from "../components/Auth";
export default function Login() {
  return (
    <div className="d-flex flex-column align-items-center justify-content-center w-100" style={{minHeight: '80vh'}}>
      <h2>Login / Registro</h2>
      <div className="mx-auto" style={{maxWidth: 400}}>
        <Auth />
      </div>
    </div>
  );
}
