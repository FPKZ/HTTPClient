import TitleBar from "../components/TitleBar";

export default function Layout({ children }) {
    return (
        <div className="d-flex flex-column vh-100">
            <TitleBar />
            {children}
        </div>
    );
}