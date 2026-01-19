import TitleBar from "../components/TitleBar";

export default function Layout({ children }) {
  return (
    <div className="d-flex flex-column vh-100 overflow-hidden">
      <TitleBar />
      <div className="flex-1 min-h-0 w-100">{children}</div>
    </div>
  );
}
