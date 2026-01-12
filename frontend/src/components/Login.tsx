import { jwtDecode } from 'jwt-decode';
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import axios from 'axios';
export default function Login() {
    const navigate = useNavigate();
    let { register, handleSubmit, formState: { errors } } = useForm({
        values: {
            username: "",
            password: ""
        }
    });
    async function login(data: { username: string, password: string }) {
        console.log(data);
        let res = await axios.post("http://localhost:8000/auth/login", data);
        console.log(res.data);
        const token = res.data["access_token"]
        if (token) {
            localStorage.setItem("access_token", token);
            const id: { user_id: number, exp: number } = jwtDecode(token);

            navigate(`/newgame/${id.user_id}`)
        }

    }
    return (
        <div>
            <h2>Login Page</h2>
            <form onSubmit={handleSubmit(login)}>
                <div>
                    <label htmlFor="username">Username:</label>
                    <input type="text" {...register("username")} id="username" name="username" />
                </div>
                <div>
                    {errors.password && <p>password is invalid</p>}
                    <label htmlFor="password">Password:</label>
                    <input type="password" {...register("password")} id="password" name="password" />
                </div>
                <div>
                    <input type="checkbox" id="remember" name="remember" />
                    <label htmlFor="remember">Remember Me</label>
                </div>
                <button type="submit">Login</button>

            </form>
        </div>
    );
}