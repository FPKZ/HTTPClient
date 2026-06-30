
//ui
import { useEffect, useState } from "react";
import { 
    FolderOpen, 
    Folder, 
    FolderTree, 
    Box, 
    Check, 
    ChevronRight, 
    Braces, 
    PanelLeftClose, 
    PanelLeftOpen, 
    FilePlus, 
    FolderPlus,
    FolderClosed
} from "lucide-react";

//hooks
import { useNavigate } from "react-router-dom";

//interfaces
import useInterfaceStore from "@/core/store/useInterfaceStore";
import useTabStore from "@/core/store/useTabStore";
import useCollectionStore from "@/core/store/useCollectionStore";
import React from "react";
import useModalConfig from "./useModalConfig";

export default function useSideBar() {

    const navigate = useNavigate()

    const sideBarIsOpen = useInterfaceStore((state) => state.sideBarIsOpen);
    const activeSidebar = useInterfaceStore((state) => state.activeSidebar);
    const setActiveSidebar = useInterfaceStore((state) => state.setActiveSidebar);

    const {
        collection,
    } = useCollection();

    const { minSize, width } = useSidebarConfig()

    const { modalConfig, setModalConfig, handleModalAdd, getModalProps } = useModalConfig();

    const { Buttons } = useTemplateMenu()

    return {
        sidebar: {
            sideBarIsOpen,
            activeSidebar,
            setActiveSidebar,
            SidebarMenu: Buttons.find((button) => button.title === activeSidebar)?.menu || []
        },
        collection,
        Buttons,
        modal: {
            modalConfig,
            setModalConfig,
            handleModalAdd,
            getModalProps,
        },
        resize: {
            minSize,
            width,
        }
    }
}

function useSidebarConfig(){

    const { collection } = useCollection();

    const [width, setWidth] = useState(window.innerWidth);

    const minSize: string = collection
        ? "10%"
        : width <= 800
        ? "40%"
        : width <= 1200
        ? "30%"
        : "20%";
    
    useEffect(() => {
        const handleResize = () => setWidth(window.innerWidth);

        window.addEventListener("resize", handleResize);

        return () => window.removeEventListener("resize", handleResize);
    }, []);

    return {
        minSize,
        width
    }
}

function useCollection () {

    const collection = useCollectionStore((state) => state.collection.id);
    const addRoute = useCollectionStore((state) => state.addRoute);
    const addFolder = useCollectionStore((state) => state.addFolder);
    const renameItem = useCollectionStore((state) => state.renameItem);
    const fecharCollection = useCollectionStore((state) => state.resetCollection)

    return {
        collection,
        addRoute,
        addFolder,
        renameItem,
        fecharCollection
    }
}

function useTemplateMenu(){

    const { sideBarIsOpen, setActiveSidebar } = useInterfaceStore();
    
    const { collection, fecharCollection } = useCollection();

    const navigate = useNavigate();

    const { setModalConfig } = useModalConfig();

    const Buttons = [
        {
            icon: (active: boolean) =>
                active ? (
                    <FolderOpen strokeWidth={2.5} size={20} />
                ) : (
                    <Folder strokeWidth={2.5} size={20} />
                ),
            title: "collections",
            href: "/home",
            func: () => { setActiveSidebar("collections"); navigate("home"); },
            menu: [
                {
                    label: "Nova Pasta",
                    icon: <FolderPlus size={14} />,
                    disabled: !collection,
                    onClick: () => setModalConfig({ open: true, type: "folder", targetId: null }),
                },
                {
                    label: "Nova Rota",
                    icon: <FilePlus size={14} />,
                    disabled: !collection,
                    onClick: () => setModalConfig({ open: true, type: "file", targetId: null }),
                },
                {
                    separator: true,
                },
                {
                    label: "Fechar Collection",
                    icon: <FolderClosed size={14} />,
                    disabled: !collection,
                    onClick: () => fecharCollection(), 
                }
            ]
        },
        {
            icon: (active: boolean) => (
                <div className="flex flex-col items-center">
                    <Box className={active ? "fill-yellow-500" : `fill-zinc-400 group-hover:fill-yellow-400`} strokeWidth={2.5} size={10} />
                    <div className="flex">
                        <Box className={active ? "fill-yellow-500" : `fill-zinc-400 group-hover:fill-yellow-400`} strokeWidth={2.5} size={10} />
                        <Box className={active ? "fill-yellow-500" : `fill-zinc-400 group-hover:fill-yellow-400`} strokeWidth={2.5} size={10} />
                    </div>
                </div>
            ),
            title: "workspaces",
            href: "/workspaces",
            func: () => setActiveSidebar("workspaces"),
            menu: []
        },
    ];

    return {
        Buttons
    }
}