import { useEffect, useState } from "react";
import EstruturaModal from "./EstruturaModal";

export default function RenameItemModal({ children, onAdd, id, initialName}) {

    const [name, setName] = useState(initialName);

    useEffect(() => {
        setName(initialName);
    }, [children]);

    return (
        <EstruturaModal 
            title="Renomear Item" 
            description="Insira o nome do item" 
            trigger={children} 
            onAdd={() => onAdd(id, name)}>
            <input
                type="text"
                placeholder="Nome do item"
                className="w-full p-2 border rounded mb-4 !border-zinc-800"
                onChange={(e) => setName(e.target.value)}
                value={name}
            />
        </EstruturaModal>
    )
}