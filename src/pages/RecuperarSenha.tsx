

export default function RecuperarSenha() {
    return (
        <div>
            <h1>Recuperar senha</h1>
            <form>
                <input type="text" placeholder="email" onChange={(e) => {

                }} />
                <button onClick={() => {
                    console.log("Recuperar senha");
                }}>Recuperar senha</button>
            </form>
        </div>
    );
}