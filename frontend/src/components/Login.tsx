

export default function Login() {
    return (
        <div>
            <h2>Login Page</h2>
            <form>
                <div>
                    <label htmlFor="username">Username:</label>
                    <input type="text" id="username" name="username" />
                </div>
                <div>
                    <label htmlFor="password">Password:</label>
                    <input type="password" id="password" name="password" />
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