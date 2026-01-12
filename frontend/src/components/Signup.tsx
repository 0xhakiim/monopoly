
import axios from 'axios';
import { useForm } from 'react-hook-form';

export default function Signup() {
    async function onSubmit(data: { username: string, password: string, email?: string }) {
        try {
            let res = await axios.post("http://127.0.0.1:8000/auth/register", data);
            localStorage.setItem("access_token", res.data["access_token"]);
            console.log(res.data);
        } catch (error) {
            console.error(error);
        }
    }
    const { register, handleSubmit, formState: { errors } } = useForm(
        {
            values: {
                username: "",
                password: ""
            }
        }
    );
    return (
        <>
            <form onSubmit={handleSubmit(onSubmit)}>
                {errors.username && <p className='color-red-400'>unvalid username</p>}
                <label htmlFor="username">username:</label>
                <input type="text" {...register("username", {
                    required: "username or email is required"
                })} name="username" className="bg-white border-2 text-black"
                />
                {errors.password && <p className='color-red-400 '>unvalid password</p>}
                <label htmlFor="password">password:</label>
                <input type="text" {...register("password", {
                    required: "Password is required",
                    minLength: {
                        value: 8,
                        message: "Password must be at least 8 characters"
                    }
                })} name="password" className="bg-white border-2 text-black" />
                <button type="submit" className="bg-white border-2">register</button>
            </form>
        </>
    )
}
