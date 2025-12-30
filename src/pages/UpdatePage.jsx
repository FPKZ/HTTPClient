import { Spinner } from "react-bootstrap";
import { Progress } from "../components/ui/progress";
import { useEffect, useState } from "react";

export default function UpdatePage() {

    const [status, setStatus] = useState('checking'); // checking, available, downloading, ready
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        // Escutando eventos do Main Process
        // Registra os ouvintes e guarda a função de limpeza
        const removeAvailable = window.electronAPI.ipcRenderer.on('update-available', () => {
            setStatus('available');
        });

        const removeProgress = window.electronAPI.ipcRenderer.on('download-progress', (percent) => {
            setStatus('downloading');
            setProgress(percent);
        });

        const removeDownloaded = window.electronAPI.ipcRenderer.on('update-downloaded', () => {
            setStatus('ready');
        });

        // Limpeza ao desmontar o componente
        return () => {
            if (removeAvailable) removeAvailable();
            if (removeProgress) removeProgress();
            if (removeDownloaded) removeDownloaded();
        };
    }, []);

    // if (status === 'checking') return null;

    return (
        <div className="d-flex flex-column justify-content-center align-items-center h-100 gap-3 bg-[#1e1e1e]">
            <Spinner animation="border" role="status" />
            <div className="flex text-white">
                {status}
                <div>{}</div>
            </div>
            {status === 'downloading' && (
                <Progress value={progress} className="w-[60%] bg-[#777777] " progressColor="bg-[#f1f1f1]" />
            )}
        </div>
    );
}